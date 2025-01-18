import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

export class ConfigManager {
  private static instance: ConfigManager;
  private config: Record<string, unknown> = {};

  private constructor() {
    this.loadEnvironmentConfig();
    this.loadFileConfig();
  }

  public static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  private loadEnvironmentConfig(): void {
    dotenv.config();
    Object.keys(process.env).forEach(key => {
      this.config[key] = process.env[key];
    });
  }

  private loadFileConfig(): void {
    const configPath = path.resolve(process.cwd(), 'config', 'config.json');
    
    try {
      if (fs.existsSync(configPath)) {
        const fileConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        this.config = { ...this.config, ...fileConfig };
      }
    } catch (error) {
      console.error('Error loading configuration file:', error);
    }
  }

  public get<T>(key: string, defaultValue?: T): T | undefined {
    return this.config[key] as T ?? defaultValue;
  }

  public getAll(): Record<string, unknown> {
    return { ...this.config };
  }
}