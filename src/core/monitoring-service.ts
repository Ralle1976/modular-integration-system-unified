import { EventEmitter } from 'events';
import { Logger } from './logger';

interface SystemMetrics {
  cpuUsage: number;
  memoryUsage: number;
  activeConnections: number;
  requestsPerSecond: number;
  lastUpdated: Date;
}

interface HealthStatus {
  healthy: boolean;
  message: string;
  lastChecked: Date;
}

export class MonitoringService extends EventEmitter {
  private logger: Logger;
  private metrics: SystemMetrics;
  private healthChecks: Map<string, () => Promise<HealthStatus>>;
  private metricsUpdateInterval: ReturnType<typeof setInterval> | null;
  private readonly updateInterval: number;

  constructor(updateIntervalMs = 5000) {
    super();
    this.logger = new Logger();
    this.updateInterval = updateIntervalMs;
    this.healthChecks = new Map();
    this.metricsUpdateInterval = null;
    this.metrics = {
      cpuUsage: 0,
      memoryUsage: 0,
      activeConnections: 0,
      requestsPerSecond: 0,
      lastUpdated: new Date()
    };
  }

  public start(): void {
    if (this.metricsUpdateInterval) {
      this.logger.warn('Monitoring service is already running');
      return;
    }

    this.metricsUpdateInterval = setInterval(
      () => this.updateMetrics(),
      this.updateInterval
    );

    this.logger.info('Monitoring service started');
  }

  public stop(): void {
    if (this.metricsUpdateInterval) {
      clearInterval(this.metricsUpdateInterval);
      this.metricsUpdateInterval = null;
      this.logger.info('Monitoring service stopped');
    }
  }

  public registerHealthCheck(
    name: string, 
    checkFn: () => Promise<HealthStatus>
  ): void {
    this.healthChecks.set(name, checkFn);
  }

  public removeHealthCheck(name: string): void {
    this.healthChecks.delete(name);
  }

  public async performHealthChecks(): Promise<Map<string, HealthStatus>> {
    const results = new Map<string, HealthStatus>();

    for (const [name, checkFn] of this.healthChecks.entries()) {
      try {
        const status = await checkFn();
        results.set(name, status);
      } catch (error) {
        results.set(name, {
          healthy: false,
          message: error instanceof Error ? error.message : 'Unknown error',
          lastChecked: new Date()
        });
      }
    }

    return results;
  }

  private async updateMetrics(): Promise<void> {
    try {
      // Hier würden in einer echten Implementierung die Metriken aktualisiert
      this.metrics = {
        cpuUsage: Math.random() * 100,
        memoryUsage: Math.random() * 100,
        activeConnections: Math.floor(Math.random() * 1000),
        requestsPerSecond: Math.floor(Math.random() * 100),
        lastUpdated: new Date()
      };

      this.emit('metricsUpdated', this.metrics);
    } catch (error) {
      this.logger.error('Error updating metrics:', error);
    }
  }

  public getMetrics(): SystemMetrics {
    return { ...this.metrics };
  }

  public isRunning(): boolean {
    return this.metricsUpdateInterval !== null;
  }

  public getHealthCheckCount(): number {
    return this.healthChecks.size;
  }
}