import { z } from 'zod';
import { McpAuthContext } from '../types';
import { getBusinessInformationMetadata, handleGetBusinessInformation } from './business';
import { listServicesMetadata, getServiceMetadata, handleListServices, handleGetService } from './services';
import { searchKnowledgeMetadata, handleSearchKnowledge } from './knowledge';
import { checkAvailabilityMetadata, handleCheckAvailability } from './availability';
import {
  createBookingMetadata,
  getBookingMetadata,
  cancelBookingMetadata,
  handleCreateBooking,
  handleGetBooking,
  handleCancelBooking,
} from './bookings';
import { createLeadMetadata, handleCreateLead } from './leads';
import { searchProductsMetadata, getProductMetadata, handleSearchProducts, handleGetProduct } from './products';
import {
  getBookingSummaryMetadata,
  getLeadSummaryMetadata,
  handleGetBookingSummary,
  handleGetLeadSummary,
} from './analytics';

export interface RegisteredMcpToolDefinition {
  name: string;
  description: string;
  annotations: {
    readOnlyHint?: boolean;
    requiresConfirmationHint?: boolean;
    destructiveHint?: boolean;
  };
  inputSchema: z.ZodTypeAny;
  handler: (args: any, auth: McpAuthContext) => Promise<any>;
}

export const MCP_TOOLS: RegisteredMcpToolDefinition[] = [
  // 1. Business Info
  {
    name: getBusinessInformationMetadata.name,
    description: getBusinessInformationMetadata.description,
    annotations: getBusinessInformationMetadata.annotations,
    inputSchema: z.object({}),
    handler: (args, auth) => handleGetBusinessInformation(args, auth),
  },

  // 2. Services
  {
    name: listServicesMetadata.name,
    description: listServicesMetadata.description,
    annotations: listServicesMetadata.annotations,
    inputSchema: z.object({}),
    handler: (args, auth) => handleListServices(args, auth),
  },
  {
    name: getServiceMetadata.name,
    description: getServiceMetadata.description,
    annotations: getServiceMetadata.annotations,
    inputSchema: z.object({
      serviceId: z.string().optional().describe('Unique ID of the service to retrieve'),
      name: z.string().optional().describe('Name or keyword of the service to look up'),
    }),
    handler: (args, auth) => handleGetService(args, auth),
  },

  // 3. Knowledge Base
  {
    name: searchKnowledgeMetadata.name,
    description: searchKnowledgeMetadata.description,
    annotations: searchKnowledgeMetadata.annotations,
    inputSchema: z.object({
      query: z.string().describe('The search query or factual question to look up in documentation and guides'),
      limit: z.number().int().min(1).max(20).optional().describe('Maximum number of knowledge chunks to return (default: 5)'),
    }),
    handler: (args, auth) => handleSearchKnowledge(args, auth),
  },

  // 4. Availability
  {
    name: checkAvailabilityMetadata.name,
    description: checkAvailabilityMetadata.description,
    annotations: checkAvailabilityMetadata.annotations,
    inputSchema: z.object({
      date: z.string().describe("Target date in YYYY-MM-DD format (e.g. '2026-10-15')"),
      durationMinutes: z.number().int().min(5).max(480).optional().describe('Desired consultation duration in minutes'),
      serviceId: z.string().optional().describe('Specific service ID to check duration and availability for'),
      timezone: z.string().optional().describe("Client IANA timezone, e.g. 'America/New_York' or 'Europe/London'"),
    }),
    handler: (args, auth) => handleCheckAvailability(args, auth),
  },

  // 5. Bookings
  {
    name: createBookingMetadata.name,
    description: createBookingMetadata.description,
    annotations: createBookingMetadata.annotations,
    inputSchema: z.object({
      date: z.string().describe("Booking date in YYYY-MM-DD format (e.g. '2026-10-15')"),
      timeSlot: z.string().describe('Booking time slot in HH:MM or 12h format (e.g. "14:00" or "2:00 PM")'),
      customerName: z.string().describe('Full name of the customer'),
      customerEmail: z.string().email().describe('Valid contact email address of the customer'),
      customerPhone: z.string().optional().describe('Contact phone number with country code'),
      serviceId: z.string().optional().describe('Identifier of the service being booked'),
      serviceName: z.string().optional().describe('Display name of the service being booked'),
      durationMinutes: z.number().int().optional().describe('Duration in minutes'),
      notes: z.string().optional().describe('Special requests or customer notes'),
      confirmed: z.boolean().optional().describe('Explicit user confirmation. Must be true to book; if false/omitted, a confirmation challenge is returned.'),
    }),
    handler: (args, auth) => handleCreateBooking(args, auth),
  },
  {
    name: getBookingMetadata.name,
    description: getBookingMetadata.description,
    annotations: getBookingMetadata.annotations,
    inputSchema: z.object({
      bookingId: z.string().optional().describe('Appointment ID to look up'),
      customerEmail: z.string().optional().describe('Customer email address to find all bookings for'),
    }),
    handler: (args, auth) => handleGetBooking(args, auth),
  },
  {
    name: cancelBookingMetadata.name,
    description: cancelBookingMetadata.description,
    annotations: cancelBookingMetadata.annotations,
    inputSchema: z.object({
      bookingId: z.string().describe('Unique ID of the booking to cancel'),
      reason: z.string().optional().describe('Customer explanation or reason for cancellation'),
      confirmed: z.boolean().optional().describe('Explicit customer confirmation. Must be true to cancel; if false/omitted, a confirmation challenge is returned.'),
    }),
    handler: (args, auth) => handleCancelBooking(args, auth),
  },

  // 6. Leads
  {
    name: createLeadMetadata.name,
    description: createLeadMetadata.description,
    annotations: createLeadMetadata.annotations,
    inputSchema: z.object({
      email: z.string().email().describe('Valid contact email address of the lead'),
      name: z.string().optional().describe('Full name of the prospective customer'),
      phone: z.string().optional().describe('Phone number with country code'),
      notes: z.string().optional().describe('Lead requirements, project details, or inquiry summary'),
      customData: z.record(z.string(), z.any()).optional().describe('Structured metadata or qualifying answers'),
    }),
    handler: (args, auth) => handleCreateLead(args, auth),
  },

  // 7. Products
  {
    name: searchProductsMetadata.name,
    description: searchProductsMetadata.description,
    annotations: searchProductsMetadata.annotations,
    inputSchema: z.object({
      query: z.string().describe('Product search terms (e.g. "wireless headphones", "jacket")'),
      category: z.string().optional().describe('Category filter (e.g. "Electronics", "Clothing")'),
      maxPrice: z.number().positive().optional().describe('Maximum budget / price threshold'),
      limit: z.number().int().min(1).max(20).optional().describe('Maximum products to return (default: 8)'),
    }),
    handler: (args, auth) => handleSearchProducts(args, auth),
  },
  {
    name: getProductMetadata.name,
    description: getProductMetadata.description,
    annotations: getProductMetadata.annotations,
    inputSchema: z.object({
      productId: z.union([z.string(), z.number()]).optional().describe('WooCommerce or internal product ID'),
      sku: z.string().optional().describe('Product SKU identifier'),
    }),
    handler: (args, auth) => handleGetProduct(args, auth),
  },

  // 8. Analytics
  {
    name: getBookingSummaryMetadata.name,
    description: getBookingSummaryMetadata.description,
    annotations: getBookingSummaryMetadata.annotations,
    inputSchema: z.object({
      days: z.number().int().min(1).max(365).optional().describe('Timeframe in days (default: 30)'),
    }),
    handler: (args, auth) => handleGetBookingSummary(args, auth),
  },
  {
    name: getLeadSummaryMetadata.name,
    description: getLeadSummaryMetadata.description,
    annotations: getLeadSummaryMetadata.annotations,
    inputSchema: z.object({
      days: z.number().int().min(1).max(365).optional().describe('Timeframe in days (default: 30)'),
    }),
    handler: (args, auth) => handleGetLeadSummary(args, auth),
  },
];
