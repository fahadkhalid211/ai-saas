import { Database } from '@/lib/db';
import { McpAuthContext } from '../types';
import { assertScope } from '../auth';

export const listServicesMetadata = {
  name: 'list_services',
  description:
    'List all published services, packages, consultations, duration in minutes, and pricing available in the authenticated workspace. Use when customers ask what services are offered, what each service includes, or how much services cost.',
  annotations: {
    readOnlyHint: true,
    requiresConfirmationHint: false,
    destructiveHint: false,
  },
  requiredScope: 'services:read' as const,
};

export const getServiceMetadata = {
  name: 'get_service',
  description:
    'Retrieve details of a single service by ID or name, including duration, pricing, and full description.',
  annotations: {
    readOnlyHint: true,
    requiresConfirmationHint: false,
    destructiveHint: false,
  },
  requiredScope: 'services:read' as const,
};

export async function handleListServices(
  args: Record<string, any>,
  auth: McpAuthContext
) {
  assertScope(auth, 'services:read');

  const assistants = await Database.getAssistants(auth.workspaceId);
  const allServices: Array<{
    id: string;
    name: string;
    description: string;
    durationMinutes: number;
    price: number;
    popular?: boolean;
    assistantId: string;
  }> = [];

  for (const ast of assistants) {
    const lpConfig = await Database.getLandingPageConfig(ast.id);
    if (lpConfig?.services && Array.isArray(lpConfig.services)) {
      for (const s of lpConfig.services) {
        allServices.push({
          id: s.id,
          name: s.name,
          description: s.description || '',
          durationMinutes: s.durationMinutes || 30,
          price: s.price || 0,
          popular: Boolean(s.popular),
          assistantId: ast.id,
        });
      }
    }
  }

  return {
    total: allServices.length,
    services: allServices,
  };
}

export async function handleGetService(
  args: { serviceId?: string; name?: string },
  auth: McpAuthContext
) {
  assertScope(auth, 'services:read');

  if (!args.serviceId && !args.name) {
    const error: any = new Error('Either serviceId or name is required');
    error.code = 'VALIDATION_ERROR';
    throw error;
  }

  const { services } = await handleListServices({}, auth);
  const queryId = args.serviceId?.trim().toLowerCase();
  const queryName = args.name?.trim().toLowerCase();

  const found = services.find((s) => {
    if (queryId && s.id.toLowerCase() === queryId) return true;
    if (queryName && s.name.toLowerCase().includes(queryName)) return true;
    return false;
  });

  if (!found) {
    const error: any = new Error(`Service not found for query '${args.serviceId || args.name}'`);
    error.code = 'NOT_FOUND';
    throw error;
  }

  return found;
}
