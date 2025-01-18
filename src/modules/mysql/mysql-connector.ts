import { createPool, Pool, PoolConnection } from 'mysql2/promise';
import { Logger } from '../../utils/logger';

export class MySQLConnector {
  private static instance: MySQLConnector;
  private pool: Pool;
  private logger: Logger;

  private constructor() {
    this.logger = Logger.getInstance();
    this.pool = createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });
  }

  public static getInstance(): MySQLConnector {
    if (!MySQLConnector.instance) {
      MySQLConnector.instance = new MySQLConnector();
    }
    return MySQLConnector.instance;
  }

  public async getConnection(): Promise<PoolConnection> {
    try {
      return await this.pool.getConnection();
    } catch (error) {
      this.logger.error('Failed to get database connection', { error });
      throw error;
    }
  }
}