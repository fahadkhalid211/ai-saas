-- =============================================================================
-- Hospitable PMS Integration Schema
-- Run via: node scripts/apply-schema.mjs (or psql -f lib/integrations/hospitable/schema.sql)
-- =============================================================================

-- Tenants: one row per Hospitable account / property manager connected to an assistant
CREATE TABLE IF NOT EXISTS hospitable_tenants (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assistant_id     UUID NOT NULL,
  access_token     TEXT NOT NULL,          -- AES-256-GCM encrypted (enc:v1:... format)
  refresh_token    TEXT,                   -- OAuth refresh token (encrypted)
  token_expires_at TIMESTAMPTZ,
  account_id       TEXT,                   -- Hospitable account identifier
  plan_tier        TEXT,                   -- 'host' | 'professional' | 'mogul'
  webhook_secret   TEXT NOT NULL,          -- HMAC-SHA256 secret for webhook signature verification
  sync_enabled     BOOLEAN NOT NULL DEFAULT TRUE,
  last_synced_at   TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (assistant_id)
);

CREATE INDEX IF NOT EXISTS idx_htenants_assistant ON hospitable_tenants(assistant_id);

-- Properties: one row per Hospitable property
CREATE TABLE IF NOT EXISTS hospitable_properties (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id         UUID NOT NULL REFERENCES hospitable_tenants(id) ON DELETE CASCADE,
  hospitable_id     TEXT NOT NULL,
  name              TEXT NOT NULL,
  description       TEXT,
  address           JSONB,                 -- {street,city,state,country,zip,lat,lng}
  amenities         TEXT[] DEFAULT '{}',
  photos            TEXT[] DEFAULT '{}',  -- array of photo URLs
  max_guests        INT,
  bedrooms          INT,
  bathrooms         NUMERIC(3,1),
  currency          TEXT NOT NULL DEFAULT 'USD',
  base_nightly_rate NUMERIC(10,2),
  weekend_rate      NUMERIC(10,2),
  cleaning_fee      NUMERIC(10,2),
  min_stay          INT NOT NULL DEFAULT 1,
  max_stay          INT,
  booking_url       TEXT,
  raw               JSONB,                -- full API response snapshot for debugging
  synced_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, hospitable_id)
);

CREATE INDEX IF NOT EXISTS idx_hprops_tenant ON hospitable_properties(tenant_id);
CREATE INDEX IF NOT EXISTS idx_hprops_name ON hospitable_properties USING gin(to_tsvector('english', name));

-- Calendar: nightly availability + per-night price
CREATE TABLE IF NOT EXISTS hospitable_calendar (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id   UUID NOT NULL REFERENCES hospitable_properties(id) ON DELETE CASCADE,
  date          DATE NOT NULL,
  available     BOOLEAN NOT NULL DEFAULT TRUE,
  min_stay      INT,
  nightly_price NUMERIC(10,2),
  synced_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (property_id, date)
);

CREATE INDEX IF NOT EXISTS idx_hcal_prop_date ON hospitable_calendar(property_id, date);
CREATE INDEX IF NOT EXISTS idx_hcal_avail ON hospitable_calendar(property_id, date) WHERE available = TRUE;

-- Pricing rules (base, seasonal, last-minute, early-bird)
CREATE TABLE IF NOT EXISTS hospitable_pricing (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES hospitable_properties(id) ON DELETE CASCADE,
  rule_type   TEXT NOT NULL,              -- 'base' | 'seasonal' | 'last_minute' | 'early_bird' | 'weekend'
  start_date  DATE,
  end_date    DATE,
  amount      NUMERIC(10,2) NOT NULL,
  currency    TEXT NOT NULL DEFAULT 'USD',
  synced_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_hpricing_prop ON hospitable_pricing(property_id);

-- Bookings / reservations
CREATE TABLE IF NOT EXISTS hospitable_bookings (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id    UUID NOT NULL REFERENCES hospitable_properties(id) ON DELETE CASCADE,
  hospitable_id  TEXT NOT NULL,
  guest_name     TEXT,
  guest_email    TEXT,
  check_in       DATE NOT NULL,
  check_out      DATE NOT NULL,
  status         TEXT NOT NULL,           -- 'pending'|'accepted'|'cancelled'|'declined'|...
  guest_count    INT,
  total_price    NUMERIC(10,2),
  currency       TEXT DEFAULT 'USD',
  channel        TEXT,                    -- 'airbnb'|'vrbo'|'booking_com'|'direct'|...
  raw            JSONB,
  synced_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (property_id, hospitable_id)
);

CREATE INDEX IF NOT EXISTS idx_hbook_prop_dates ON hospitable_bookings(property_id, check_in, check_out);
CREATE INDEX IF NOT EXISTS idx_hbook_status ON hospitable_bookings(property_id, status);
