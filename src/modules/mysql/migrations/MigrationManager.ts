import { MySQLConnection } from '../MySQLConnection';
import { Logger } from '../../../utils/Logger';
import { Migration } from './Migration';
import fs from 'fs/promises';
import path from 'path';

export class MigrationManager {
  private static instance: MigrationManager;
  private logger: Logger;
  private connection: MySQLConnection;
  private migrationsPath: string;

  private constructor(migrationsPath: string) {
    this.logger = new Logger('MigrationManager');
    this.connection = MySQLConnection.getInstance();
    this.migrationsPath = migrationsPath;
  }

  public static getInstance(migrationsPath?: string): MigrationManager {
    if (!MigrationManager.instance) {
      if (!migrationsPath) {
        throw new Error('migrationsPath must be provided when creating instance');
      }
      MigrationManager.instance = new MigrationManager(migrationsPath);
    }
    return MigrationManager.instance;
  }

  public async initialize(): Promise<void> {
    await this.createMigrationsTable();
  }

  private async createMigrationsTable(): Promise<void> {
    try {
      await this.connection.query(`
        CREATE TABLE IF NOT EXISTS migrations (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(255) NOT NULL UNIQUE,
          timestamp BIGINT NOT NULL,
          executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      this.logger.info('Migrations table initialized');
    } catch (error) {
      this.logger.error('Failed to create migrations table:', error);
      throw error;
    }
  }

  public async migrate(): Promise<void> {
    const files = await fs.readdir(this.migrationsPath);
    const migrationFiles = files.filter(f => f.endsWith('.js') || f.endsWith('.ts'));

    const executedMigrations = await this.getExecutedMigrations();
    
    for (const file of migrationFiles) {
      const migrationName = path.parse(file).name;
      
      if (!executedMigrations.includes(migrationName)) {
        try {
          const MigrationClass = require(path.join(this.migrationsPath, file)).default;
          const migration: Migration = new MigrationClass(migrationName);
          
          this.logger.info(`Executing migration: ${migrationName}`);
          await migration.execute();
          this.logger.info(`Successfully executed migration: ${migrationName}`);
        } catch (error) {
          this.logger.error(`Failed to execute migration ${migrationName}:`, error);
          throw error;
        }
      }
    }
  }

  public async rollback(steps: number = 1): Promise<void> {
    const executedMigrations = await this.getExecutedMigrations();
    const migrationsToRollback = executedMigrations.slice(-steps);

    for (const migrationName of migrationsToRollback.reverse()) {
      try {
        const file = await this.findMigrationFile(migrationName);
        const MigrationClass = require(file).default;
        const migration: Migration = new MigrationClass(migrationName);

        this.logger.info(`Rolling back migration: ${migrationName}`);
        await migration.rollback();
        this.logger.info(`Successfully rolled back migration: ${migrationName}`);
      } catch (error) {
        this.logger.error(`Failed to rollback migration ${migrationName}:`, error);
        throw error;
      }
    }
  }

  private async getExecutedMigrations(): Promise<string[]> {
    const result = await this.connection.query<Array<{ name: string }>>
      ('SELECT name FROM migrations ORDER BY executed_at');
    return result.map(row => row.name);
  }

  private async findMigrationFile(migrationName: string): Promise<string> {
    const files = await fs.readdir(this.migrationsPath);
    const migrationFile = files.find(f => 
      path.parse(f).name === migrationName && 
      (f.endsWith('.js') || f.endsWith('.ts'))
    );

    if (!migrationFile) {
      throw new Error(`Migration file not found for: ${migrationName}`);
    }

    return path.join(this.migrationsPath, migrationFile);
  }
}