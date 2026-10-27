import { describe, it, expect } from 'vitest';
import {
  buildPropertyDocument,
  buildPropertySummaryDocument,
} from './document-builder';
import type { HospitableProperty } from './client';

describe('Hospitable Document Builder', () => {
  const sampleProp: HospitableProperty = {
    id: 'prop_12345',
    name: 'Sunset Oceanfront Villa',
    description: 'A gorgeous 4-bedroom oceanfront villa with private heated pool and direct beach access.',
    address: {
      street: '123 Ocean Blvd',
      city: 'Miami Beach',
      state: 'FL',
      country: 'USA',
      zip: '33139',
    },
    amenities: ['Pool', 'Hot Tub', 'WiFi', 'Beachfront', 'Kitchen', 'Free Parking'],
    photos: [
      { url: 'https://images.example.com/pool.jpg' },
      { url: 'https://images.example.com/beach.jpg' },
    ],
    max_guests: 8,
    bedrooms: 4,
    bathrooms: 3.5,
    currency: 'USD',
    base_nightly_rate: 450,
    weekend_rate: 550,
    cleaning_fee: 250,
    min_stay: 3,
    max_stay: 30,
    booking_link: 'https://direct.hospitable.com/properties/sunset-villa',
  };

  it('builds a detailed plaintext document containing all key rental details', () => {
    const doc = buildPropertyDocument(sampleProp, 'uuid-001');

    expect(doc).toContain('PROPERTY: Sunset Oceanfront Villa');
    expect(doc).toContain('PROPERTY_DB_ID: uuid-001');
    expect(doc).toContain('Miami Beach, FL, USA');
    expect(doc).toContain('Bedrooms: 4');
    expect(doc).toContain('Bathrooms: 3.5');
    expect(doc).toContain('Maximum Guests: 8');
    expect(doc).toContain('Pool, Hot Tub, WiFi, Beachfront');
    expect(doc).toContain('Base nightly rate: USD 450.00');
    expect(doc).toContain('Weekend rate: USD 550.00');
    expect(doc).toContain('Cleaning fee: USD 250.00');
    expect(doc).toContain('Minimum stay: 3 night(s)');
    expect(doc).toContain('https://direct.hospitable.com/properties/sunset-villa');
    expect(doc).toContain('https://images.example.com/pool.jpg');
  });

  it('builds a concise summary document for the master index', () => {
    const summary = buildPropertySummaryDocument(sampleProp, 'uuid-001');

    expect(summary).toContain('PROPERTY SUMMARY: Sunset Oceanfront Villa');
    expect(summary).toContain('PROPERTY_DB_ID: uuid-001');
    expect(summary).toContain('Miami Beach, FL, USA');
    expect(summary).toContain('USD 450/night');
  });

  it('handles properties with missing optional fields gracefully', () => {
    const minimalProp: HospitableProperty = {
      id: 'prop_min',
      name: 'Cozy Mountain Cabin',
    };

    const doc = buildPropertyDocument(minimalProp, 'uuid-002');
    expect(doc).toContain('PROPERTY: Cozy Mountain Cabin');
    expect(doc).toContain('Location not provided');
    expect(doc).toContain('No description provided.');
    expect(doc).toContain('Not specified');
    expect(doc).toContain('Minimum stay: 1 night(s)');
  });
});
