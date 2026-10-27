/**
 * Converts a Hospitable property object into a rich, structured plaintext document
 * optimised for chunking, embedding, and semantic retrieval.
 *
 * The LLM sees these chunks when a guest asks about a property.
 * Section headers act as structural anchors for the chunker.
 */

import type { HospitableProperty } from './client';

/**
 * Build a property KB document from the Hospitable API payload.
 * @param prop         - Raw Hospitable property object
 * @param dbPropertyId - The UUID assigned in our hospitable_properties table
 */
export function buildPropertyDocument(
  prop: HospitableProperty,
  dbPropertyId: string
): string {
  const location = prop.address
    ? [
        prop.address.street,
        prop.address.city,
        prop.address.state,
        prop.address.country,
      ]
        .filter(Boolean)
        .join(', ')
    : 'Location not provided';

  const amenitiesList =
    (prop.amenities ?? []).length > 0
      ? (prop.amenities ?? []).join(', ')
      : 'Not specified';

  const photoUrls = (prop.photos ?? [])
    .slice(0, 5)
    .map((p) => (typeof p === 'string' ? p : (p as { url: string }).url))
    .filter(Boolean)
    .join('\n');

  const currency = prop.currency ?? 'USD';

  const pricingLines: string[] = [];
  if (prop.base_nightly_rate != null) {
    pricingLines.push(`- Base nightly rate: ${currency} ${prop.base_nightly_rate.toFixed(2)}`);
  } else {
    pricingLines.push('- Base nightly rate: Contact host for pricing');
  }
  if (prop.weekend_rate != null) {
    pricingLines.push(`- Weekend rate: ${currency} ${prop.weekend_rate.toFixed(2)}`);
  }
  if (prop.cleaning_fee != null) {
    pricingLines.push(`- Cleaning fee: ${currency} ${prop.cleaning_fee.toFixed(2)}`);
  } else {
    pricingLines.push('- Cleaning fee: None');
  }
  pricingLines.push(`- Minimum stay: ${prop.min_stay ?? 1} night(s)`);
  if (prop.max_stay != null) {
    pricingLines.push(`- Maximum stay: ${prop.max_stay} nights`);
  }

  return `PROPERTY: ${prop.name}
PROPERTY_DB_ID: ${dbPropertyId}

LOCATION:
${location}

OVERVIEW:
- Bedrooms: ${prop.bedrooms ?? 'N/A'}
- Bathrooms: ${prop.bathrooms ?? 'N/A'}
- Maximum Guests: ${prop.max_guests ?? 'N/A'}

DESCRIPTION:
${prop.description?.trim() || 'No description provided.'}

AMENITIES:
${amenitiesList}

PRICING:
${pricingLines.join('\n')}

BOOKING:
To check real-time availability and book this property, use the booking link:
${prop.booking_link ?? 'Contact the host directly to book.'}

${photoUrls ? `PHOTOS:\n${photoUrls}` : ''}
`.trim();
}

/**
 * Builds a concise summary document used for the "overview" knowledge chunk.
 * This chunk is returned first when the LLM needs a broad summary.
 */
export function buildPropertySummaryDocument(
  prop: HospitableProperty,
  dbPropertyId: string
): string {
  const currency = prop.currency ?? 'USD';
  const location = prop.address
    ? [prop.address.city, prop.address.state, prop.address.country]
        .filter(Boolean)
        .join(', ')
    : 'Location TBD';

  return `PROPERTY SUMMARY: ${prop.name}
PROPERTY_DB_ID: ${dbPropertyId}
Location: ${location}
Bedrooms: ${prop.bedrooms ?? 'N/A'} | Bathrooms: ${prop.bathrooms ?? 'N/A'} | Max Guests: ${prop.max_guests ?? 'N/A'}
From: ${prop.base_nightly_rate != null ? `${currency} ${prop.base_nightly_rate}/night` : 'Contact host'}
Booking link: ${prop.booking_link ?? 'Contact host'}`.trim();
}
