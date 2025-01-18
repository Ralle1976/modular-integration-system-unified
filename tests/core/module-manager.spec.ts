import { ModuleManager } from '../../src/core/module-manager';
import { Logger } from '../../src/core/logger';
import { EventBus } from '../../src/core/event-bus';

// Mock-Modul für Testzwecke
class TestModule {
  name = 'test-module';
  initialized = false;
  shutdown = false;

  async initialize(): Promise<boolean> {
    this.initialized = true;
    return true;
  }

  async shutdown(): Promise<void> {
    this.shutdown = true;
  }

  isEnabled(): boolean {
    return true;
  }
}

describe('ModuleManager', () => {
  let moduleManager: ModuleManager;
  let testModule: TestModule;

  beforeEach(() => {
    moduleManager = ModuleManager.getInstance();
    testModule = new TestModule();
  });

  afterEach(() => {
    // Cleanup zwischen Tests
    jest.clearAllMocks();
  });

  test('should register module', () => {
    moduleManager.registerModule(testModule);
    expect(moduleManager.listModules()).toContain('test-module');
  });

  test('should initialize registered modules', async () => {
    moduleManager.registerModule(testModule);
    await moduleManager.initializeModules();
    
    expect(testModule.initialized).toBe(true);
  });

  test('should handle module shutdown', async () => {
    moduleManager.registerModule(testModule);
    await moduleManager.initializeModules();
    await moduleManager.shutdownModules();

    expect(testModule.shutdown).toBe(true);
  });

  test('should not spawn unnecessary processes', () => {
    const spawnSpy = jest.spyOn(process, 'spawn');
    moduleManager.registerModule(testModule);

    expect(spawnSpy).not.toHaveBeenCalled();
    spawnSpy.mockRestore();
  });
});
