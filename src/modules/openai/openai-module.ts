import { Configuration, OpenAIApi } from 'openai';
import { Logger } from '../../core/logger';
import { ErrorHandler } from '../../core/error-handler';

export class OpenAIModule {
  private static instance: OpenAIModule;
  private openai: OpenAIApi;
  private logger: Logger;
  private errorHandler: ErrorHandler;

  protected constructor() {
    this.logger = Logger.getInstance();
    this.errorHandler = ErrorHandler.getInstance();
    
    const configuration = new Configuration({
      apiKey: process.env.OPENAI_API_KEY,
    });
    this.openai = new OpenAIApi(configuration);
  }

  public static getInstance(): OpenAIModule {
    if (!OpenAIModule.instance) {
      OpenAIModule.instance = new OpenAIModule();
    }
    return OpenAIModule.instance;
  }

  public async generateText(prompt: string, options: {
    maxTokens?: number;
    temperature?: number;
    model?: string;
  } = {}): Promise<string> {
    try {
      const response = await this.openai.createCompletion({
        model: options.model || 'text-davinci-003',
        prompt: prompt,
        max_tokens: options.maxTokens || 100,
        temperature: options.temperature || 0.7
      });

      return response.data.choices[0]?.text || '';
    } catch (error) {
      this.logger.error('Failed to generate text', { error });
      throw error;
    }
  }
}