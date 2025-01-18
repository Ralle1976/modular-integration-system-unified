import { Logger } from './logger';
import { ConfigManager } from './config-manager';
import * as os from 'os';
import * as process from 'process';

interface SystemMetrics {
  cpuUsage: number;
  memoryUsage: {
    total: number;
    free: number;
    used: number;
    percentage: number;
  };
  uptime: number;
  loadAverage: number[];
}

interface ServiceMetric {
  name: string;
  value: number;
  timestamp: number;
  unit?: string;
}

export class MonitoringService {
  private static instance: MonitoringService;
  private logger: Logger;
  private config: ConfigManager;
  private metrics: Map<string, ServiceMetric[]> = new Map();
  private intervalId?: NodeJS.Timeout;

  private constructor() {
    this.logger = Logger.getInstance();
    this.config = ConfigManager.getInstance();
  }

  public static getInstance(): MonitoringService {
    if (!MonitoringService.instance) {
      MonitoringService.instance = new MonitoringService();
    }
    return MonitoringService.instance;
  }

  public getSystemMetrics(): SystemMetrics {
    const cpus = os.cpus();
    const totalCpus = cpus.length;
    const cpuUsage = cpus.reduce((acc, cpu) => {
      const total = Object.values(cpu.times).reduce((a, b) => a + b, 0);
      const idle = cpu.times.idle;
      return acc + (1 - idle / total);
    }, 0) / totalCpus * 100;

    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const usedMemory = totalMemory - freeMemory;

    return {
      cpuUsage,
      memoryUsage: {
        total: totalMemory,
        free: freeMemory,
        used: usedMemory,
        percentage: (usedMemory / totalMemory) * 100
      },
      uptime: process.uptime(),
      loadAverage: os.loadavg()
    };
  }

  public recordMetric(serviceName: string, metric: Omit<ServiceMetric, 'timestamp'>): void {
    const timestamp = Date.now();
    const fullMetric: ServiceMetric = { ...metric, timestamp };

    if (!this.metrics.has(serviceName)) {
      this.metrics.set(serviceName, []);
    }

    const serviceMetrics = this.metrics.get(serviceName)!;
    serviceMetrics.push(fullMetric);

    // Limit historical metrics to prevent memory growth
    if (serviceMetrics.length > 100) {
      serviceMetrics.shift();
    }
  }

  public getServiceMetrics(serviceName: string): ServiceMetric[] {
    return this.metrics.get(serviceName) || [];
  }

  public startPeriodicMonitoring(interval: number = 60000): void {
    if (this.intervalId) {
      this.stopPeriodicMonitoring();
    }

    this.intervalId = setInterval(() => {
      const systemMetrics = this.getSystemMetrics();
      
      this.recordMetric('system', {
        name: 'cpu_usage',
        value: systemMetrics.cpuUsage,
        unit: '%'
      });

      this.recordMetric('system', {
        name: 'memory_usage',
        value: systemMetrics.memoryUsage.percentage,
        unit: '%'
      });

      this.logger.info(`System Metrics - CPU: ${systemMetrics.cpuUsage.toFixed(2)}%, Memory: ${systemMetrics.memoryUsage.percentage.toFixed(2)}%`);

      // Additional monitoring logic can be added here
    }, interval);

    this.logger.info(`Periodic monitoring started with interval ${interval}ms`);
  }

  public stopPeriodicMonitoring(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
      this.logger.info('Periodic monitoring stopped');
    }
  }

  public generateHealthReport(): {
    isHealthy: boolean;
    systemMetrics: SystemMetrics;
    serviceMetrics: Record<string, ServiceMetric[]>;
  } {
    const systemMetrics = this.getSystemMetrics();
    const serviceMetrics: Record<string, ServiceMetric[]> = {};

    this.metrics.forEach((metrics, serviceName) => {
      serviceMetrics[serviceName] = metrics;
    });

    const isHealthy = 
      systemMetrics.cpuUsage < 80 && 
      systemMetrics.memoryUsage.percentage < 90;

    return {
      isHealthy,
      systemMetrics,
      serviceMetrics
    };
  }

  public clearMetrics(serviceName?: string): void {
    if (serviceName) {
      this.metrics.delete(serviceName);
      this.logger.info(`Metrics cleared for service: ${serviceName}`);
    } else {
      this.metrics.clear();
      this.logger.info('All metrics cleared');
    }
  }
}