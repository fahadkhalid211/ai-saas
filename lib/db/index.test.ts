import { describe, it, expect } from 'vitest';
import { Database } from './index';

describe('Database Layer & Decoupled Storage', () => {
  it('should retrieve assistants from database state', async () => {
    const assistants = await Database.getAssistants();
    expect(Array.isArray(assistants)).toBe(true);
  });

  it('should return null for a non-existent assistant ID', async () => {
    const nonExistent = await Database.getAssistantById('non-existent-assistant-id-12345');
    expect(nonExistent).toBeNull();
  });

  it('should retrieve chunks from decoupled vector storage', async () => {
    const chunks = await Database.getChunksByAssistant('demo-assistant');
    expect(Array.isArray(chunks)).toBe(true);
  });

  it('should retrieve leads for an assistant', async () => {
    const leads = await Database.getLeads('demo-assistant');
    expect(Array.isArray(leads)).toBe(true);
  });

  it('should retrieve landing pages from database state', async () => {
    const pages = await Database.getLandingPages();
    expect(Array.isArray(pages)).toBe(true);
  });
});
