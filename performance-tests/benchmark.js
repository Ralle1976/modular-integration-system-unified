const { performance } = require('perf_hooks');
const fs = require('fs');
const path = require('path');

function runBenchmarks() {
  const results = {
    timestamp: new Date().toISOString(),
    benchmarks: []
  };

  // Beispiel-Benchmark für Funktionen
  const testFunctions = [
    { name: 'Simple Object Creation', 
      test: () => ({ key: 'value' }) 
    },
    { name: 'Array Iteration', 
      test: () => {
        const arr = Array.from({length: 1000}, (_, i) => i);
        arr.forEach(x => x * 2);
      }
    }
  ];

  testFunctions.forEach(({name, test}) => {
    const start = performance.now();
    test();
    const end = performance.now();

    results.benchmarks.push({
      name,
      duration: end - start,
      unit: 'milliseconds'
    });
  });

  // Ergebnisse speichern
  const resultsDir = path.join(process.cwd(), 'performance-results');
  fs.mkdirSync(resultsDir, { recursive: true });

  const resultsFile = path.join(resultsDir, `benchmark-${Date.now()}.json`);
  fs.writeFileSync(resultsFile, JSON.stringify(results, null, 2));

  console.log('Benchmark-Ergebnisse gespeichert:', resultsFile);
  return results;
}

module.exports = runBenchmarks();

// Wenn direkt ausgeführt
if (require.main === module) {
  runBenchmarks();
}