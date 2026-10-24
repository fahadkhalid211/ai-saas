-- ==============================================================================
-- Kortex AI - Calendar links and external calendar blocks (calendar sync)
-- ==============================================================================
-- MANUAL RUN: execute in the Supabase SQL Editor (or psql) BEFORE deploying the code that reads
-- or writes these tables. Safe to run twice (IF NOT EXISTS / DROP POLICY IF EXISTS). It only
-- creates new tables, so existing data and the running app are not affected.
--
-- With DB_RELATIONAL_MODE=true the code refuses bookings (503, "try again") while these tables
-- cannot be read, because it could otherwise double-book against an owner's linked calendar.
-- So run this file before turning the new code on in a relational deployment.
--
-- kortex_calendar_links  : one row per iCal feed an owner linked to an assistant (at most 5 per
--                          assistant, enforced by the app). Also holds the sync status shown to
--                          the owner (last_synced_at, last_error, error_since) and the HTTP
--                          validators (etag, last_modified) that let an unchanged feed answer 304,
--                          how many blocks the last read stored (block_count), how many events had
--                          repeats the reader could not follow (unsupported_count), and which run of
--                          failures the 24-hour "not syncing" notice was already sent for
--                          (failure_notified_for = the error_since value).
-- kortex_external_blocks : the busy periods read from a feed, as absolute UTC instants, half-open
--                          [start_at, end_at). Replaced as a whole on every sync, in one transaction.
--                          assistant_id is repeated here so the booking check reads one indexed range.

CREATE TABLE IF NOT EXISTS kortex_calendar_links (
  id             TEXT        PRIMARY KEY,
  assistant_id   TEXT        NOT NULL,
  label          TEXT        NOT NULL
                             CHECK (label IN ('google', 'apple', 'outlook', 'other')),
  url            TEXT        NOT NULL,
  last_synced_at TIMESTAMPTZ,
  last_error     TEXT,
  error_since    TIMESTAMPTZ,
  etag           TEXT,
  last_modified  TEXT,
  block_count          INTEGER CHECK (block_count IS NULL OR block_count >= 0),
  unsupported_count    INTEGER CHECK (unsupported_count IS NULL OR unsupported_count >= 0),
  failure_notified_for TIMESTAMPTZ,
  full_synced_at       TIMESTAMPTZ,
  parsed_timezone      TEXT,
  last_attempt_at      TIMESTAMPTZ,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- A database that already ran an EARLIER DRAFT of this file has the table without the columns added since. CREATE TABLE IF NOT EXISTS
-- leaves such a table as it is, so each later column is added here (safe to run twice; a no-op on a fresh install).
--   block_count / unsupported_count : shown to the owner after each read
--   failure_notified_for            : which run of failures the 24-hour notice was sent for
--   full_synced_at / parsed_timezone: when and in which timezone a response was last parsed (a 304 does not move them)
--   last_attempt_at                 : last attempt, successful or not (orders and spaces out the scheduled reads)
ALTER TABLE kortex_calendar_links
  ADD COLUMN IF NOT EXISTS block_count INTEGER CHECK (block_count IS NULL OR block_count >= 0);
ALTER TABLE kortex_calendar_links
  ADD COLUMN IF NOT EXISTS unsupported_count INTEGER CHECK (unsupported_count IS NULL OR unsupported_count >= 0);
ALTER TABLE kortex_calendar_links
  ADD COLUMN IF NOT EXISTS failure_notified_for TIMESTAMPTZ;
ALTER TABLE kortex_calendar_links
  ADD COLUMN IF NOT EXISTS full_synced_at TIMESTAMPTZ;
ALTER TABLE kortex_calendar_links
  ADD COLUMN IF NOT EXISTS parsed_timezone TEXT;
ALTER TABLE kortex_calendar_links
  ADD COLUMN IF NOT EXISTS last_attempt_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_kortex_calendar_links_assistant
  ON kortex_calendar_links (assistant_id, created_at);

CREATE TABLE IF NOT EXISTS kortex_external_blocks (
  link_id      TEXT        NOT NULL REFERENCES kortex_calendar_links (id) ON DELETE CASCADE,
  assistant_id TEXT        NOT NULL,
  start_at     TIMESTAMPTZ NOT NULL,
  end_at       TIMESTAMPTZ NOT NULL,
  CHECK (end_at > start_at)
);

-- The booking check: every block of one assistant, in time order, optionally from a given time on.
CREATE INDEX IF NOT EXISTS idx_kortex_external_blocks_assistant_start
  ON kortex_external_blocks (assistant_id, start_at);

-- Replacing or deleting one link's blocks.
CREATE INDEX IF NOT EXISTS idx_kortex_external_blocks_link
  ON kortex_external_blocks (link_id);

-- Row Level Security: service_role only. Deliberately NO anon/authenticated policy
-- (the link URL is a secret: it can contain the owner's private calendar key).
ALTER TABLE kortex_calendar_links ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role full access" ON kortex_calendar_links;
CREATE POLICY "Service role full access" ON kortex_calendar_links
  FOR ALL TO service_role USING (true) WITH CHECK (true);

ALTER TABLE kortex_external_blocks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role full access" ON kortex_external_blocks;
CREATE POLICY "Service role full access" ON kortex_external_blocks
  FOR ALL TO service_role USING (true) WITH CHECK (true);
