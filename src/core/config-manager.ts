import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import { Logger } from './logger';

export interface Config {
  [key: string]: string | number | boolean;
}

export class ConfigManager {
  private static instance: ConfigManager;
  private logger: Logger;
  private config: Config = {};

  private constructor() {
    this.logger = new Logger('ConfigManager');
    this.loadConfiguration();
  }

  public static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  private loadConfiguration(): void {
    // Laden der Umgebungsvariablen
    dotenv.config();

    // Standardkonfiguration
    const defaultConfigPath = path.resolve(process.cwd(), 'config', 'default.json');
    const environmentConfigPath = path.resolve(
      process.cwd(), 
      'config', 
      `${process.env.NODE_ENV || 'development'}.json`
    );

    try {
      // Laden der Standardkonfiguration
      if (fs.existsSync(defaultConfigPath)) {
        const defaultConfig = JSON.parse(fs.readFileSync(defaultConfigPath, 'utf8'));
        this.config = { ...this.config, ...defaultConfig };
      }

      // Laden der umgebungsspezifischen Konfiguration
      if (fs.existsSync(environmentConfigPath)) {
        const envConfig = JSON.parse(fs.readFileSync(environmentConfigPath, 'utf8'));
        this.config = { ...this.config, ...envConfig };
      }

      // Umgebungsvariablen haben die höchste Priorität
      this.config = { 
        ...this.config, 
        ...process.env 
      };

      this.logger.info('Konfiguration erfolgreich geladen', { 
        configFiles: [defaultConfigPath, environmentConfigPath].filter(fs.existsSync) 
      });
    } catch (error) {
      this.logger.error('Fehler beim Laden der Konfiguration', error);
      throw new Error('Konfiguration konnte nicht geladen werden');
    }
  }

  public get<T>(key: string, defaultValue?: T): T {
    const value = this.config[key];
    
    if (value === undefined && defaultValue === undefined) {
      this.logger.warn(`Konfigurationsschlüssel nicht gefunden: ${key}`);
      throw new Error(`Konfigurationsschlüssel nicht gefunden: ${key}`);
    }

    return (value ?? defaultValue) as T;
  }

  public set(key: string, value: string | number | boolean): void {
    this.config[key] = value;
    this.logger.info(`Konfigurationsschlüssel aktualisiert`, { key, value });
  }
}