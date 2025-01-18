import { ProcessOptimizer, processOptimizer } from './process-optimizer';

describe('ProcessOptimizer', () => {
  let optimizer: ProcessOptimizer;

  beforeEach(() => {
    optimizer = ProcessOptimizer.getInstance();
  });

  test('should limit concurrent processes', () => {
    const maxProcesses = Math.max(1, Math.floor(require('os').cpus().length / 2));

    // Versuche, mehr Prozesse zu spawnen als erlaubt
    expect(() => {
      for (let i = 0; i < maxProcesses + 1; i++) {
        processOptimizer.safeSpawn('node', ['-e', 'console.log("test")']);
      }
    }).toThrow('Exceeded max concurrent processes');
  });

  test('should handle process errors', () => {
    const mockConsoleError = jest.spyOn(console, 'error').mockImplementation();
    const mockConsoleWarn = jest.spyOn(console, 'warn').mockImplementation();

    // Versuche, einen nicht existierenden Befehl auszuführen
    const process = processOptimizer.safeSpawn('non-existent-command');

    process.on('error', (err) => {
      expect(err).toBeDefined();
      expect(mockConsoleError).toHaveBeenCalled();
    });

    mockConsoleError.mockRestore();
    mockConsoleWarn.mockRestore();
  });

  test('should track process stats', () => {
    processOptimizer.safeSpawn('node', ['-e', 'console.log("test1")']);
    processOptimizer.safeSpawn('node', ['-e', 'console.log("test2")']);

    const stats = processOptimizer.getProcessStats();
    expect(Object.keys(stats).length).toBeGreaterThan(0);
  });
});
