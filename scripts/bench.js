#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * bench.js — Benchmark the calculation layer for performance measurement.
 * Measures time to execute core calc functions on typical inputs.
 */

const { execSync } = require('child_process');
const path = require('path');

console.log('=== AirPlan Calculation Benchmark ===\n');

// We run the benchmark via a ts-jest script to handle TypeScript imports
const benchScript = `
const { calcExposure } = require('./src/lib/calc/exposure');
const { calcIndoorConcentration } = require('./src/lib/calc/indoor');
const { calcMaskEffect } = require('./src/lib/calc/mask');
const { calcVentilationWindows } = require('./src/lib/calc/ventilation');
const { calcCommuteSwap } = require('./src/lib/calc/commuteSwap');
const { calcCigaretteEquivalent } = require('./src/lib/calc/cigarettes');

const ITERATIONS = 10000;

// Generate typical PM2.5 data (72 hours = 3 days)
const pm25 = Array.from({ length: 72 }, (_, i) =>
  50 + 30 * Math.sin(i * Math.PI / 12) + Math.random() * 10
);

function bench(name, fn) {
  const start = performance.now();
  for (let i = 0; i < ITERATIONS; i++) fn();
  const elapsed = performance.now() - start;
  const perCall = (elapsed / ITERATIONS * 1000).toFixed(1);
  console.log(\`  \${name}: \${elapsed.toFixed(1)} ms total, \${perCall} µs/call\`);
}

bench('calcExposure (72h)', () => calcExposure(pm25));
bench('calcIndoorConcentration', () => calcIndoorConcentration(80, 'average', 250, 20));
bench('calcMaskEffect (N95)', () => calcMaskEffect(100, 'n95', 'adult'));
bench('calcVentilationWindows', () => calcVentilationWindows(pm25, 40));
bench('calcCommuteSwap', () => calcCommuteSwap('car', 'metro', 1, 100));
bench('calcCigaretteEquivalent', () => calcCigaretteEquivalent(528));

console.log('\\n  All benchmarks complete. Target: < 100 µs per call.');
`;

try {
  execSync(`node -e "${benchScript.replace(/"/g, '\\"').replace(/\n/g, '\\n')}"`, {
    cwd: path.resolve(__dirname, '..'),
    stdio: 'inherit',
    env: { ...process.env, NODE_PATH: path.resolve(__dirname, '..') },
  });
} catch {
  // Fall back to just reporting that benchmark requires compiled JS
  console.log('  Benchmark requires compiled JavaScript or ts-node.');
  console.log('  Run: npx ts-node scripts/bench-runner.ts');
}
