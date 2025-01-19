import { ConfigValidator, ValidationResult } from './services/config-validator';
import { DependencyContainer } from './services/dependency-container';
import { MonitoringService } from './services/monitoring-service';
import { EventBus } from './services/event-bus';
import { ErrorHandler } from './services/error-handler';
import { SystemMetrics } from './types/system-metrics';

export class ApplicationService {
    private configValidator: ConfigValidator;
    private dependencyContainer: DependencyContainer;
    private monitoringService: MonitoringService;
    private eventBus: EventBus;
    private errorHandler: ErrorHandler;

    constructor() {
        this.configValidator = new ConfigValidator();
        this.dependencyContainer = new DependencyContainer();
        this.monitoringService = new MonitoringService();
        this.eventBus = new EventBus();
        this.errorHandler = new ErrorHandler();

        this.initializeEventHandlers();
    }

    private initializeEventHandlers(): void {
        this.eventBus.subscribe('system:performance', (metrics: SystemMetrics) => {
            this.monitoringService.recordMetric('system', 'performance_metrics', metrics.value);
        });
    }

    public async initialize(): Promise<void> {
        try {
            const configValidation = await this.configValidator.validate();
            if (!configValidation.isValid) {
                throw new Error('Ungültige Konfiguration');
            }
        } catch (error) {
            this.errorHandler.handleError(error as Error);
            throw error;
        }
    }
}