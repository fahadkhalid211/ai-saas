import fs from 'fs';
import path from 'path';
import type { TestProject } from 'vitest/node';

/**
 * Prepares the per-run data folder (see vitest.config.mts) and removes it when the run ends.
 * The run starts from a copy of the local .data/db.json WITHOUT its e-mail settings: a developer's real SMTP or Resend
 * credentials in that file must never make a test send real mail (it also made every e-mailing test wait on the mail server).
 */
export default function setup(project: TestProject) {
  const dataDir = project.config.env?.DATA_DIR;
  if (dataDir && dataDir.includes('crescelo-vitest-')) {
    try {
      const seed = path.join(process.cwd(), '.data', 'db.json');
      if (fs.existsSync(seed)) {
        const state = JSON.parse(fs.readFileSync(seed, 'utf8'));
        delete state.smtpSettings;
        fs.mkdirSync(dataDir, { recursive: true });
        fs.writeFileSync(path.join(dataDir, 'db.json'), JSON.stringify(state));
      }
    } catch {
      // no usable seed: the app creates its default state
    }
  }
  return () => {
    if (dataDir && dataDir.includes('crescelo-vitest-')) {
      fs.rmSync(path.dirname(dataDir), { recursive: true, force: true });
    }
  };
}
