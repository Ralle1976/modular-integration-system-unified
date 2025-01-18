import { Logger } from './logger';
import { ConfigManager } from './config-manager';
import * as Joi from 'joi';

export class ConfigValidator {
  private static instance: ConfigValidator;
  private logger: Logger;
  private config: ConfigManager;

  private constructor() {
    this.logger = Logger.getInstance();
    this.config = ConfigManager.getInstance();
  }

  public static getInstance(): ConfigValidator {
    if (!ConfigValidator.instance) {
      ConfigValidator.instance = new ConfigValidator();
    }
    return ConfigValidator.instance;
  }

  private baseConfigSchema = Joi.object({
    application: Joi.object({
      name: Joi.string().required(),
      version: Joi.string().required(),
      environment: Joi.string().valid('development', 'production', 'test').required(),
      debug: Joi.boolean().default(false)
    }).required(),

    modules: Joi.object({
      mysql: Joi.object({
        enabled: Joi.boolean().default(false),
        host: Joi.string().when('enabled', { 
          is: true, 
          then: Joi.string().required(), 
          otherwise: Joi.string() 
        }),
        port: Joi.number().integer().min(1).max(65535).default(3306),
        database: Joi.string().when('enabled', { 
          is: true, 
          then: Joi.string().required(), 
          otherwise: Joi.string() 
        }),
        maxConnections: Joi.number().integer().min(1).default(10)
      }),

      github: Joi.object({
        enabled: Joi.boolean().default(false),
        apiVersion: Joi.string().default('v3')
      }),

      openai: Joi.object({
        enabled: Joi.boolean().default(false),
        model: Joi.string().default('gpt-3.5-turbo'),
        maxTokens: Joi.number().integer().min(1).max(4096).default(1000)
      }),

      googleDrive: Joi.object({
        enabled: Joi.boolean().default(false),
        scope: Joi.string().default('https://www.googleapis.com/auth/drive')
      })
    }),

    logging: Joi.object({
      level: Joi.string().valid('error', 'warn', 'info', 'debug').default('info'),
      format: Joi.string().valid('json', 'text').default('json'),
      maxFiles: Joi.number().integer().min(1).default(5),
      maxSize: Joi.alternatives().try(
        Joi.string().pattern(/^\d+[kMG]$/),
        Joi.number().integer()
      ).default('10M')
    }),

    security: Joi.object({
      corsEnabled: Joi.boolean().default(true),
      allowedOrigins: Joi.array().items(Joi.string().uri()).default(['http://localhost:3000']),
      rateLimiting: Joi.object({
        windowMs: Joi.number().integer().min(1000).default(15 * 60 * 1000),
        max: Joi.number().integer().min(1).default(100)
      })
    })
  });

  public validateConfiguration(configData?: any): { 
    isValid: boolean; 
    errors?: Joi.ValidationError; 
    config?: any 
  } {
    const configToValidate = configData || this.config.getAll();

    const { error, value } = this.baseConfigSchema.validate(configToValidate, {
      abortEarly: false,
      convert: true
    });

    if (error) {
      this.logger.error('Configuration validation failed', {
        errors: error.details.map(detail => detail.message)
      });

      return {
        isValid: false,
        errors: error
      };
    }

    this.logger.info('Configuration validated successfully');
    return {
      isValid: true,
      config: value
    };
  }

  public sanitizeConfiguration(configData?: any): any {
    const validationResult = this.validateConfiguration(configData);

    if (!validationResult.isValid) {
      throw new Error('Cannot sanitize invalid configuration');
    }

    return validationResult.config;
  }

  public generateDefaultConfiguration(): any {
    const { value } = this.baseConfigSchema.validate({});
    return value;
  }

  public validateEnvironmentVariables(): { 
    isValid: boolean; 
    errors?: string[] 
  } {
    const requiredEnvVars = [
      'JWT_SECRET',
      'MYSQL_HOST',
      'MYSQL_PASSWORD'
    ];

    const missingEnvVars = requiredEnvVars.filter(envVar => 
      !process.env[envVar]
    );

    if (missingEnvVars.length > 0) {
      this.logger.error('Missing required environment variables', {
        missingVars: missingEnvVars
      });

      return {
        isValid: false,
        errors: missingEnvVars.map(v => `Missing environment variable: ${v}`)
      };
    }

    return { isValid: true };
  }
}