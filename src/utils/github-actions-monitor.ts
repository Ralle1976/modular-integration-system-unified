import { Octokit } from '@octokit/rest';
import { Logger } from '../core/logger';
import { ConfigManager } from '../core/config-manager';

interface WorkflowRunStatus {
  id: number;
  name: string;
  status: string;
  conclusion: string;
  html_url: string;
  created_at: string;
}

export class GitHubActionsMonitor {
  private octokit: Octokit;
  private logger: Logger;
  private configManager: ConfigManager;

  constructor() {
    this.logger = new Logger('GitHubActionsMonitor');
    this.configManager = ConfigManager.getInstance();
    
    const githubToken = this.configManager.get<string>('GITHUB_TOKEN');
    
    if (!githubToken) {
      throw new Error('GitHub Token ist nicht konfiguriert');
    }

    this.octokit = new Octokit({ 
      auth: githubToken 
    });
  }

  public async checkWorkflowRuns(): Promise<WorkflowRunStatus[]> {
    try {
      const owner = this.configManager.get<string>('GITHUB_OWNER', 'Ralle1976');
      const repo = this.configManager.get<string>('GITHUB_REPO', 'modular-integration-system-unified');

      const { data } = await this.octokit.actions.listWorkflowRuns({
        owner,
        repo,
        per_page: 10  // Letzte 10 Workflow-Runs
      });

      const failedRuns = data.workflow_runs.filter(run => 
        run.conclusion === 'failure'
      );

      if (failedRuns.length > 0) {
        this.logger.error('Fehlerhafte GitHub Actions gefunden', { 
          failedRunCount: failedRuns.length 
        });

        failedRuns.forEach(run => {
          this.logger.error(`Fehlgeschlagener Workflow: ${run.name}`, {
            runId: run.id,
            status: run.status,
            conclusion: run.conclusion,
            url: run.html_url
          });
        });
      }

      return failedRuns;
    } catch (error) {
      this.logger.error('Fehler beim Abrufen der Workflow-Runs', error);
      throw error;
    }
  }

  public async createIssueForFailedRuns(): Promise<void> {
    const failedRuns = await this.checkWorkflowRuns();

    if (failedRuns.length > 0) {
      const issueBody = failedRuns.map(run => 
        `### Fehlgeschlagener Workflow: ${run.name}
- Status: ${run.conclusion}
- Zeitpunkt: ${run.created_at}
- Details: [Workflow-Run Link](${run.html_url})
`
      ).join('\n\n');

      try {
        await this.octokit.issues.create({
          owner: this.configManager.get<string>('GITHUB_OWNER', 'Ralle1976'),
          repo: this.configManager.get<string>('GITHUB_REPO', 'modular-integration-system-unified'),
          title: 'Fehlerhafte GitHub Actions Workflows',
          body: `## Fehlgeschlagene Workflows detected

Die folgenden Workflows sind in den letzten Runs fehlgeschlagen:

${issueBody}

**Bitte überprüfen und beheben Sie diese Workflows.**`,
          labels: ['bug', 'ci', 'github-actions']
        });

        this.logger.info('Issue für fehlgeschlagene Workflows erstellt');
      } catch (issueError) {
        this.logger.error('Fehler beim Erstellen des Issues', issueError);
      }
    }
  }

  public async monitorAndReact(): Promise<void> {
    try {
      await this.checkWorkflowRuns();
      await this.createIssueForFailedRuns();
    } catch (error) {
      this.logger.error('Fehler im GitHub Actions Monitoring', error);
    }
  }
}