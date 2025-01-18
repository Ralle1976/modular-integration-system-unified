import OpenAI from 'openai';
import { ModuleInterface } from '../../core/module-manager';
import { ConfigManager } from '../../core/config-manager';
import { Logger } from '../../core/logger';

export class OpenAIModule implements ModuleInterface {
  public name: string = 'openai';
  private config: ConfigManager;
  private logger: Logger;
  private client: OpenAI | null = null;

  constructor() {
    this.config = ConfigManager.getInstance();
    this.logger = Logger.getInstance();
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
      this.logger.error('No OpenAI API key provided');
      return false;
    }

    try {
      this.client = new OpenAI({ apiKey });
      
      // Test connection
      await this.listModels();
      
      this.logger.info('OpenAI module initialized successfully');
      return true;
    } catch (error) {
      this.logger.error(`OpenAI initialization failed: ${error}`);
      return false;
    }
  }

  public async shutdown(): Promise<void> {
    if (this.client) {
      this.logger.info('OpenAI module shutting down');
      this.client = null;
    }
  }

  public async listModels(): Promise<string[]> {
    if (!this.client) {
      throw new Error('OpenAI client not initialized');
    }

    try {
      const models = await this.client.models.list();
      return models.data.map(model => model.id);
    } catch (error) {
      this.logger.error(`Error listing OpenAI models: ${error}`);
      throw error;
    }
  }

  public async generateText(prompt: string, options?: any): Promise<string> {
    if (!this.client) {
      throw new Error('OpenAI client not initialized');
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
      this.logger.error(`Error generating text: ${error}`);
      throw error;
    }
  }
}