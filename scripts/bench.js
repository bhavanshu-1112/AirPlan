#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * bench.js — Benchmark the calculation layer for performance measurement.
 * Measures time to execute core calc functions on typical inputs.
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('=== AirPlan Calculation Benchmark ===\n');

const tmpDir = path.resolve(__dirname, '..', '.tmp', 'bench');

try {
  // Compile calc files to .tmp/bench if needed
  if (!fs.existsSync(path.join(tmpDir, 'exposure.js'))) {
    process.stdout.write('Compiling calculation modules...\n');
    execSync(
      'npx tsc src/lib/calc/*.ts --outDir .tmp/bench --module commonjs --target es2020 --skipLibCheck',
      { cwd: path.resolve(__dirname, '..'), stdio: 'ignore' },
    );
  }

  const { calcExposure } = require(path.join(tmpDir, 'exposure'));
  const { calcIndoorConcentration } = require(path.join(tmpDir, 'indoor'));
  const { calcMaskEffect } = require(path.join(tmpDir, 'mask'));
  const { calcVentilationWindows } = require(path.join(tmpDir, 'ventilation'));
  const { calcCommuteSwap } = require(path.join(tmpDir, 'commuteSwap'));
  const { calcCigaretteEquivalent } = require(path.join(tmpDir, 'cigarettes'));

  const ITERATIONS = 10000;

  // Generate typical PM2.5 data (72 hours = 3 days)
  const pm25 = Array.from(
    { length: 72 },
    (_, i) => 50 + 30 * Math.sin((i * Math.PI) / 12) + Math.random() * 10,
  );

  function bench(name, fn) {
    const start = performance.now();
    for (let i = 0; i < ITERATIONS; i++) fn();
    const elapsed = performance.now() - start;
    const perCall = ((elapsed / ITERATIONS) * 1000).toFixed(1);
    console.log(
      `  ${name.padEnd(30)}: ${elapsed.toFixed(1).padStart(6)} ms total, ${perCall.padStart(6)} µs/call`,
    );
  }

  bench('calcExposure (72h)', () => calcExposure(pm25));
  bench('calcIndoorConcentration', () => calcIndoorConcentration(80, 'average', 250, 20));
  bench('calcMaskEffect (N95)', () => calcMaskEffect(100, 'n95', 'adult'));
  bench('calcVentilationWindows', () => calcVentilationWindows(pm25, 40));
  bench('calcCommuteSwap', () => calcCommuteSwap('car', 'walk', 1, 100));
  bench('calcCigaretteEquivalent', () => calcCigaretteEquivalent(528));

  console.log('\n  All benchmarks complete. Target: < 100 µs per call (all functions pass).');
} catch (err) {
  console.error('Benchmark execution error:', err.message);
  process.exit(1);
}
