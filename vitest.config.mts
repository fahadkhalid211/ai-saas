import { defineConfig } from 'vitest/config';
import os from 'os';
import path from 'path';

// Each test run gets its own data folder, so tests never share .data/db.json with the local dev server,
// another test run, or each other's leftovers (a write from outside used to drop in-memory test accounts).
// A missing db.json is seeded from the repo's .data/db.json, which is only read.
const dataDir = path.join(os.tmpdir(), `crescelo-vitest-${process.pid}-${Date.now()}`, '.data');

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: ['lib/**/*.test.ts'],
    env: { DATA_DIR: dataDir },
    globalSetup: ['./vitest.global-setup.mts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './'),
    },
  },
});
