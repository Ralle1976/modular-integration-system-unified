import { Octokit } from '@octokit/rest';
import * as fs from 'fs';
import * as path from 'path';

async function fetchGitHubWorkflowLogs() {
  // GitHub-Token aus Umgebungsvariablen oder Konfiguration
  const githubToken = process.env.GITHUB_TOKEN;
  
  if (!githubToken) {
    console.error('Kein GitHub-Token gefunden. Bitte setzen Sie GITHUB_TOKEN.');
    process.exit(1);
  }

  const octokit = new Octokit({ 
    auth: githubToken 
  });

  try {
    // Abrufen der letzten Workflow-Runs
    const { data } = await octokit.actions.listWorkflowRunsForRepo({
      owner: 'Ralle1976',
      repo: 'modular-integration-system-unified',
      per_page: 5
    });

    // Logs-Verzeichnis erstellen
    const logsDir = path.join(process.cwd(), 'logs', 'github-actions');
    fs.mkdirSync(logsDir, { recursive: true });

    // Analysieren und Speichern der Logs
    for (const run of data.workflow_runs) {
      if (run.conclusion === 'failure') {
        // Abrufen detaillierter Logs
        const logResponse = await octokit.actions.downloadWorkflowRunLogs({
          owner: 'Ralle1976',
          repo: 'modular-integration-system-unified',
          run_id: run.id
        });

        // Speichern der Logs
        const logFilePath = path.join(logsDir, `run-${run.id}-${run.name}-${run.conclusion}.log`);
        fs.writeFileSync(logFilePath, logResponse.data as any);

        console.log(`Log für fehlgeschlagenen Workflow gespeichert: ${logFilePath}`);
      }
    }
  } catch (error) {
    console.error('Fehler beim Abrufen der GitHub Actions Logs:', error);
    process.exit(1);
  }
}

fetchGitHubWorkflowLogs();