import * as fs from 'fs';
import * as path from 'path';

export enum TestErrorSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export interface TestErrorDetails {
  id: string;
  timestamp: number;
  testName: string;
  errorMessage: string;
  stackTrace?: string;
  severity: TestErrorSeverity;
  additionalContext?: Record<string, any>;
}

export class TestErrorHandler {
  private static instance: TestErrorHandler;
  private errorLog: TestErrorDetails[] = [];
  private errorLogPath: string;

  private constructor() {
    const logDir = path.resolve(process.cwd(), 'logs', 'test-errors');
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    this.errorLogPath = path.join(logDir, `test-errors-${Date.now()}.json`);
  }

  public static getInstance(): TestErrorHandler {
    if (!TestErrorHandler.instance) {
      TestErrorHandler.instance = new TestErrorHandler();
    }
    return TestErrorHandler.instance;
  }

  public captureTestError(
    error: Error, 
    testName: string, 
    options: {
      severity?: TestErrorSeverity;
      additionalContext?: Record<string, any>;
    } = {}
  ): TestErrorDetails {
    const errorDetails: TestErrorDetails = {
      id: this.generateErrorId(),
      timestamp: Date.now(),
      testName,
      errorMessage: error.message,
      stackTrace: error.stack,
      severity: options.severity || this.determineSeverity(error),
      additionalContext: options.additionalContext
    };

    this.errorLog.push(errorDetails);
    this.logErrorToFile(errorDetails);
    this.handleErrorBySeverity(errorDetails);

    return errorDetails;
  }

  private generateErrorId(): string {
    return `TEST-ERR-${Math.random().toString(36).substr(2, 9)}-${Date.now()}`;
  }

  private determineSeverity(error: Error): TestErrorSeverity {
    // Beispielhafte Schweregradbestimmung
    if (error.message.includes('timeout')) return TestErrorSeverity.HIGH;
    if (error.message.includes('assertion')) return TestErrorSeverity.MEDIUM;
    return TestErrorSeverity.LOW;
  }

  private logErrorToFile(errorDetails: TestErrorDetails): void {
    try {
      const existingErrors = this.readExistingErrorLog();
      existingErrors.push(errorDetails);
      
      fs.writeFileSync(
        this.errorLogPath, 
        JSON.stringify(existingErrors, null, 2)
      );
    } catch (logError) {
      console.error('Error logging failed', logError);
    }
  }

  private readExistingErrorLog(): TestErrorDetails[] {
    try {
      if (fs.existsSync(this.errorLogPath)) {
        const fileContent = fs.readFileSync(this.errorLogPath, 'utf8');
        return fileContent ? JSON.parse(fileContent) : [];
      }
      return [];
    } catch {
      return [];
    }
  }

  private handleErrorBySeverity(errorDetails: TestErrorDetails): void {
    switch (errorDetails.severity) {
      case TestErrorSeverity.CRITICAL:
        console.error(`CRITICAL TEST ERROR: ${errorDetails.testName}`);
        // Mögliche zusätzliche Aktionen wie Benachrichtigungen
        break;
      case TestErrorSeverity.HIGH:
        console.warn(`HIGH SEVERITY TEST ERROR: ${errorDetails.testName}`);
        break;
      case TestErrorSeverity.MEDIUM:
        console.log(`MEDIUM SEVERITY TEST ERROR: ${errorDetails.testName}`);
        break;
      default:
        console.info(`LOW SEVERITY TEST ERROR: ${errorDetails.testName}`);
    }
  }

  public getErrorSummary(): {
    total: number;
    bySeverity: Record<TestErrorSeverity, number>;
  } {
    const summary = {
      total: this.errorLog.length,
      bySeverity: {
        [TestErrorSeverity.LOW]: 0,
        [TestErrorSeverity.MEDIUM]: 0,
        [TestErrorSeverity.HIGH]: 0,
        [TestErrorSeverity.CRITICAL]: 0
      }
    };

    this.errorLog.forEach(error => {
      summary.bySeverity[error.severity]++;
    });

    return summary;
  }

  public clearErrorLog(): void {
    this.errorLog = [];
    try {
      fs.unlinkSync(this.errorLogPath);
    } catch {
      // Ignoriere Fehler beim Löschen
    }
  }
}

// Globale Instanz für einfache Verwendung
export const testErrorHandler = TestErrorHandler.getInstance();