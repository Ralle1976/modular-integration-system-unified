export class MonitoringService {
  recordMetric(category: string, name: string, value: number): void {
    console.log(`[${category}] ${name}: ${value}`);
    // Basis-Implementierung
  }
}