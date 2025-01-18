import { TestErrorHandler, TestErrorSeverity, testErrorHandler } from './test-error-handler';
import * as fs from 'fs';
import * as path from 'path';

describe('TestErrorHandler', () => {
  let errorHandler: TestErrorHandler;

  beforeEach(() => {
    errorHandler = TestErrorHandler.getInstance();
    errorHandler.clearErrorLog();
  });

  test('should capture and log test errors', () => {
    const testError = new Error('Test error message');
    const errorDetails = errorHandler.captureTestError(testError, 'Sample Test');

    expect(errorDetails.testName).toBe('Sample Test');
    expect(errorDetails.errorMessage).toBe('Test error message');
    expect(errorDetails.severity).toBe(TestErrorSeverity.LOW);
  });

  test('should determine error severity', () => {
    const timeoutError = new Error('Test timeout occurred');
    const assertionError = new Error('Assertion failed');
    const normalError = new Error('Normal error');

    const timeoutErrorDetails = errorHandler.captureTestError(timeoutError, 'Timeout Test');
    const assertionErrorDetails = errorHandler.captureTestError(assertionError, 'Assertion Test');
    const normalErrorDetails = errorHandler.captureTestError(normalError, 'Normal Test');

    expect(timeoutErrorDetails.severity).toBe(TestErrorSeverity.HIGH);
    expect(assertionErrorDetails.severity).toBe(TestErrorSeverity.MEDIUM);
    expect(normalErrorDetails.severity).toBe(TestErrorSeverity.LOW);
  });

  test('should generate unique error IDs', () => {
    const error1 = errorHandler.captureTestError(new Error('Error 1'), 'Test 1');
    const error2 = errorHandler.captureTestError(new Error('Error 2'), 'Test 2');

    expect(error1.id).not.toBe(error2.id);
  });

  test('should provide error summary', () => {
    errorHandler.captureTestError(new Error('Low error'), 'Low Test');
    errorHandler.captureTestError(new Error('Medium error'), 'Medium Test', { 
      severity: TestErrorSeverity.MEDIUM 
    });
    errorHandler.captureTestError(new Error('High error'), 'High Test', { 
      severity: TestErrorSeverity.HIGH 
    });

    const summary = errorHandler.getErrorSummary();
    expect(summary.total).toBe(3);
    expect(summary.bySeverity[TestErrorSeverity.LOW]).toBe(1);
    expect(summary.bySeverity[TestErrorSeverity.MEDIUM]).toBe(1);
    expect(summary.bySeverity[TestErrorSeverity.HIGH]).toBe(1);
  });

  test('should log errors to file', () => {
    const testError = new Error('File logging test');
    errorHandler.captureTestError(testError, 'File Logging Test');

    const logFiles = fs.readdirSync(path.resolve(process.cwd(), 'logs', 'test-errors'));
    expect(logFiles.length).toBeGreaterThan(0);
  });

  test('should clear error log', () => {
    errorHandler.captureTestError(new Error('Test error'), 'Clear Test');
    errorHandler.clearErrorLog();

    const summary = errorHandler.getErrorSummary();
    expect(summary.total).toBe(0);
  });
});
