import * as mysql from 'mysql2/promise';
import { ConfigManager } from '../../core/config-manager';
import { Logger } from '../../core/logger';

export class MySQLConnector {
  private static instance: MySQLConnector;
  private connection: mysql.Connection | null = null;
  private logger = Logger.getInstance();
  private config = ConfigManager.getInstance();

  private constructor() {}

  public static getInstance(): MySQLConnector {
    if (!MySQLConnector.instance) {
      MySQLConnector.instance = new MySQLConnector();
    }
    return MySQLConnector.instance;
  }

  public async connect(): Promise<void> {
    try {
      this.connection = await mysql.createConnection({
        host: this.config.get('MYSQL_HOST', 'localhost'),
        user: this.config.get('MYSQL_USER', 'root'),
        password: this.config.get('MYSQL_PASSWORD', ''),
        database: this.config.get('MYSQL_DATABASE', 'modular_integration')
      });

      this.logger.info('MySQL connection established successfully');
    } catch (error) {
      this.logger.error(`MySQL connection error: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  public async query<T>(sql: string, params?: unknown[]): Promise<T[]> {
    if (!this.connection) {
      await this.connect();
    }

    try {
      const [results] = await this.connection!.execute(sql, params);
      return results as T[];
    } catch (error) {
      this.logger.error(`MySQL query error: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  public async close(): Promise<void> {
    if (this.connection) {
      await this.connection.end();
      this.logger.info('MySQL connection closed');
      this.connection = null;
    }
  }
}