import { Octokit } from '@octokit/rest';
import { ModuleInterface } from '../../core/module-manager';
import { ConfigManager } from '../../core/config-manager';
import { Logger } from '../../core/logger';
import { AdvancedErrorHandler, ErrorCategory, ErrorSeverity } from '../../core/advanced-error-handler';

export class GitHubModule implements ModuleInterface {
  public name: string = 'github';
  private config: ConfigManager;
  private logger: Logger;
  private errorHandler: AdvancedErrorHandler;
  private client: Octokit | null = null;

  constructor() {
    this.config = ConfigManager.getInstance();
    this.logger = Logger.getInstance();
    this.errorHandler = AdvancedErrorHandler.getInstance();
  }

  public isEnabled(): boolean {
    return this.config.get('modules.github.enabled', false) as boolean;
  }

  public async initialize(): Promise<boolean> {
    if (!this.isEnabled()) {
      this.logger.info('GitHub module is disabled');
      return false;
    }

    const token = this.config.get('GITHUB_TOKEN');
    
    if (!token) {
      return this.handleInitializationError('No GitHub token provided');
    }

    try {
      this.client = new Octokit({ 
        auth: token,
        userAgent: 'ModularIntegrationSystem/1.0'
      });

      // Test authentication
      await this.client.users.getAuthenticated();
      
      this.logger.info('GitHub module initialized successfully');
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
          tokenProvided: !!this.config.get('GITHUB_TOKEN')
        }
      }
    });

    this.logger.error(`GitHub Module Initialization Failed: ${detailedError.message}`);
    return false;
  }

  public async createRepository(name: string, options?: any): Promise<any> {
    if (!this.client) {
      return this.handleRepositoryError(new Error('GitHub client not initialized'));
    }

    try {
      const response = await this.client.repos.createForAuthenticatedUser({
        name,
        ...options
      });
      
      this.logger.info(`Repository ${name} created successfully`);
      return response.data;
    } catch (error) {
      return this.handleRepositoryError(error);
    }
  }

  private handleRepositoryError(error: any): never {
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

    throw new Error(`GitHub Repository Creation Failed: ${detailedError.message}`);
  }

  public async listRepositories(username?: string): Promise<any[]> {
    if (!this.client) {
      return this.handleListRepositoriesError(new Error('GitHub client not initialized'));
    }

    try {
      const response = username 
        ? await this.client.repos.listForUser({ username })
        : await this.client.repos.listForAuthenticatedUser();
      
      return response.data;
    } catch (error) {
      return this.handleListRepositoriesError(error);
    }
  }

  private handleListRepositoriesError(error: any): never {
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

    throw new Error(`GitHub Repository Listing Failed: ${detailedError.message}`);
  }

  public async shutdown(): Promise<void> {
    if (this.client) {
      this.logger.info('GitHub module shutting down');
      this.client = null;
    }
  }
}