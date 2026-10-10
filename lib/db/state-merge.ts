/**
 * Three-way merge for the shared application state (workspaces, assistants, team members, ...), which every server
 * instance keeps a copy of and saves as one row.
 *
 * Without it a save is "last writer wins" for the WHOLE row: an instance whose copy is a minute old writes that copy back
 * and silently undoes whatever other instances saved in the meantime (a sign-up, a redeemed access code, a plan change).
 *
 * With it a save carries only what THIS instance changed:
 *   base   = the state as this instance last loaded or saved it
 *   local  = the state this instance wants to save now
 *   remote = what is in the database at the moment of saving (read under a row lock)
 * Everything that differs between base and local is applied on top of remote. Collections are merged item by item (by id)
 * and items field by field, so two instances changing different items, or different fields of one item, both keep their work.
 * When both changed the same field, the one saving last wins (there is nothing better to do without asking a person).
 *
 * Pure: no imports, no I/O.
 */

export type StatePayload = Record<string, any>;

/**
 * Append-only style lists that are stored truncated (the newest few). They are not merged: the saving instance's list is
 * kept, as before. Their full history lives elsewhere (the system log, the relational tables).
 */
export const UNMERGED_KEYS: ReadonlySet<string> = new Set(['auditLogs', 'pageViews', 'messages', 'notifications', 'mcpAuditLogs', 'chunks']);

const same = (a: unknown, b: unknown): boolean => a === b || JSON.stringify(a) === JSON.stringify(b);

type Item = { id: string } & Record<string, any>;

const isItemList = (v: unknown): v is Item[] =>
  Array.isArray(v) && v.every((x) => x !== null && typeof x === 'object' && !Array.isArray(x) && typeof (x as any).id === 'string');

/** Field by field: a field this instance changed keeps its value (or its removal); every other field follows the database. */
export function mergeItem(base: Record<string, any> | undefined, local: Record<string, any>, remote: Record<string, any>): Record<string, any> {
  const b = base || {};
  const out: Record<string, any> = {};
  const keys = new Set([...Object.keys(remote), ...Object.keys(local)]);
  for (const key of keys) {
    const changedHere = !same(local[key], b[key]);
    const source = changedHere ? local : remote;
    if (key in source && source[key] !== undefined) out[key] = source[key];
  }
  return out;
}

/** Item by item, by id. Order: this instance's order, then items other instances added. */
export function mergeCollection(base: Item[] | undefined, local: Item[], remote: Item[]): Item[] {
  const baseById = new Map((base || []).map((i) => [i.id, i]));
  const remoteById = new Map(remote.map((i) => [i.id, i]));
  const localIds = new Set<string>();
  const out: Item[] = [];

  for (const mine of local) {
    if (localIds.has(mine.id)) continue; // a duplicated id: keep the first
    localIds.add(mine.id);
    const was = baseById.get(mine.id);
    const theirs = remoteById.get(mine.id);
    if (theirs) {
      out.push(mergeItem(was, mine, theirs) as Item);
    } else if (!was) {
      out.push(mine); // added here
    } else if (!same(mine, was)) {
      out.push(mine); // deleted elsewhere but changed here: this instance's work is kept
    }
    // otherwise: deleted elsewhere and untouched here, so it stays deleted
  }

  for (const theirs of remote) {
    if (localIds.has(theirs.id)) continue;
    if (baseById.has(theirs.id)) continue; // deleted here
    out.push(theirs); // added elsewhere
  }
  return out;
}

export interface MergeResult {
  merged: StatePayload;
  /** True when the result differs from `local`, that is, other instances had saved something this one did not have. */
  changedByOthers: boolean;
}

/**
 * Merges this instance's changes onto what is stored. With no `base` (the instance never loaded the stored state, for
 * example after falling back to a local file) nothing can be recognised as a deliberate removal, so the merge only adds and
 * updates: items and fields that exist only in the database are kept.
 */
export function mergeState(base: StatePayload | null | undefined, local: StatePayload, remote: StatePayload | null | undefined): MergeResult {
  if (!remote || typeof remote !== 'object') return { merged: local, changedByOthers: false };
  const merged: StatePayload = {};
  const keys = new Set([...Object.keys(remote), ...Object.keys(local)]);

  for (const key of keys) {
    const mine = local[key];
    const theirs = remote[key];
    const was = base ? base[key] : undefined;

    if (UNMERGED_KEYS.has(key)) {
      merged[key] = key in local ? mine : theirs;
    } else if ((Array.isArray(mine) || Array.isArray(theirs)) && isItemList(mine ?? []) && isItemList(theirs ?? [])) {
      merged[key] = mergeCollection(isItemList(was) ? was : undefined, mine ?? [], theirs ?? []);
    } else if (!base) {
      merged[key] = mine !== undefined ? mine : theirs;
    } else {
      merged[key] = same(mine, was) ? theirs : mine;
    }
    if (merged[key] === undefined) delete merged[key];
  }

  let changedByOthers = false;
  for (const key of Object.keys(merged)) {
    if (!UNMERGED_KEYS.has(key) && !same(merged[key], local[key])) {
      changedByOthers = true;
      break;
    }
  }
  return { merged, changedByOthers };
}

/**
 * Brings a merged payload into a live state object WITHOUT replacing the objects code may still be holding: lists keep
 * their identity, existing items are updated in place, items added elsewhere are appended and items deleted elsewhere removed.
 * Truncated lists (UNMERGED_KEYS) are left as they are in memory.
 */
export function applyMerged(live: StatePayload, merged: StatePayload): void {
  for (const key of Object.keys(merged)) {
    if (UNMERGED_KEYS.has(key)) continue;
    const next = merged[key];
    const current = live[key];
    if (Array.isArray(current) && isItemList(current) && isItemList(next)) {
      const nextById = new Map(next.map((i) => [i.id, i]));
      for (let i = current.length - 1; i >= 0; i--) {
        const target = nextById.get(current[i].id);
        if (!target) {
          current.splice(i, 1);
          continue;
        }
        const item = current[i];
        for (const k of Object.keys(item)) if (!(k in target)) delete item[k];
        Object.assign(item, target);
        nextById.delete(item.id);
      }
      for (const added of nextById.values()) current.push(added);
    } else {
      live[key] = next;
    }
  }
}
