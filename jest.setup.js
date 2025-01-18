// Globale Test-Setup-Konfiguration

// Setze Timeouts für asynchrone Tests
jest.setTimeout(10000);

// Cleanup und Ressourcenmanagement
afterEach(() => {
  // Räume Mocks und Spies auf
  jest.clearAllMocks();
});

// Fehler-Handling für unerwartete Fehler
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Minimiere Prozess-Spawning
const originalSpawn = require('child_process').spawn;
require('child_process').spawn = function(command, args, options) {
  // Logge und begrenzte Prozess-Spawning
  console.log(`Spawning process: ${command} ${args.join(' ')}`);
  return originalSpawn(command, args, {
    ...options,
    stdio: 'pipe' // Minimiere externe Ressourcen
  });
};
