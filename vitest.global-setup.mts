import fs from 'fs';
import path from 'path';
import type { TestProject } from 'vitest/node';

/** Removes the per-run data folder (see vitest.config.mts) when the run ends. */
export default function setup(project: TestProject) {
  const dataDir = project.config.env?.DATA_DIR;
  return () => {
    if (dataDir && dataDir.includes('crescelo-vitest-')) {
      fs.rmSync(path.dirname(dataDir), { recursive: true, force: true });
    }
  };
}
