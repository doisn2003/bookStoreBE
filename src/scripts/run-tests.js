#!/usr/bin/env node
const { spawn } = require('child_process');
const dotenv = require('dotenv');
const path = require('path');

// Load test environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env.test') });

// Set NODE_ENV
process.env.NODE_ENV = 'test';

// Run Jest with proper configuration
const jest = spawn('jest', ['--config', 'jest.config.js'], {
  stdio: 'inherit',
  env: { ...process.env },
});

jest.on('close', (code) => {
  process.exit(code);
}); 