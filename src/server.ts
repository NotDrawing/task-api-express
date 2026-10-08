import 'dotenv/config';
import { setServers } from 'node:dns';
import { app } from './app.js';
import { connectDatabase, disconnectDatabase } from './config/database.js';
import { loadEnvironment } from './config/env.js';
const configureDns = (): void => {
    const servers = process.env.MONGODB_DNS_SERVERS
        ?.split(',')
        .map((server) => server.trim())
        .filter((server) => server.length > 0);
    if (servers && servers.length > 0) {
        setServers(servers);
    }
};
let shuttingDown = false;
const registerShutdown = (
    closeServer: (callback: (error?: Error) => void) => void
): void => {
    const shutdown = async (signal: string): Promise<void> => {
        if (shuttingDown) {
            return;
        }
        shuttingDown = true;
        console.log(`Señal ${signal} recibida. Cerrando la API...`);
        try {
            await new Promise<void>((resolve, reject) => {
                closeServer((error?: Error) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve();
                    }
                });
            });
            await disconnectDatabase();
        } catch {
            console.error('Ocurrió un problema durante el cierre de la API.');
            process.exitCode = 1;
        }
    };
    process.once('SIGINT', () => {
        void shutdown('SIGINT');
    });
    process.once('SIGTERM', () => {
        void shutdown('SIGTERM');
    });
};
const startServer = async (): Promise<void> => {
    try {
        configureDns();
        const env = loadEnvironment();
        await connectDatabase({
            uri: env.mongodbUri,
            dbName: env.mongodbDbName
        });
        const server = app.listen(env.port, () => {
            console.log(`API disponible en http://localhost:${env.port}`);
        });
        registerShutdown(server.close.bind(server));
    } catch (error) {
        console.error(
            'No fue posible iniciar la API. Revise MONGODB_URI, ' +
            'el usuario y la lista de acceso de red.'
        );
        console.error(error);
        process.exitCode = 1;
    }
};
void startServer();
