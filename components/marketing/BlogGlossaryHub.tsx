'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import type { BlogPost, ClusterSummary } from '@/lib/blog/posts';

interface BlogGlossaryHubProps {
  posts: BlogPost[];
  clusters: ClusterSummary[];
}

export function BlogGlossaryHub({ posts, clusters }: BlogGlossaryHubProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClusterId, setSelectedClusterId] = useState<number | null>(null);
  const [selectedFunnel, setSelectedFunnel] = useState<string>('ALL');

  // Filter posts based on search query, cluster, and funnel
  const filteredPosts = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return posts.filter((p) => {
      // Cluster filter
      if (selectedClusterId !== null && p.clusterId !== selectedClusterId) {
        return false;
      }
      // Funnel filter
      if (selectedFunnel !== 'ALL' && p.funnel !== selectedFunnel) {
        return false;
      }
      // Search query filter
      if (!q) return true;
      const titleMatch = p.title.toLowerCase().includes(q);
      const excerptMatch = p.excerpt.toLowerCase().includes(q);
      const descMatch = p.description.toLowerCase().includes(q);
      const tagMatch = p.tags.some((t) => t.toLowerCase().includes(q));
      const clusterMatch = p.clusterName ? p.clusterName.toLowerCase().includes(q) : false;
      const kwMatch = p.primaryKeyword ? p.primaryKeyword.toLowerCase().includes(q) : false;

      return titleMatch || excerptMatch || descMatch || tagMatch || clusterMatch || kwMatch;
    });
  }, [posts, searchQuery, selectedClusterId, selectedFunnel]);

  const activeClusterName = useMemo(() => {
    if (selectedClusterId === null) return null;
    const c = clusters.find((item) => item.id === selectedClusterId);
    return c ? c.name : null;
  }, [selectedClusterId, clusters]);

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedClusterId(null);
    setSelectedFunnel('ALL');
  };

  return (
    <div style={{ marginTop: '2rem' }}>
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
            Search Knowledge Hub & Glossary
          </label>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <span
              style={{
                position: 'absolute',
                left: '1rem',
                fontSize: '1.1rem',
                color: 'var(--mk-muted)',
                pointerEvents: 'none',
              }}
            >
              🔍
            </span>
            <input
              id="glossary-search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search 200+ guides by keyword, topic, or industry (e.g. appointment booking, dental, plumbing, RAG, BYOK)..."
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
                onClick={() => setSearchQuery('')}
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
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--mk-muted)' }}>
            <div>
              Showing <strong>{filteredPosts.length}</strong> of {posts.length} articles
              {activeClusterName && <span> in <strong>{activeClusterName}</strong></span>}
              {searchQuery && <span> matching &ldquo;{searchQuery}&rdquo;</span>}
            </div>
            {(selectedClusterId !== null || searchQuery || selectedFunnel !== 'ALL') && (
              <button
                type="button"
                onClick={resetFilters}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--mk-accent, #2563eb)',
                  textDecoration: 'underline',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                }}
              >
                Clear all filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: '2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', alignItems: 'start' }}>
          
          {/* Left Sidebar: Clusters & Topic Taxonomy */}
          <aside
            aria-label="Topic Clusters"
            className="mk-card"
            style={{
              padding: '1.25rem',
              borderRadius: '10px',
              position: 'sticky',
              top: '5rem',
              maxHeight: 'calc(100vh - 6.5rem)',
              overflowY: 'auto',
            }}
          >
            <div style={{ marginBottom: '1.25rem' }}>
              <p style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--mk-muted)', marginBottom: '0.5rem' }}>
                TOPIC CLUSTERS
              </p>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <li>
                  <button
                    type="button"
                    onClick={() => setSelectedClusterId(null)}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '0.45rem 0.6rem',
                      borderRadius: '6px',
                      fontSize: '0.88rem',
                      fontWeight: selectedClusterId === null ? 700 : 500,
                      background: selectedClusterId === null ? 'var(--mk-surface-muted, #eff6ff)' : 'transparent',
                      color: selectedClusterId === null ? 'var(--mk-accent, #2563eb)' : 'inherit',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <span>All Topics</span>
                    <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>({posts.length})</span>
                  </button>
                </li>
                {clusters.map((c) => {
                  const isSelected = selectedClusterId === c.id;
                  return (
                    <li key={c.id}>
                      <button
                        type="button"
                        onClick={() => setSelectedClusterId(isSelected ? null : c.id)}
                        style={{
                          width: '100%',
                          textAlign: 'left',
                          padding: '0.45rem 0.6rem',
                          borderRadius: '6px',
                          fontSize: '0.86rem',
                          fontWeight: isSelected ? 700 : 500,
                          background: isSelected ? 'var(--mk-surface-muted, #eff6ff)' : 'transparent',
                          color: isSelected ? 'var(--mk-accent, #2563eb)' : 'inherit',
                          border: 'none',
                          cursor: 'pointer',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          lineHeight: 1.3,
                        }}
                      >
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: '0.4rem' }}>
                          {c.name}
                        </span>
                        <span style={{ fontSize: '0.75rem', opacity: 0.7, flexShrink: 0 }}>
                          {c.count}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Funnel Stage Filter */}
            <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--mk-border, #e2e8f0)' }}>
              <p style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--mk-muted)', marginBottom: '0.5rem' }}>
                INTENT & STAGE
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                {['ALL', 'BOFU', 'MOFU', 'TOFU'].map((stage) => {
                  const isSelected = selectedFunnel === stage;
                  const label =
                    stage === 'ALL'
                      ? 'All Stages'
                      : stage === 'BOFU'
                      ? 'Commercial'
                      : stage === 'MOFU'
                      ? 'Guides'
                      : 'Educational';
                  return (
                    <button
                      key={stage}
                      type="button"
                      onClick={() => setSelectedFunnel(stage)}
                      style={{
                        padding: '0.3rem 0.6rem',
                        borderRadius: '4px',
                        fontSize: '0.78rem',
                        fontWeight: isSelected ? 700 : 500,
                        border: '1px solid var(--mk-border, #cbd5e1)',
                        background: isSelected ? 'var(--mk-ink, #0f172a)' : 'transparent',
                        color: isSelected ? '#ffffff' : 'inherit',
                        cursor: 'pointer',
                      }}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Product Pitch */}
            <div
              style={{
                marginTop: '1.5rem',
                padding: '1rem',
                borderRadius: '8px',
                background: 'var(--mk-surface-muted, #f8fafc)',
                border: '1px solid var(--mk-border, #e2e8f0)',
                fontSize: '0.85rem',
              }}
            >
              <p style={{ fontWeight: 700, marginBottom: '0.3rem' }}>Deploy on Your Website</p>
              <p style={{ color: 'var(--mk-muted)', lineHeight: 1.5, marginBottom: '0.75rem' }}>
                Turn every website visitor into a confirmed booking. 14-day free trial.
              </p>
              <Link
                href="/login?mode=register"
                style={{
                  display: 'inline-block',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  color: 'var(--mk-accent, #2563eb)',
                  textDecoration: 'underline',
                }}
              >
                Start free trial →
              </Link>
            </div>
          </aside>

          {/* Right Main Content: Article Cards */}
          <main style={{ gridColumn: 'span 2' }}>
            {filteredPosts.length === 0 ? (
              <div
                className="mk-card"
                style={{
                  padding: '3rem 2rem',
                  textAlign: 'center',
                  color: 'var(--mk-muted)',
                }}
              >
                <p style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--mk-ink)' }}>
                  No guides match your search criteria.
                </p>
                <p style={{ marginBottom: '1.25rem' }}>
                  Try different keywords, or reset your filters to browse the full directory.
                </p>
                <button
                  type="button"
                  onClick={resetFilters}
                  style={{
                    padding: '0.6rem 1.25rem',
                    borderRadius: '6px',
                    background: 'var(--mk-accent, #2563eb)',
                    color: '#ffffff',
                    border: 'none',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Reset all filters
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '1.25rem' }}>
                {filteredPosts.map((p) => (
                  <article
                    key={p.slug}
                    className="mk-card"
                    style={{
                      padding: '1.5rem',
                      borderRadius: '10px',
                      transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                    }}
                  >
                    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem', fontSize: '0.78rem' }}>
                      {p.clusterName && (
                        <span
                          style={{
                            fontWeight: 700,
                            letterSpacing: '0.04em',
                            color: 'var(--mk-accent, #2563eb)',
                            background: 'rgba(37, 99, 235, 0.08)',
                            padding: '0.2rem 0.5rem',
                            borderRadius: '4px',
                            textTransform: 'uppercase',
                          }}
                        >
                          {p.clusterName}
                        </span>
                      )}
                      <span style={{ color: 'var(--mk-muted)', fontWeight: 600 }}>
                        ⏱️ {p.readMinutes} MIN READ
                      </span>
                      {p.funnel && (
                        <span
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: 600,
                            color: 'var(--mk-muted)',
                            border: '1px solid var(--mk-border, #cbd5e1)',
                            padding: '0.1rem 0.4rem',
                            borderRadius: '3px',
                          }}
                        >
                          {p.funnel}
                        </span>
                      )}
                    </div>

                    <h2 style={{ fontSize: '1.35rem', margin: '0.4rem 0 0.5rem', lineHeight: 1.35 }}>
                      <Link
                        href={`/blog/${p.slug}`}
                        style={{
                          color: 'var(--mk-ink, #0f172a)',
                          textDecoration: 'none',
                        }}
                      >
                        {p.title}
                      </Link>
                    </h2>

                    <p style={{ color: 'var(--mk-muted)', lineHeight: 1.6, fontSize: '0.95rem', marginBottom: '0.85rem' }}>
                      {p.excerpt}
                    </p>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.85rem', paddingTop: '0.75rem', borderTop: '1px solid var(--mk-border, #f1f5f9)' }}>
                      <time dateTime={p.datePublished} style={{ color: 'var(--mk-muted)' }}>
                        {new Date(p.datePublished).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </time>
                      <Link
                        href={`/blog/${p.slug}`}
                        style={{
                          fontWeight: 700,
                          color: 'var(--mk-accent, #2563eb)',
                          textDecoration: 'none',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                        }}
                      >
                        Read guide <span>→</span>
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
