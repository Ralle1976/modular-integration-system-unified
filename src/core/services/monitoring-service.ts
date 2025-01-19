export class MonitoringService {
  logMetric(metricName: string, value: number): void {
    // Implementierung der Metrikprotokollierung
    console.log(`Metric: ${metricName} = ${value}`);
  }

  logEvent(eventName: string, details?: any): void {
    // Implementierung der Ereignisprotokollierung
    console.log(`Event: ${eventName}`, details);
  }
}