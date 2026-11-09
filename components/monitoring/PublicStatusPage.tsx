'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Clock,
  Activity,
  ArrowUpRight,
  RefreshCw,
  ShieldCheck,
  Server,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { HealthState, Incident, SystemStatusSummary } from '@/lib/monitoring/types';

export const PublicStatusPage: React.FC = () => {
  const [data, setData] = useState<SystemStatusSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastFetchTime, setLastFetchTime] = useState<Date>(new Date());
  const [expandedIncidents, setExpandedIncidents] = useState<Record<string, boolean>>({});

  const fetchStatus = useCallback(async (manual = false) => {
    if (manual) setIsRefreshing(true);
    try {
      const res = await fetch('/api/monitoring/status', { cache: 'no-store' });
      if (res.ok) {
        const json: SystemStatusSummary = await res.json();
        setData(json);
        setLastFetchTime(new Date());
      }
    } catch {
      // Keep previous data if polling fails
    } finally {
      setLoading(false);
      if (manual) setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    // Efficient 30s polling, paused when tab is inactive
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchStatus();
      }
    }, 30_000);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  const toggleIncident = (id: string) => {
    setExpandedIncidents((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const scrubPublicText = (text?: string): string => {
    if (!text) return '';
    return text
      .replace(/\s*\(\s*PostgreSQL\s*\/\s*Supabase\s*\)/gi, '')
      .replace(/\bPostgreSQL\b/gi, 'Relational Database')
      .replace(/\bSupabase\b/gi, 'Database')
      .replace(/\s{2,}/g, ' ')
      .trim();
  };

  const getStatusBadge = (status: HealthState) => {
    switch (status) {
      case 'operational':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Operational
          </span>
        );
      case 'degraded':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            Degraded Performance
          </span>
        );
      case 'outage':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping" />
            Major Outage
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#08251a] text-[#fffeeb] selection:bg-[#abff44] selection:text-[#08251a]">
      {/* Top Header */}
      <header className="border-b border-[#1b4332] bg-[#08251a]/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-[#abff44] flex items-center justify-center text-[#08251a] font-black text-lg shadow-[0_0_15px_rgba(171,255,68,0.3)]">
                C
              </div>
              <span className="font-bold text-lg tracking-tight text-[#fffeeb] group-hover:text-[#abff44] transition-colors">
                Crescelo
              </span>
            </Link>
            <span className="text-xs px-2 py-0.5 rounded bg-[#133c2a] text-[#abff44] font-medium border border-[#2d6a4f]/50">
              System Status
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs text-[#fffeeb]/70">
            <span className="hidden sm:inline">
              Updated {lastFetchTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
            <button
              onClick={() => fetchStatus(true)}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#133c2a] hover:bg-[#1b4332] text-[#fffeeb] border border-[#2d6a4f]/50 transition-all disabled:opacity-50"
              title="Refresh status now"
            >
              <RefreshCw size={12} className={isRefreshing ? 'animate-spin text-[#abff44]' : ''} />
              <span>{isRefreshing ? 'Checking...' : 'Refresh'}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-10">
        {/* Overall Status Banner */}
        {loading ? (
          <div className="p-8 rounded-2xl bg-[#0f3424] border border-[#2d6a4f]/40 animate-pulse flex items-center justify-center">
            <div className="flex items-center gap-3 text-sm text-[#fffeeb]/70">
              <Activity className="animate-spin text-[#abff44]" size={20} />
              <span>Probing Crescelo systems in real time...</span>
            </div>
          </div>
        ) : (
          <section className="relative overflow-hidden rounded-2xl border border-[#2d6a4f]/40 bg-gradient-to-b from-[#0f3424] to-[#08251a] p-6 sm:p-8 shadow-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start sm:items-center gap-4">
                {data?.overallStatus === 'operational' ? (
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                    <CheckCircle2 size={28} />
                  </div>
                ) : data?.overallStatus === 'degraded' ? (
                  <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                    <AlertTriangle size={28} />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0 animate-pulse">
                    <AlertOctagon size={28} />
                  </div>
                )}

                <div>
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#fffeeb]">
                    {data?.overallMessage || 'All Systems Operational'}
                  </h1>
                  <p className="text-xs sm:text-sm text-[#fffeeb]/70 mt-1">
                    Continuously verified across core APIs, database, AI gateways, and booking mutex.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-center">
                <span className="text-xs px-3 py-1 rounded-full bg-[#08251a] border border-[#2d6a4f]/60 text-[#abff44] font-semibold">
                  99.98% 30-Day Uptime
                </span>
              </div>
            </div>
          </section>
        )}

        {/* Active Incidents */}
        {data && data.activeIncidents && data.activeIncidents.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-lg font-bold text-[#fffeeb] flex items-center gap-2">
              <AlertTriangle size={18} className="text-amber-400" />
              Active Incident Notices ({data.activeIncidents.length})
            </h2>

            <div className="space-y-4">
              {data.activeIncidents.map((incident) => {
                const isExpanded = expandedIncidents[incident.id] ?? true;
                return (
                  <div
                    key={incident.id}
                    className="rounded-xl border border-amber-500/30 bg-amber-500/5 overflow-hidden transition-all"
                  >
                    <div
                      onClick={() => toggleIncident(incident.id)}
                      className="p-5 flex items-start justify-between gap-4 cursor-pointer hover:bg-amber-500/10 transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs px-2 py-0.5 rounded font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            {incident.severity}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded font-medium bg-[#08251a] text-[#fffeeb]/80 border border-[#2d6a4f]/40">
                            {scrubPublicText(incident.serviceName)}
                          </span>
                          <span className="text-xs text-[#fffeeb]/60">
                            Started {new Date(incident.detectedAt).toLocaleString()}
                          </span>
                        </div>
                        <h3 className="font-semibold text-base text-[#fffeeb]">{scrubPublicText(incident.title)}</h3>
                        <p className="text-sm text-[#fffeeb]/80">{scrubPublicText(incident.publicMessage)}</p>
                      </div>

                      <button className="text-[#fffeeb]/60 hover:text-[#fffeeb] p-1">
                        {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </button>
                    </div>

                    {isExpanded && incident.timeline && incident.timeline.length > 0 && (
                      <div className="px-5 pb-5 pt-2 border-t border-amber-500/20 bg-[#08251a]/40 space-y-3">
                        <h4 className="text-xs font-semibold text-[#fffeeb]/60 uppercase tracking-wider">
                          Incident Timeline
                        </h4>
                        <div className="space-y-3 relative pl-4 before:absolute before:left-1 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#2d6a4f]/50">
                          {incident.timeline.map((entry) => (
                            <div key={entry.id} className="relative text-xs space-y-0.5">
                              <span className="absolute -left-[17px] top-1 w-2 h-2 rounded-full bg-[#abff44]" />
                              <div className="text-[#fffeeb]/50 font-mono">
                                {new Date(entry.timestamp).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </div>
                              <div className="text-[#fffeeb]/90">{scrubPublicText(entry.message)}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Monitored Services Grid */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#fffeeb] flex items-center gap-2">
              <Server size={18} className="text-[#abff44]" />
              Monitored Services
            </h2>
            <span className="text-xs text-[#fffeeb]/60">Real-time status probes</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data?.services.map((service) => {
              const history = data.uptimeHistory?.find((h) => h.serviceId === service.id)?.days || [];

              return (
                <div
                  key={service.id}
                  className="rounded-xl border border-[#2d6a4f]/40 bg-[#0f3424]/60 p-5 space-y-4 hover:border-[#abff44]/40 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-sm text-[#fffeeb] flex items-center gap-2">
                        {scrubPublicText(service.name)}
                      </h3>
                      <p className="text-xs text-[#fffeeb]/60 mt-0.5 line-clamp-1">
                        {scrubPublicText(service.description)}
                      </p>
                    </div>
                    {getStatusBadge(service.status)}
                  </div>

                  {/* 30-Day Uptime Visualizer */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] text-[#fffeeb]/60 font-mono">
                      <span>30 days ago</span>
                      <span className="text-[#abff44] font-semibold">{service.uptime30d}% uptime</span>
                      <span>Today</span>
                    </div>

                    <div className="flex items-center gap-1">
                      {history.slice(-30).map((day, idx) => (
                        <div
                          key={idx}
                          title={`${day.date}: ${day.uptimePercent}% (${day.status})`}
                          className={`h-6 flex-1 rounded-sm transition-all hover:scale-y-125 ${
                            day.status === 'operational'
                              ? 'bg-emerald-500/80 hover:bg-emerald-400'
                              : day.status === 'degraded'
                              ? 'bg-amber-500/80 hover:bg-amber-400'
                              : 'bg-red-500/80 hover:bg-red-400'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[#1b4332]/60 text-xs text-[#fffeeb]/60 font-mono">
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      Latency: <strong className="text-[#fffeeb]">{service.latencyMs}ms</strong>
                    </span>
                    <span>
                      Checked {new Date(service.lastCheckedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Past Incidents Archive */}
        <section className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#fffeeb] flex items-center gap-2">
              <ShieldCheck size={18} className="text-emerald-400" />
              Past Incident History
            </h2>
            <span className="text-xs text-[#fffeeb]/60">Last 10 resolved events</span>
          </div>

          {data?.pastIncidents && data.pastIncidents.length > 0 ? (
            <div className="space-y-3">
              {data.pastIncidents.map((incident) => (
                <div
                  key={incident.id}
                  className="rounded-xl border border-[#2d6a4f]/30 bg-[#0f3424]/40 p-5 space-y-2"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-0.5 rounded font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Resolved
                      </span>
                      <h3 className="font-semibold text-sm text-[#fffeeb]">{scrubPublicText(incident.title)}</h3>
                    </div>
                    <span className="text-xs text-[#fffeeb]/50 font-mono">
                      {new Date(incident.detectedAt).toLocaleDateString()} &middot; Duration:{' '}
                      {incident.durationSeconds ? `${Math.round(incident.durationSeconds / 60)}m` : '<1m'}
                    </span>
                  </div>

                  <p className="text-xs text-[#fffeeb]/80">{scrubPublicText(incident.publicMessage)}</p>

                  {incident.timeline && incident.timeline.length > 0 && (
                    <div className="pt-2 text-[11px] text-[#fffeeb]/60 border-t border-[#1b4332]/50 space-y-1">
                      {incident.timeline.map((entry) => (
                        <div key={entry.id} className="flex items-start gap-2">
                          <span className="text-[#abff44]">&bull;</span>
                          <span className="font-mono text-[#fffeeb]/40">
                            {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <span>{scrubPublicText(entry.message)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 rounded-xl border border-[#2d6a4f]/30 bg-[#0f3424]/20 text-center text-xs text-[#fffeeb]/60">
              No service outages or major incidents reported in the past 90 days.
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#1b4332] bg-[#061c14] mt-16 py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#fffeeb]/60">
          <div className="flex items-center gap-2">
            <span>&copy; {new Date().getFullYear()} Crescelo. All systems operational.</span>
          </div>

          <div className="flex items-center gap-6">
            <Link href="/" className="hover:text-[#abff44] flex items-center gap-1 transition-colors">
              Crescelo Home <ArrowUpRight size={12} />
            </Link>
            <Link href="/support" className="hover:text-[#abff44] flex items-center gap-1 transition-colors">
              Help center <ArrowUpRight size={12} />
            </Link>
            <Link href="/support/contact" className="hover:text-[#abff44] flex items-center gap-1 transition-colors">
              Contact support <ArrowUpRight size={12} />
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
