/**
 * Calendar links and external-calendar blocks for deployments that do not use relational mode (local development, tests).
 *
 * They live in their OWN file, `calendar-sync.json`, beside the main state and not inside it: the sync job rewrites
 * link status and blocks every ten minutes and must never rewrite (or race with) the big state blob that booking writes use.
 *
 * Every function is synchronous from read to write, so two calls in one process can never interleave.
 * Writes go to a temporary file that is renamed over the real one, and a missing, unreadable or wrong-shaped
 * file is treated as empty, so a damaged file never takes booking offline.
 */
import fs from 'fs';
import path from 'path';
import { ensureDirectory, resolveDataDir, safeReadFile } from './storage';
import type { CalendarLink, ExternalBlock } from '../calendar/sync/types';
import { CalendarLinkRuleError, type CalendarLinkStatusFields } from '../calendar/sync/link-rules';

interface StoredBlock {
  s: string;
  e: string;
}

interface FileShape {
  links: CalendarLink[];
  /** Blocks per link id. The assistant is not repeated: it is the link's. */
  blocks: Record<string, StoredBlock[]>;
}

function filePath(): string {
  return path.join(resolveDataDir(), 'calendar-sync.json');
}

function read(): FileShape {
  const empty: FileShape = { links: [], blocks: {} };
  const raw = safeReadFile(filePath());
  if (!raw) return empty;
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return empty;
    const links = Array.isArray(parsed.links) ? parsed.links.filter((l: unknown) => l && typeof l === 'object' && typeof (l as CalendarLink).id === 'string') : [];
    const blocks: Record<string, StoredBlock[]> = {};
    if (parsed.blocks && typeof parsed.blocks === 'object' && !Array.isArray(parsed.blocks)) {
      for (const [id, list] of Object.entries(parsed.blocks)) {
        if (Array.isArray(list)) blocks[id] = list.filter((b: any) => b && typeof b.s === 'string' && typeof b.e === 'string');
      }
    }
    return { links, blocks };
  } catch (err) {
    // Only the error's name: a JSON parse message can quote the start of the file, which holds secret feed URLs.
    console.warn('[CalendarStore] calendar-sync.json is unreadable, treating it as empty:', (err as Error)?.name);
    return empty;
  }
}

/** Temp file + rename, so a crash mid-write leaves the previous file intact. Throws when the write fails. */
function write(data: FileShape): void {
  const target = filePath();
  ensureDirectory(path.dirname(target));
  const tmp = `${target}.${process.pid}.${Date.now()}.${Math.random().toString(36).slice(2, 8)}.tmp`;
  try {
    // 0600: the file holds secret feed URLs, so only the server's own user may read it.
    fs.writeFileSync(tmp, JSON.stringify(data), { encoding: 'utf-8', mode: 0o600 });
    fs.renameSync(tmp, target);
  } catch (err) {
    try {
      fs.unlinkSync(tmp);
    } catch {
      // nothing to clean up
    }
    throw err;
  }
}

export function fileGetLinks(assistantId: string): CalendarLink[] {
  return read()
    .links.filter((l) => l.assistantId === assistantId)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export function fileGetAllLinks(): CalendarLink[] {
  return read().links.slice().sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

const STATUS_KEYS = [
  'lastSyncedAt', 'lastError', 'errorSince', 'etag', 'lastModified', 'blockCount', 'unsupportedCount',
  'failureNotifiedFor', 'fullSyncedAt', 'parsedTimezone', 'lastAttemptAt',
] as const;

function withoutStatus(link: CalendarLink): CalendarLink {
  const copy = { ...link } as unknown as Record<string, unknown>;
  for (const key of STATUS_KEYS) delete copy[key];
  return copy as unknown as CalendarLink;
}

export function fileSaveLink(link: CalendarLink, maxPerAssistant: number): CalendarLink {
  const data = read();
  const idx = data.links.findIndex((l) => l.id === link.id);
  if (idx >= 0) {
    if (data.links[idx].assistantId !== link.assistantId) throw new CalendarLinkRuleError('That calendar link belongs to another assistant.');
    // A different address is a different calendar: what was learned about the old one (validators, counts, times, errors) no longer applies.
    data.links[idx] = data.links[idx].url === link.url ? { ...link } : withoutStatus(link);
  } else {
    if (data.links.filter((l) => l.assistantId === link.assistantId).length >= maxPerAssistant) {
      throw new CalendarLinkRuleError(`An assistant can link at most ${maxPerAssistant} calendars.`);
    }
    data.links.push({ ...link });
  }
  write(data);
  return { ...link };
}

/** Updates the sync-status fields of an existing link only; never adds one. False when the link is gone or another assistant's. */
export function fileUpdateLinkStatus(assistantId: string, linkId: string, fields: CalendarLinkStatusFields): boolean {
  const data = read();
  const link = data.links.find((l) => l.id === linkId && l.assistantId === assistantId);
  if (!link) return false;
  const target = link as unknown as Record<string, unknown>;
  for (const [key, value] of Object.entries(fields)) {
    if (value === undefined) continue;
    if (value === null) delete target[key];
    else target[key] = value;
  }
  write(data);
  return true;
}

export function fileDeleteLink(assistantId: string, linkId: string): boolean {
  const data = read();
  const idx = data.links.findIndex((l) => l.id === linkId && l.assistantId === assistantId);
  if (idx < 0) return false;
  data.links.splice(idx, 1);
  delete data.blocks[linkId];
  write(data);
  return true;
}

/** Removes every link and block of an assistant (the assistant itself was deleted). */
export function filePurgeAssistant(assistantId: string): void {
  const data = read();
  const gone = data.links.filter((l) => l.assistantId === assistantId);
  if (gone.length === 0) return;
  data.links = data.links.filter((l) => l.assistantId !== assistantId);
  for (const l of gone) delete data.blocks[l.id];
  write(data);
}

/** Replaces the link's blocks. Does nothing when the link is gone or belongs to another assistant. */
export function fileReplaceBlocks(linkId: string, assistantId: string, blocks: ExternalBlock[]): void {
  const data = read();
  if (!data.links.some((l) => l.id === linkId && l.assistantId === assistantId)) return;
  data.blocks[linkId] = blocks.map((b) => ({ s: b.startAt.toISOString(), e: b.endAt.toISOString() }));
  write(data);
}

export function fileGetBlocks(assistantId: string, from?: Date): ExternalBlock[] {
  const data = read();
  const fromMs = from ? from.getTime() : -Infinity;
  const out: ExternalBlock[] = [];
  for (const link of data.links) {
    if (link.assistantId !== assistantId) continue;
    for (const b of data.blocks[link.id] || []) {
      const startAt = new Date(b.s);
      const endAt = new Date(b.e);
      if (Number.isNaN(startAt.getTime()) || Number.isNaN(endAt.getTime())) continue;
      if (endAt.getTime() > fromMs) out.push({ startAt, endAt });
    }
  }
  return out.sort((a, b) => a.startAt.getTime() - b.startAt.getTime());
}
