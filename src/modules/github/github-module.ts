import { Octokit } from '@octokit/rest';
import { ErrorHandler } from '../../core/error-handler';

interface GitHubConfig {
  token: string;
  owner: string;
  repo: string;
}

export class GitHubModule {
  private octokit: Octokit;
  private errorHandler: ErrorHandler;
  private config: GitHubConfig;

  constructor(config: GitHubConfig) {
    this.config = config;
    this.octokit = new Octokit({
      auth: config.token
    });
    this.errorHandler = new ErrorHandler('GitHubModule');
  }

  public async createIssue(
    title: string,
    body: string,
    labels?: string[]
  ): Promise<number> {
    try {
      const response = await this.octokit.issues.create({
        owner: this.config.owner,
        repo: this.config.repo,
        title,
        body,
        labels
      });

      return response.data.number;
    } catch (error) {
      if (error instanceof Error) {
        this.errorHandler.handleError(error);
      }
      throw error;
    }
  }
}