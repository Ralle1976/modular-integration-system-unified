import { Octokit } from '@octokit/rest';
import { ModuleInterface } from '../../core/module-manager';
import { ConfigManager } from '../../core/config-manager';
import { Logger } from '../../core/logger';

export class GitHubModule implements ModuleInterface {
  public name: string = 'github';
  private config: ConfigManager;
  private logger: Logger;
  private client: Octokit | null = null;

  constructor() {
    this.config = ConfigManager.getInstance();
    this.logger = Logger.getInstance();
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
      this.logger.error('No GitHub token provided');
      return false;
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
      this.logger.error(`GitHub initialization failed: ${error}`);
      return false;
    }
  }

  public async shutdown(): Promise<void> {
    if (this.client) {
      this.logger.info('GitHub module shutting down');
      this.client = null;
    }
  }

  public async createRepository(name: string, options?: any): Promise<any> {
    if (!this.client) {
      throw new Error('GitHub client not initialized');
    }

    try {
      const response = await this.client.repos.createForAuthenticatedUser({
        name,
        ...options
      });
      
      this.logger.info(`Repository ${name} created successfully`);
      return response.data;
    } catch (error) {
      this.logger.error(`Error creating repository: ${error}`);
      throw error;
    }
  }

  public async listRepositories(username?: string): Promise<any[]> {
    if (!this.client) {
      throw new Error('GitHub client not initialized');
    }

    try {
      const response = username 
        ? await this.client.repos.listForUser({ username })
        : await this.client.repos.listForAuthenticatedUser();
      
      return response.data;
    } catch (error) {
      this.logger.error(`Error listing repositories: ${error}`);
      throw error;
    }
  }
}