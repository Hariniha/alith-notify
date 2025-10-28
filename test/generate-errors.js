#!/usr/bin/env node

/**
 * Test script to generate sample errors for the capture system
 * Writes directly to captured-errors.log to simulate captured errors
 */

import fs from 'fs';
import path from 'path';

const logFilePath = path.join(process.cwd(), 'captured-errors.log');

console.log('🧪 Generating test errors and writing to captured-errors.log...\n');

// Helper to write to log file with timestamp
function logError(message) {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] [CONSOLE.ERROR] ${message}\n`;
  fs.appendFileSync(logFilePath, logEntry, 'utf-8');
  console.error(message); // Also show in console
}

setTimeout(() => {
  logError('ERROR: Database connection failed');
  logError('  at DatabaseClient.connect (db.js:123)');
  logError('  Connection timeout after 5000ms');
}, 1000);

setTimeout(() => {
  logError('ERROR: Cannot find module \'express\'');
  logError('  Require stack:');
  logError('  - /app/server.js');
}, 2000);

setTimeout(() => {
  logError('ERROR: TypeError: Cannot read property \'name\' of undefined');
  logError('  at UserController.getProfile (controller.js:45)');
}, 3000);

setTimeout(() => {
  logError('WARN: Memory usage is high: 85%');
}, 4000);

setTimeout(() => {
  logError('ERROR: API request failed with status 500');
  logError('  at fetch (https://api.example.com/users)');
}, 5000);

setTimeout(() => {
  console.log('\n✅ Test errors generated and logged!');
  console.log(`� Check: ${logFilePath}`);
  console.log('💡 The capture system will process these in ~30 seconds');
  console.log('💡 Or press "p" in the capture system to process immediately\n');
}, 6000);
