'use client';

import { T, useT, useI18n } from '@/lib/i18n/context';
import { DATE_LOCALE } from '@/lib/i18n/format';
import React, { useState, useMemo } from 'react';
import Link from '@/components/i18n/Link';
import { Search, X, Clock } from 'lucide-react';
import type { BlogCard } from '@/lib/blog/card';

/** What the hub needs of an article. Every field here is sent to the browser for every article, so only what is shown or searched. */
export type HubCard = Pick<BlogCard, 'slug' | 'title' | 'excerpt' | 'datePublished' | 'readMinutes' | 'tags' | 'clusterId' | 'clusterName' | 'primaryKeyword'>;
import type { ClusterSummary } from '@/lib/blog';

interface BlogGlossaryHubProps {
  posts: HubCard[];
  clusters: ClusterSummary[];
  /** Slugs that exist in the page's language; articles not listed are linked in English. */
  translated?: string[];
}

const POSTS_PER_PAGE = 12;

export function BlogGlossaryHub({ posts, clusters, translated }: BlogGlossaryHubProps) {
  const __t = useT();
  const { locale } = useI18n();
  const inLanguage = useMemo(() => (translated ? new Set(translated) : null), [translated]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClusterId, setSelectedClusterId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Filter posts based on search query and cluster
  const filteredPosts = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return posts.filter((p) => {
      // Cluster filter
      if (selectedClusterId !== null && p.clusterId !== selectedClusterId) {
        return false;
      }
      // Search query filter
      if (!q) return true;
      const titleMatch = p.title.toLowerCase().includes(q);
      const excerptMatch = p.excerpt.toLowerCase().includes(q);
      const tagMatch = p.tags.some((t) => t.toLowerCase().includes(q));
      const clusterMatch = p.clusterName ? p.clusterName.toLowerCase().includes(q) : false;
      const kwMatch = p.primaryKeyword ? p.primaryKeyword.toLowerCase().includes(q) : false;

      return titleMatch || excerptMatch || tagMatch || clusterMatch || kwMatch;
    });
  }, [posts, searchQuery, selectedClusterId]);

  // Total pages and sliced paginated posts
  const totalPages = Math.max(1, Math.ceil(filteredPosts.length / POSTS_PER_PAGE));

  const paginatedPosts = useMemo(() => {
    const start = (currentPage - 1) * POSTS_PER_PAGE;
    return filteredPosts.slice(start, start + POSTS_PER_PAGE);
  }, [filteredPosts, currentPage]);

  const activeClusterName = useMemo(() => {
    if (selectedClusterId === null) return null;
    const c = clusters.find((item) => item.id === selectedClusterId);
    return c ? c.name : null;
  }, [selectedClusterId, clusters]);

  const scrollToTop = () => {
    if (typeof window !== 'undefined') {
      const anchor = document.getElementById('glossary-results-anchor');
      if (anchor) {
        anchor.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        window.scrollTo({ top: 120, behavior: 'smooth' });
      }
    }
  };

  const handleSelectCluster = (id: number | null) => {
    setSelectedClusterId((prev) => (prev === id ? null : id));
    setCurrentPage(1);
    scrollToTop();
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);
    scrollToTop();
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedClusterId(null);
    setCurrentPage(1);
    scrollToTop();
  };

  return (
    <div style={{ marginTop: '2rem' }}>
      {/* Anchor for smooth scroll back to top of results */}
      <div id="glossary-results-anchor" style={{ scrollMarginTop: '6rem' }} />

      {/* Search Header Bar */}
      <div
        className="mk-card"
        style={{
          padding: '1.25rem 1.5rem',
          marginBottom: '2rem',
          borderRadius: '12px',
          boxShadow: '0 4px 20px -2px rgba(0,0,0,0.05)',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <label htmlFor="glossary-search" style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--mk-ink)' }}>
            <T>Search Knowledge Hub & Glossary</T>
          </label>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <span style={{ position: 'absolute', left: '1rem', display: 'inline-flex', alignItems: 'center', color: 'var(--mk-muted)', pointerEvents: 'none' }}><Search className="h-4 w-4" /></span>
            <input
              id="glossary-search"
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder={__t("Search 200+ guides by keyword, topic, or industry (e.g. appointment booking, dental, plumbing, RAG, BYOK)...")}
              style={{
                width: '100%',
                padding: '0.85rem 2.8rem 0.85rem 3rem',
                fontSize: '1rem',
                borderRadius: '8px',
                border: '1px solid var(--mk-border, #cbd5e1)',
                background: 'var(--mk-surface, #ffffff)',
                color: 'var(--mk-ink, #0f172a)',
                outline: 'none',
              }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setCurrentPage(1);
                }}
                style={{
                  position: 'absolute',
                  right: '0.75rem',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--mk-muted)',
                  fontSize: '1.2rem',
                  padding: '0.2rem 0.5rem',
                }}
                aria-label={__t("Clear search")}
              >
                <X className="h-4 w-4 inline" />
              </button>
            )}
          </div>

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.5rem',
              fontSize: '0.85rem',
              color: 'var(--mk-muted)',
            }}
          >
            <div>
              <span>
                {__t('Showing {range} of {total} articles', {
                  range:
                    filteredPosts.length === 0
                      ? '0'
                      : `${(currentPage - 1) * POSTS_PER_PAGE + 1}–${Math.min(
                          currentPage * POSTS_PER_PAGE,
                          filteredPosts.length
                        )}`,
                  total: filteredPosts.length,
                })}
              </span>
              {activeClusterName && (
                <span>
                  {' '}
                  <T>in</T> <strong><T>{activeClusterName}</T></strong>
                </span>
              )}
              {searchQuery && <span> <T>matching &ldquo;</T><T>{searchQuery}</T>&rdquo;</span>}
            </div>
            {(selectedClusterId !== null || searchQuery) && (
              <button
                type="button"
                onClick={resetFilters}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#2563eb',
                  textDecoration: 'underline',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                }}
              >
                <T>Clear all filters</T>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="mk-glossary-layout">
        {/* Left Sticky Sidebar: Topic Clusters */}
        <aside
          aria-label={__t("Topic Clusters")}
          translate="no"
          className="mk-sidebar-sticky mk-sidebar-scroll notranslate"
          style={{
            padding: '1.25rem',
            borderRadius: '10px',
            background: 'var(--mk-surface)',
            border: '1px solid var(--mk-line, #e2e8f0)',
          }}
        >
          <div style={{ marginBottom: '1.25rem' }}>
            <p
              style={{
                fontSize: '0.75rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: 'var(--mk-muted)',
                marginBottom: '0.6rem',
              }}
            >
              <T>TOPIC CLUSTERS</T>
            </p>
            <ul
              style={{
                listStyle: 'none',
                padding: 0,
                margin: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: '0.25rem',
              }}
            >
              <li>
                <button
                  type="button"
                  onClick={() => handleSelectCluster(null)}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '0.5rem 0.65rem',
                    borderRadius: '6px',
                    fontSize: '0.88rem',
                    fontWeight: selectedClusterId === null ? 700 : 500,
                    background: selectedClusterId === null ? 'var(--mk-surface-muted, #eff6ff)' : 'transparent',
                    color: selectedClusterId === null ? '#2563eb' : 'inherit',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <span><T>All Topics</T></span>
                  <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>(<T>{posts.length}</T>)</span>
                </button>
              </li>
              {clusters.map((c) => {
                const isSelected = selectedClusterId === c.id;
                return (
                  <li key={c.id}>
                    <button
                      type="button"
                      onClick={() => handleSelectCluster(c.id)}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '0.45rem 0.65rem',
                        borderRadius: '6px',
                        fontSize: '0.86rem',
                        fontWeight: isSelected ? 700 : 500,
                        background: isSelected ? 'var(--mk-surface-muted, #eff6ff)' : 'transparent',
                        color: isSelected ? '#2563eb' : 'inherit',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        lineHeight: 1.35,
                      }}
                    >
                      <span
                        style={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          paddingRight: '0.4rem',
                        }}
                      >
                        <T>{c.name}</T>
                      </span>
                      <span style={{ fontSize: '0.75rem', opacity: 0.7, flexShrink: 0 }}><T>{c.count}</T></span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Quick Product Pitch */}
          <div
            style={{
              paddingTop: '1rem',
              borderTop: '1px solid var(--mk-border, #e2e8f0)',
              fontSize: '0.85rem',
            }}
          >
            <p style={{ fontWeight: 700, marginBottom: '0.3rem' }}><T>Deploy on Your Website</T></p>
            <p style={{ color: 'var(--mk-muted)', lineHeight: 1.5, marginBottom: '0.75rem' }}>
              <T>Turn visitors into confirmed appointments 24/7.</T>
            </p>
            <Link
              href="/login?mode=register"
              style={{
                display: 'inline-block',
                fontWeight: 700,
                fontSize: '0.82rem',
                color: '#2563eb',
                textDecoration: 'underline',
              }}
            >
              <T>Start 14-day trial →</T>
            </Link>
          </div>
        </aside>

        {/* Right Main Content: Article Cards + Pagination */}
        <main style={{ minWidth: 0 }}>
          {filteredPosts.length === 0 ? (
            <div
              className="mk-card"
              style={{
                padding: '3rem 2rem',
                textAlign: 'center',
                color: 'var(--mk-muted)',
                borderRadius: '10px',
              }}
            >
              <p style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--mk-ink)' }}>
                <T>No guides match your search criteria.</T>
              </p>
              <p style={{ marginBottom: '1.25rem' }}>
                <T>Try different keywords, or reset your filters to browse the full directory.</T>
              </p>
              <button
                type="button"
                onClick={resetFilters}
                style={{
                  padding: '0.6rem 1.25rem',
                  borderRadius: '6px',
                  background: '#2563eb',
                  color: '#ffffff',
                  border: 'none',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <T>Reset all filters</T>
              </button>
            </div>
          ) : (
            <>
              <div style={{ display: 'grid', gap: '1.25rem' }}>
                {paginatedPosts.map((p) => {
                  const isHumanTranslated = Boolean(inLanguage && inLanguage.has(p.slug));
                  return (
                  <article
                    key={p.slug}
                    translate={isHumanTranslated ? 'no' : undefined}
                    className={`mk-card ${isHumanTranslated ? 'notranslate' : ''}`}
                    style={{
                      padding: '1.5rem',
                      borderRadius: '10px',
                      transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        alignItems: 'center',
                        gap: '0.5rem',
                        marginBottom: '0.5rem',
                        fontSize: '0.78rem',
                      }}
                    >
                      {p.clusterName && (
                        <span
                          style={{
                            fontWeight: 700,
                            letterSpacing: '0.04em',
                            color: '#2563eb',
                            background: 'rgba(37, 99, 235, 0.08)',
                            padding: '0.2rem 0.5rem',
                            borderRadius: '4px',
                            textTransform: 'uppercase',
                          }}
                        >
                          <T>{p.clusterName}</T>
                        </span>
                      )}
                      <span style={{ color: 'var(--mk-muted)', fontWeight: 600 }}>
                        <Clock className="h-3.5 w-3.5 inline mr-1 text-slate-500" /> <T>{p.readMinutes}</T> <T>MIN READ</T>
                      </span>
                    </div>

                    <h2 style={{ fontSize: '1.35rem', margin: '0.4rem 0 0.5rem', lineHeight: 1.35 }}>
                      <Link
                        href={`/blog/${p.slug}`}
                        className="mk-animated-link"
                        style={{
                          color: 'var(--mk-ink, #0f172a)',
                        }}
                      >
                        <T>{p.title}</T>
                      </Link>
                    </h2>

                    <p style={{ color: 'var(--mk-muted)', lineHeight: 1.6, fontSize: '0.95rem', marginBottom: '0.85rem' }}>
                      <T>{p.excerpt}</T>
                    </p>

                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontSize: '0.85rem',
                        paddingTop: '0.75rem',
                        borderTop: '1px solid var(--mk-border, #f1f5f9)',
                      }}
                    >
                      <time dateTime={p.datePublished} style={{ color: 'var(--mk-muted)' }}>
                        {new Date(p.datePublished).toLocaleDateString(DATE_LOCALE[locale], {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </time>
                      <Link
                        href={`/blog/${p.slug}`}
                        className="mk-animated-link"
                        style={{
                          fontWeight: 700,
                          color: '#2563eb',
                        }}
                      >
                        <T>Read guide →</T>
                      </Link>
                    </div>
                  </article>
                  );
                })}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <nav
                  aria-label={__t("Blog pagination")}
                  className="mk-card"
                  style={{
                    marginTop: '2.5rem',
                    padding: '1rem clamp(0.75rem, 3vw, 1.25rem)',
                    borderRadius: '10px',
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.75rem',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    style={{
                      padding: '0.45rem 0.9rem',
                      borderRadius: '6px',
                      border: '1px solid var(--mk-border, #cbd5e1)',
                      background: currentPage === 1 ? 'transparent' : 'var(--mk-surface, #ffffff)',
                      color: currentPage === 1 ? 'var(--mk-muted)' : 'var(--mk-ink)',
                      cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                      fontWeight: 600,
                      fontSize: '0.88rem',
                    }}
                  >
                    <T>← Previous</T>
                  </button>

                  <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.35rem' }}>
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter((p) => {
                        // Always show first, last, and pages near current
                        return p === 1 || p === totalPages || Math.abs(p - currentPage) <= 2;
                      })
                      .map((pageNum, idx, arr) => {
                        const showEllipsisBefore = idx > 0 && pageNum - arr[idx - 1] > 1;
                        return (
                          <React.Fragment key={pageNum}>
                            {showEllipsisBefore && (
                              <span style={{ padding: '0 0.3rem', color: 'var(--mk-muted)' }}>…</span>
                            )}
                            <button
                              type="button"
                              onClick={() => handlePageChange(pageNum)}
                              style={{
                                width: '2.2rem',
                                height: '2.2rem',
                                borderRadius: '6px',
                                border: '1px solid var(--mk-border, #cbd5e1)',
                                background: currentPage === pageNum ? '#2563eb' : 'transparent',
                                color: currentPage === pageNum ? '#ffffff' : 'inherit',
                                fontWeight: currentPage === pageNum ? 700 : 500,
                                fontSize: '0.88rem',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <T>{pageNum}</T>
                            </button>
                          </React.Fragment>
                        );
                      })}
                  </div>

                  <button
                    type="button"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    style={{
                      padding: '0.45rem 0.9rem',
                      borderRadius: '6px',
                      border: '1px solid var(--mk-border, #cbd5e1)',
                      background: currentPage === totalPages ? 'transparent' : 'var(--mk-surface, #ffffff)',
                      color: currentPage === totalPages ? 'var(--mk-muted)' : 'var(--mk-ink)',
                      cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                      fontWeight: 600,
                      fontSize: '0.88rem',
                    }}
                  >
                    <T>Next →</T>
                  </button>
                </nav>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
