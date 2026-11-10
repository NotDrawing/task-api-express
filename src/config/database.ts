import { setServers } from 'node:dns';
import mongoose from 'mongoose';

export interface DatabaseConfig {
  uri: string;
  dbName: string;
  dnsServers?: string[];
}

export const connectDatabase = async (config: DatabaseConfig): Promise<void> => {
  // Debe ejecutarse antes de conectar: la cadena mongodb+srv requiere que Node
  // resuelva el registro SRV, y el DNS de la red puede rechazar esa consulta.
  if (config.dnsServers && config.dnsServers.length > 0) {
    setServers(config.dnsServers);
  }

  await mongoose.connect(config.uri, {
    dbName: config.dbName,
    serverSelectionTimeoutMS: 5000,
  });

  console.log('Conexión con MongoDB establecida.');
};

export const disconnectDatabase = async (): Promise<void> => {
  await mongoose.disconnect();
  console.log('Conexión con MongoDB cerrada.');
};
