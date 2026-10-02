import 'dotenv/config';
import { setServers } from 'node:dns';
import { app } from './app.js';
import { connectDatabase } from './config/database.js';
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
const startServer = async (): Promise<void> => {
    try {
        configureDns();
        const env = loadEnvironment();
        await connectDatabase({
            uri: env.mongodbUri,
            dbName: env.mongodbDbName
        });
        app.listen(env.port, () => {
            console.log(`API disponible en http://localhost:${env.port}`);
        });
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
