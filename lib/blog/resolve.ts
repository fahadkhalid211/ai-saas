import { getPost, getRawPost, polish, type BlogPost } from './posts';
import { getOverride, listOverrides, type BlogOverride } from './store';
import { fromMarkup } from './markup';
import { wordCount } from './blocks';

/** The article with the owner's edit applied (when there is one). */
export function withOverride(base: BlogPost, o: BlogOverride | null | undefined): BlogPost {
  if (!o) return base;
  const raw = getRawPost(base.slug) ?? base;
  const body = fromMarkup(o.bodyMarkup);
  return polish({ ...raw, title: o.title, description: o.description, body, readMinutes: Math.max(3, Math.round(wordCount(body) / 220)), dateModified: o.updatedAt.slice(0, 10) });
}

function withTimeout<T>(p: Promise<T>, ms: number, fallback: T): Promise<T> {
  return Promise.race([p, new Promise<T>((resolve) => setTimeout(() => resolve(fallback), ms))]);
}

/** Falls back to the version in the code if the database is slow or down, so a page never fails because of it. */
export async function getPostResolved(slug: string): Promise<BlogPost | undefined> {
  const base = getPost(slug);
  if (!base) return undefined;
  try {
    return withOverride(base, await withTimeout(getOverride(slug), 2500, null));
  } catch {
    return base;
  }
}

export async function overridesBySlug(): Promise<Map<string, BlogOverride>> {
  try {
    return new Map((await withTimeout(listOverrides(), 2500, [])).map((o) => [o.slug, o]));
  } catch {
    return new Map();
  }
}
