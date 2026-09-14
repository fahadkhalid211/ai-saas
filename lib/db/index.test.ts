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

  it('should create an isolated tenant workspace with assistant and landing page', async () => {
    const uniqueEmail = `test_${Date.now()}@business.com`;
    const result = await Database.createTenantWorkspace({
      businessName: 'Apex Medical Clinic',
      ownerEmail: uniqueEmail,
      password: 'SecurePassword123!',
      industryTemplateSlug: 'dental-clinic',
    });

    expect(result.workspace).toBeDefined();
    expect(result.workspace.name).toBe('Apex Medical Clinic');
    expect(result.workspace.planId).toBe('starter');
    expect(result.assistant).toBeDefined();
    expect(result.assistant.name).toContain('Apex Medical Clinic');
    expect(result.landingPage).toBeDefined();
    expect(result.owner.email).toBe(uniqueEmail);

    const loginResult = await Database.verifyTenantLogin(uniqueEmail, 'SecurePassword123!');
    expect(loginResult).not.toBeNull();
    expect(loginResult?.workspace.id).toBe(result.workspace.id);
  });
});
