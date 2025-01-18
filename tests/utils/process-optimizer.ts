import * as cp from 'child_process';
import * as os from 'os';

export class ProcessOptimizer {
  private static instance: ProcessOptimizer;
  private processLimiter: Map<string, number> = new Map();
  private maxConcurrentProcesses: number;

  private constructor() {
    // Begrenze Prozesse auf 50% der CPU-Kerne
    this.maxConcurrentProcesses = Math.max(1, Math.floor(os.cpus().length / 2));
  }

  public static getInstance(): ProcessOptimizer {
    if (!ProcessOptimizer.instance) {
      ProcessOptimizer.instance = new ProcessOptimizer();
    }
    return ProcessOptimizer.instance;
  }

  /**
   * Sicheres Spawnen von Prozessen mit Ressourcen-Kontrolle
   * @param command Zu ausführender Befehl
   * @param args Befehlsargumente
   * @param options Zusätzliche Optionen
   */
  public safeSpawn(
    command: string, 
    args?: ReadonlyArray<string>, 
    options?: cp.SpawnOptionsWithoutStdio
  ): cp.ChildProcessWithoutNullStreams {
    // Prüfe Prozess-Limite
    this.checkProcessLimit(command);

    // Standardisiere Optionen
    const safeOptions = {
      ...options,
      stdio: 'pipe', // Minimiere externe Ressourcen
      detached: false, // Verhindere Zombie-Prozesse
    };

    // Spawne Prozess mit Timeouts und Fehlerbehandlung
    const process = cp.spawn(command, args, safeOptions);

    // Setze Timeout für lange laufende Prozesse
    const processTimeout = setTimeout(() => {
      if (process && !process.killed) {
        console.warn(`Process ${command} exceeded time limit`);
        process.kill();
      }
    }, 30000); // 30 Sekunden Timeout

    // Fehlerbehandlung
    process.on('error', (err) => {
      console.error(`Process error for ${command}:`, err);
      clearTimeout(processTimeout);
    });

    process.on('exit', (code, signal) => {
      clearTimeout(processTimeout);
      this.releaseProcessSlot(command);

      if (code !== 0) {
        console.warn(`Process ${command} exited with code ${code}, signal: ${signal}`);
      }
    });

    return process;
  }

  /**
   * Prüfe und begrenzte Prozess-Spawning
   * @param command Zu prüfender Befehl
   */
  private checkProcessLimit(command: string): void {
    const currentCommandCount = this.processLimiter.get(command) || 0;

    if (currentCommandCount >= this.maxConcurrentProcesses) {
      throw new Error(`Exceeded max concurrent processes for ${command}`);
    }

    this.processLimiter.set(command, currentCommandCount + 1);
  }

  /**
   * Gibt Prozess-Slot frei
   * @param command Befehl, dessen Slot freigegeben wird
   */
  private releaseProcessSlot(command: string): void {
    const currentCount = this.processLimiter.get(command) || 0;
    if (currentCount > 0) {
      this.processLimiter.set(command, currentCount - 1);
    }
  }

  /**
   * Debugging-Methode für Prozess-Tracking
   */
  public getProcessStats(): { [key: string]: number } {
    return Object.fromEntries(this.processLimiter);
  }
}

// Globale Konfiguration für Prozess-Optimierung
export const processOptimizer = ProcessOptimizer.getInstance();