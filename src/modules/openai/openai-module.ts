import OpenAI from 'openai';
import { ModuleInterface } from '../../core/module-manager';
import { ConfigManager } from '../../core/config-manager';
import { Logger } from '../../core/logger';
import { AdvancedErrorHandler, ErrorCategory, ErrorSeverity } from '../../core/advanced-error-handler';

export class OpenAIModule implements ModuleInterface {
  public name: string = 'openai';
  private config: ConfigManager;
  private logger: Logger;
  private errorHandler: AdvancedErrorHandler;
  private client: OpenAI | null = null;

  constructor() {
    this.config = ConfigManager.getInstance();
    this.logger = Logger.getInstance();
    this.errorHandler = AdvancedErrorHandler.getInstance();
  }

  public isEnabled(): boolean {
    return this.config.get('modules.openai.enabled', false) as boolean;
  }

  public async initialize(): Promise<boolean> {
    if (!this.isEnabled()) {
      this.logger.info('OpenAI module is disabled');
      return false;
    }

    const apiKey = this.config.get('OPENAI_API_KEY');
    
    if (!apiKey) {
      return this.handleInitializationError('No OpenAI API key provided');
    }

    try {
      this.client = new OpenAI({ apiKey });
      
      // Test connection
      await this.listModels();
      
      this.logger.info('OpenAI module initialized successfully');
      return true;
    } catch (error) {
      return this.handleInitializationError(error);
    }
  }

  private handleInitializationError(error: any): boolean {
    const detailedError = this.errorHandler.captureError(error, {
      category: ErrorCategory.AUTHENTICATION,
      severity: ErrorSeverity.HIGH,
      context: {
        module: this.name,
        additionalData: {
          apiKeyProvided: !!this.config.get('OPENAI_API_KEY')
        }
      }
    });

    this.logger.error(`OpenAI Module Initialization Failed: ${detailedError.message}`);
    return false;
  }

  public async listModels(): Promise<string[]> {
    if (!this.client) {
      return this.handleModelListError(new Error('OpenAI client not initialized'));
    }

    try {
      const models = await this.client.models.list();
      return models.data.map(model => model.id);
    } catch (error) {
      return this.handleModelListError(error);
    }
  }

  private handleModelListError(error: any): never {
    const detailedError = this.errorHandler.captureError(error, {
      category: ErrorCategory.EXTERNAL_SERVICE,
      severity: ErrorSeverity.MEDIUM,
      context: {
        module: this.name,
        additionalData: {
          clientInitialized: !!this.client
        }
      }
    });

    throw new Error(`OpenAI Model Listing Failed: ${detailedError.message}`);
  }

  public async generateText(prompt: string, options?: any): Promise<string> {
    if (!this.client) {
      return this.handleTextGenerationError(new Error('OpenAI client not initialized'));
    }

    const defaultOptions = {
      model: this.config.get('modules.openai.model', 'gpt-3.5-turbo'),
      max_tokens: this.config.get('modules.openai.maxTokens', 150)
    };

    try {
      const completion = await this.client.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        ...defaultOptions,
        ...options
      });

      return completion.choices[0].message.content || '';
    } catch (error) {
      return this.handleTextGenerationError(error);
    }
  }

  private handleTextGenerationError(error: any): never {
    const detailedError = this.errorHandler.captureError(error, {
      category: ErrorCategory.EXTERNAL_SERVICE,
      severity: ErrorSeverity.MEDIUM,
      context: {
        module: this.name,
        additionalData: {
          clientInitialized: !!this.client,
          modelUsed: this.config.get('modules.openai.model')
        }
      }
    });

    throw new Error(`OpenAI Text Generation Failed: ${detailedError.message}`);
  }

  public async shutdown(): Promise<void> {
    if (this.client) {
      this.logger.info('OpenAI module shutting down');
      this.client = null;
    }
  }
}