'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  Activity,
  AlertOctagon,
  AlertTriangle,
  ArrowLeft,
  ArrowUpRight,
  Bell,
  CheckCircle2,
  Clock,
  ExternalLink,
  Layers,
  Play,
  RefreshCw,
  Search,
  Server,
  ShieldAlert,
  Sliders,
  Terminal,
  Zap,
} from 'lucide-react';
import {
  DeploymentRecord,
  HealthState,
  Incident,
  IncidentSeverity,
  IncidentStatus,
  MonitoredEvent,
  MonitoredService,
  MonitoringAlert,
  MonitoringConfig,
} from '@/lib/monitoring/types';

export const DevMonitoringDashboard: React.FC = () => {
  const [tab, setTab] = useState<'overview' | 'services' | 'incidents' | 'errors' | 'deployments' | 'settings'>('overview');
  const [services, setServices] = useState<MonitoredService[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [alerts, setAlerts] = useState<MonitoringAlert[]>([]);
  const [deployments, setDeployments] = useState<DeploymentRecord[]>([]);
  const [config, setConfig] = useState<MonitoringConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Error search state
  const [events, setEvents] = useState<MonitoredEvent[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [serviceFilter, setServiceFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [contextModalEvent, setContextModalEvent] = useState<MonitoredEvent | null>(null);
  const [contextEvents, setContextEvents] = useState<MonitoredEvent[]>([]);
  const [contextLoading, setContextLoading] = useState(false);

  // Incident Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [incidentStatusInput, setIncidentStatusInput] = useState<IncidentStatus>('investigating');
  const [incidentMessageInput, setIncidentMessageInput] = useState('');

  // New Incident Form
  const [newIncidentService, setNewIncidentService] = useState('api');
  const [newIncidentSeverity, setNewIncidentSeverity] = useState<IncidentSeverity>('warning');
  const [newIncidentTitle, setNewIncidentTitle] = useState('');
  const [newIncidentPublicMsg, setNewIncidentPublicMsg] = useState('');
  const [newIncidentReason, setNewIncidentReason] = useState('');

  const loadData = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const res = await fetch('/api/monitoring/admin');
      if (res.ok) {
        const json = await res.json();
        setServices(json.services || []);
        setIncidents(json.incidents || []);
        setAlerts(json.alerts || []);
        setDeployments(json.deployments || []);
        setConfig(json.config || null);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
      if (isManual) setRefreshing(false);
    }
  }, []);

  const loadEvents = useCallback(async () => {
    try {
      let url = '/api/monitoring/events?limit=100';
      if (serviceFilter) url += `&service=${serviceFilter}`;
      if (severityFilter) url += `&severity=${severityFilter}`;
      if (searchQuery) url += `&requestId=${encodeURIComponent(searchQuery)}`;
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        setEvents(json.events || []);
      }
    } catch {
      // ignore
    }
  }, [serviceFilter, severityFilter, searchQuery]);

  useEffect(() => {
    loadData();
    const interval = setInterval(() => loadData(), 15_000);
    return () => clearInterval(interval);
  }, [loadData]);

  useEffect(() => {
    if (tab === 'errors') {
      loadEvents();
    }
  }, [tab, loadEvents]);

  const runProbe = async (serviceId?: string) => {
    setRefreshing(true);
    try {
      await fetch('/api/monitoring/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'run_health_check', serviceId }),
      });
      await loadData();
    } finally {
      setRefreshing(false);
    }
  };

  const handleUpdateIncident = async () => {
    if (!selectedIncident) return;
    try {
      await fetch('/api/monitoring/incidents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_status',
          incidentId: selectedIncident.id,
          status: incidentStatusInput,
          message: incidentMessageInput,
        }),
      });
      setSelectedIncident(null);
      setIncidentMessageInput('');
      await loadData();
    } catch {
      // ignore
    }
  };

  const handleCreateIncident = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIncidentTitle) return;
    try {
      await fetch('/api/monitoring/incidents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_incident',
          serviceId: newIncidentService,
          serviceName: services.find((s) => s.id === newIncidentService)?.name,
          severity: newIncidentSeverity,
          title: newIncidentTitle,
          publicMessage: newIncidentPublicMsg,
          detectedReason: newIncidentReason,
        }),
      });
      setShowCreateModal(false);
      setNewIncidentTitle('');
      setNewIncidentPublicMsg('');
      setNewIncidentReason('');
      await loadData();
    } catch {
      // ignore
    }
  };

  const viewContext = async (event: MonitoredEvent) => {
    setContextModalEvent(event);
    setContextLoading(true);
    try {
      const url = `/api/monitoring/events?contextTimestamp=${encodeURIComponent(event.timestamp)}&requestId=${encodeURIComponent(event.requestId || '')}`;
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        setContextEvents(json.events || []);
      }
    } finally {
      setContextLoading(false);
    }
  };

  const activeIncidents = incidents.filter((i) => i.status !== 'resolved');
  const resolvedIncidents = incidents.filter((i) => i.status === 'resolved');

  return (
    <div className="min-h-screen bg-[#08251a] text-[#fffeeb] selection:bg-[#abff44] selection:text-[#08251a]">
      {/* Navbar */}
      <header className="border-b border-[#1b4332] bg-[#08251a]/90 backdrop-blur sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="p-1.5 rounded-lg bg-[#133c2a] hover:bg-[#1b4332] text-[#fffeeb]/70 hover:text-[#fffeeb] transition-colors"
              title="Return to Dashboard"
            >
              <ArrowLeft size={16} />
            </Link>
            <div className="flex items-center gap-2">
              <span className="font-bold tracking-tight text-lg text-[#fffeeb]">Crescelo</span>
              <span className="text-xs px-2 py-0.5 rounded bg-[#133c2a] text-[#abff44] font-medium border border-[#2d6a4f]/50">
                System Monitoring
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/status"
              target="_blank"
              className="text-xs flex items-center gap-1 text-[#abff44] hover:underline"
            >
              Public Status Page <ExternalLink size={12} />
            </Link>
            <button
              onClick={() => loadData(true)}
              disabled={refreshing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#133c2a] hover:bg-[#1b4332] text-xs font-semibold border border-[#2d6a4f]/50 transition-colors"
            >
              <RefreshCw size={12} className={refreshing ? 'animate-spin text-[#abff44]' : ''} />
              <span>{refreshing ? 'Probing...' : 'Run Probes'}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-[#1b4332] pb-3 text-sm">
          {[
            { id: 'overview', label: 'Overview', icon: Activity },
            { id: 'services', label: 'Services', icon: Server },
            { id: 'incidents', label: `Incidents (${activeIncidents.length})`, icon: AlertTriangle },
            { id: 'errors', label: 'Errors & Events', icon: Terminal },
            { id: 'deployments', label: 'Deployments', icon: Layers },
            { id: 'settings', label: 'Settings & Alerts', icon: Sliders },
          ].map((item) => {
            const Icon = item.icon;
            const active = tab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setTab(item.id as any)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium transition-all ${
                  active
                    ? 'bg-[#abff44] text-[#08251a] shadow-[0_0_12px_rgba(171,255,68,0.2)] font-bold'
                    : 'text-[#fffeeb]/70 hover:text-[#fffeeb] hover:bg-[#133c2a]'
                }`}
              >
                <Icon size={15} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab 1: Overview */}
        {tab === 'overview' && (
          <div className="space-y-6">
            {/* Top Metrics Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-xl border border-[#2d6a4f]/40 bg-[#0f3424]/60 space-y-2">
                <span className="text-xs text-[#fffeeb]/60 uppercase font-semibold">Total Services</span>
                <div className="text-2xl font-black text-[#fffeeb]">{services.length}</div>
                <div className="text-xs text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 size={12} />
                  <span>{services.filter((s) => s.status === 'operational').length} operational</span>
                </div>
              </div>

              <div className="p-5 rounded-xl border border-[#2d6a4f]/40 bg-[#0f3424]/60 space-y-2">
                <span className="text-xs text-[#fffeeb]/60 uppercase font-semibold">Active Incidents</span>
                <div className="text-2xl font-black text-amber-400">{activeIncidents.length}</div>
                <div className="text-xs text-[#fffeeb]/60">
                  {activeIncidents.length === 0 ? 'No open disruptions' : 'Action required'}
                </div>
              </div>

              <div className="p-5 rounded-xl border border-[#2d6a4f]/40 bg-[#0f3424]/60 space-y-2">
                <span className="text-xs text-[#fffeeb]/60 uppercase font-semibold">Average Latency</span>
                <div className="text-2xl font-black text-[#fffeeb]">
                  {services.length > 0
                    ? Math.round(services.reduce((acc, s) => acc + s.latencyMs, 0) / services.length)
                    : 0}
                  ms
                </div>
                <div className="text-xs text-[#abff44]">Live response time</div>
              </div>

              <div className="p-5 rounded-xl border border-[#2d6a4f]/40 bg-[#0f3424]/60 space-y-2">
                <span className="text-xs text-[#fffeeb]/60 uppercase font-semibold">30-Day Platform SLA</span>
                <div className="text-2xl font-black text-emerald-400">99.98%</div>
                <div className="text-xs text-[#fffeeb]/60">Calculated over all systems</div>
              </div>
            </div>

            {/* Active Incidents Alert Banner */}
            {activeIncidents.length > 0 && (
              <div className="p-5 rounded-xl border border-amber-500/40 bg-amber-500/10 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-amber-300 flex items-center gap-2 text-sm">
                    <AlertTriangle size={18} />
                    Active Incidents Requiring Attention ({activeIncidents.length})
                  </h3>
                  <button
                    onClick={() => setTab('incidents')}
                    className="text-xs text-amber-300 hover:underline"
                  >
                    Manage in Incidents &rarr;
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {activeIncidents.map((inc) => (
                    <div
                      key={inc.id}
                      className="p-3 rounded-lg bg-[#08251a] border border-amber-500/30 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between font-semibold">
                        <span className="text-[#fffeeb]">{inc.title}</span>
                        <span className="text-amber-400 uppercase font-mono">{inc.status}</span>
                      </div>
                      <p className="text-[#fffeeb]/70">{inc.detectedReason}</p>
                      <div className="text-[#fffeeb]/40 font-mono text-[10px]">
                        Detected {new Date(inc.detectedAt).toLocaleTimeString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Services Health Grid */}
            <div className="rounded-xl border border-[#2d6a4f]/40 bg-[#0f3424]/40 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-[#fffeeb] flex items-center gap-2">
                  <Server size={16} className="text-[#abff44]" />
                  Service Health Overview
                </h3>
                <button
                  onClick={() => runProbe()}
                  className="text-xs text-[#abff44] hover:underline flex items-center gap-1"
                >
                  <Play size={10} /> Probe All
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {services.map((service) => (
                  <div
                    key={service.id}
                    className="p-3 rounded-lg bg-[#08251a]/80 border border-[#2d6a4f]/40 flex items-center justify-between"
                  >
                    <div>
                      <div className="text-xs font-semibold text-[#fffeeb]">{service.name}</div>
                      <div className="text-[10px] text-[#fffeeb]/50 font-mono">{service.latencyMs}ms latency</div>
                    </div>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                        service.status === 'operational'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : service.status === 'degraded'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-red-500/20 text-red-400 border border-red-500/30'
                      }`}
                    >
                      {service.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Services Detail */}
        {tab === 'services' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-[#fffeeb]">Monitored Services Directory</h2>
                <p className="text-xs text-[#fffeeb]/60">Trigger manual probes and inspect health responses.</p>
              </div>
              <button
                onClick={() => runProbe()}
                className="px-3 py-1.5 rounded-lg bg-[#abff44] text-[#08251a] font-bold text-xs hover:bg-[#b8ff5e] transition-colors"
              >
                Probe All Services
              </button>
            </div>

            <div className="space-y-3">
              {services.map((s) => (
                <div
                  key={s.id}
                  className="rounded-xl border border-[#2d6a4f]/40 bg-[#0f3424]/60 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-sm text-[#fffeeb]">{s.name}</h3>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-[#133c2a] text-[#abff44] font-mono">
                        {s.id}
                      </span>
                    </div>
                    <p className="text-xs text-[#fffeeb]/70">{s.description}</p>
                    <div className="text-[11px] text-[#fffeeb]/40 font-mono">
                      Last checked {new Date(s.lastCheckedAt).toLocaleString()} &middot; Latency: {s.latencyMs}ms &middot; 30d Uptime: {s.uptime30d}%
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`text-xs px-2.5 py-1 rounded font-bold uppercase tracking-wider ${
                        s.status === 'operational'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : s.status === 'degraded'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-red-500/20 text-red-400 border border-red-500/30'
                      }`}
                    >
                      {s.status}
                    </span>

                    <button
                      onClick={() => runProbe(s.id)}
                      className="px-2.5 py-1 rounded bg-[#133c2a] hover:bg-[#1b4332] text-xs text-[#fffeeb] border border-[#2d6a4f]/50 transition-colors"
                    >
                      Test Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Incidents */}
        {tab === 'incidents' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-[#fffeeb]">Incident Management</h2>
                <p className="text-xs text-[#fffeeb]/60">Track, escalate, communicate, and resolve system incidents.</p>
              </div>

              <button
                onClick={() => setShowCreateModal(true)}
                className="px-3 py-1.5 rounded-lg bg-[#abff44] text-[#08251a] font-bold text-xs hover:bg-[#b8ff5e] transition-colors"
              >
                + New Incident
              </button>
            </div>

            {/* Active Incidents */}
            <div className="space-y-3">
              <h3 className="text-xs uppercase font-semibold text-[#fffeeb]/60">
                Active Incidents ({activeIncidents.length})
              </h3>

              {activeIncidents.length === 0 ? (
                <div className="p-6 rounded-xl border border-[#2d6a4f]/30 bg-[#0f3424]/20 text-center text-xs text-[#fffeeb]/60">
                  No active incidents. All systems operational.
                </div>
              ) : (
                activeIncidents.map((inc) => (
                  <div
                    key={inc.id}
                    className="p-5 rounded-xl border border-amber-500/40 bg-amber-500/10 space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs px-2 py-0.5 rounded font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            {inc.severity}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded bg-[#08251a] text-[#fffeeb] font-mono">
                            {inc.serviceName}
                          </span>
                          <span className="text-xs text-amber-300 font-mono font-semibold uppercase">
                            State: {inc.status}
                          </span>
                        </div>
                        <h4 className="font-bold text-base text-[#fffeeb]">{inc.title}</h4>
                        <p className="text-xs text-[#fffeeb]/80">{inc.publicMessage}</p>
                        <div className="text-[11px] text-[#fffeeb]/50 font-mono">
                          Reason: {inc.detectedReason} &middot; Detected at {new Date(inc.detectedAt).toLocaleString()}
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setSelectedIncident(inc);
                          setIncidentStatusInput(inc.status);
                          setIncidentMessageInput(inc.publicMessage);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-[#abff44] text-[#08251a] text-xs font-bold hover:bg-[#b8ff5e] transition-colors shrink-0"
                      >
                        Update Status / Timeline
                      </button>
                    </div>

                    {/* Timeline */}
                    {inc.timeline && inc.timeline.length > 0 && (
                      <div className="p-3 rounded-lg bg-[#08251a]/80 border border-amber-500/20 space-y-2">
                        <div className="text-[11px] font-semibold text-[#fffeeb]/60 uppercase">Timeline:</div>
                        <div className="space-y-1.5 text-xs">
                          {inc.timeline.map((t) => (
                            <div key={t.id} className="flex items-start gap-2">
                              <span className="font-mono text-[#fffeeb]/40 text-[10px]">
                                {new Date(t.timestamp).toLocaleTimeString()}
                              </span>
                              <span className="text-amber-300 font-semibold uppercase text-[10px]">
                                [{t.status}]
                              </span>
                              <span className="text-[#fffeeb]/80">{t.message}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Resolved Incidents */}
            <div className="space-y-3 pt-6 border-t border-[#1b4332]">
              <h3 className="text-xs uppercase font-semibold text-[#fffeeb]/60">
                Resolved Incidents ({resolvedIncidents.length})
              </h3>
              <div className="space-y-2">
                {resolvedIncidents.map((inc) => (
                  <div
                    key={inc.id}
                    className="p-4 rounded-lg border border-[#2d6a4f]/40 bg-[#0f3424]/40 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-semibold text-[10px]">
                          RESOLVED
                        </span>
                        <span className="font-semibold text-[#fffeeb]">{inc.title}</span>
                      </div>
                      <div className="text-[11px] text-[#fffeeb]/50 mt-1">
                        {new Date(inc.detectedAt).toLocaleDateString()} &middot; Duration:{' '}
                        {inc.durationSeconds ? `${Math.round(inc.durationSeconds / 60)}m` : '0m'}
                      </div>
                    </div>
                    <span className="text-[#fffeeb]/40 font-mono text-[10px]">{inc.id}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Errors & Events */}
        {tab === 'errors' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-[#fffeeb]">Live Error Records & Events</h2>
                <p className="text-xs text-[#fffeeb]/60">Normalized application events with correlation & context.</p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="text"
                  placeholder="Filter by Request ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="px-3 py-1.5 rounded-lg bg-[#0f3424] border border-[#2d6a4f]/50 text-xs text-[#fffeeb] placeholder-[#fffeeb]/40 focus:border-[#abff44] outline-none"
                />

                <select
                  value={serviceFilter}
                  onChange={(e) => setServiceFilter(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg bg-[#0f3424] border border-[#2d6a4f]/50 text-xs text-[#fffeeb] outline-none"
                >
                  <option value="">All Services</option>
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>

                <select
                  value={severityFilter}
                  onChange={(e) => setSeverityFilter(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg bg-[#0f3424] border border-[#2d6a4f]/50 text-xs text-[#fffeeb] outline-none"
                >
                  <option value="">All Severities</option>
                  <option value="critical">Critical</option>
                  <option value="error">Error</option>
                  <option value="warning">Warning</option>
                  <option value="info">Info</option>
                </select>

                <button
                  onClick={() => loadEvents()}
                  className="px-3 py-1.5 rounded-lg bg-[#133c2a] hover:bg-[#1b4332] text-xs font-semibold text-[#fffeeb] border border-[#2d6a4f]/50 transition-colors"
                >
                  Filter
                </button>
              </div>
            </div>

            {/* Events Table */}
            <div className="rounded-xl border border-[#2d6a4f]/40 bg-[#0f3424]/40 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-[#fffeeb]/80">
                  <thead className="bg-[#133c2a] text-[#fffeeb]/60 uppercase text-[10px] font-mono border-b border-[#2d6a4f]/40">
                    <tr>
                      <th className="py-2.5 px-3">Time</th>
                      <th className="py-2.5 px-3">Severity</th>
                      <th className="py-2.5 px-3">Service</th>
                      <th className="py-2.5 px-3">Endpoint / Error</th>
                      <th className="py-2.5 px-3">Request ID</th>
                      <th className="py-2.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1b4332]/50 font-mono">
                    {events.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-[#fffeeb]/40 font-sans">
                          No matching error events found.
                        </td>
                      </tr>
                    ) : (
                      events.map((evt) => (
                        <tr key={evt.id} className="hover:bg-[#133c2a]/40 transition-colors">
                          <td className="py-2 px-3 text-[11px] text-[#fffeeb]/50 whitespace-nowrap">
                            {new Date(evt.timestamp).toLocaleTimeString()}
                          </td>
                          <td className="py-2 px-3">
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                                evt.severity === 'critical'
                                  ? 'bg-red-500/20 text-red-400'
                                  : evt.severity === 'error'
                                  ? 'bg-rose-500/20 text-rose-300'
                                  : evt.severity === 'warning'
                                  ? 'bg-amber-500/20 text-amber-400'
                                  : 'bg-emerald-500/20 text-emerald-400'
                              }`}
                            >
                              {evt.severity}
                            </span>
                          </td>
                          <td className="py-2 px-3 font-semibold text-[#fffeeb]">{evt.service}</td>
                          <td className="py-2 px-3 max-w-xs truncate">
                            <div className="truncate font-semibold text-[#fffeeb]">
                              {evt.endpoint || evt.errorType || 'HTTP Request'}
                            </div>
                            <div className="truncate text-[10px] text-[#fffeeb]/50">
                              {evt.errorMessage || 'No error message'}
                            </div>
                          </td>
                          <td className="py-2 px-3 text-[10px] text-[#fffeeb]/50 truncate max-w-[120px]">
                            {evt.requestId || '-'}
                          </td>
                          <td className="py-2 px-3 text-right whitespace-nowrap">
                            <button
                              onClick={() => viewContext(evt)}
                              className="px-2 py-0.5 rounded bg-[#133c2a] hover:bg-[#abff44] hover:text-[#08251a] text-[10px] font-sans font-semibold transition-colors"
                            >
                              View Context
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: Deployments */}
        {tab === 'deployments' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-base font-bold text-[#fffeeb]">Deployment Correlation</h2>
              <p className="text-xs text-[#fffeeb]/60">Track releases to identify whether code deployments correlated with errors.</p>
            </div>

            <div className="space-y-3">
              {deployments.length === 0 ? (
                <div className="p-6 rounded-xl border border-[#2d6a4f]/30 bg-[#0f3424]/20 text-center text-xs text-[#fffeeb]/60">
                  No deployments recorded yet.
                </div>
              ) : (
                deployments.map((dep) => (
                  <div
                    key={dep.id}
                    className="p-4 rounded-xl border border-[#2d6a4f]/40 bg-[#0f3424]/60 flex items-center justify-between text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-[#fffeeb]">{dep.version}</span>
                        {dep.commitSha && (
                          <span className="px-1.5 py-0.5 rounded bg-[#133c2a] text-[#abff44] font-mono text-[10px]">
                            {dep.commitSha}
                          </span>
                        )}
                        <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-[#08251a] text-[#fffeeb]/60">
                          {dep.environment}
                        </span>
                      </div>
                      <p className="text-xs text-[#fffeeb]/70">{dep.summary}</p>
                    </div>

                    <div className="text-right text-[11px] text-[#fffeeb]/40 font-mono">
                      {new Date(dep.deployedAt).toLocaleString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Tab 6: Settings & Alerts */}
        {tab === 'settings' && config && (
          <div className="space-y-6 max-w-3xl">
            <div>
              <h2 className="text-base font-bold text-[#fffeeb]">Monitoring Thresholds & Alerting</h2>
              <p className="text-xs text-[#fffeeb]/60">Configured via environment variables.</p>
            </div>

            <div className="rounded-xl border border-[#2d6a4f]/40 bg-[#0f3424]/60 p-5 space-y-4 text-xs">
              <h3 className="font-semibold text-sm text-[#abff44]">Anomaly & Failure Thresholds</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="text-[#fffeeb]/50">Error Rate Warning</div>
                  <div className="font-mono font-bold text-[#fffeeb]">{(config.errorRateWarning * 100).toFixed(1)}%</div>
                </div>
                <div>
                  <div className="text-[#fffeeb]/50">Error Rate Critical (Outage)</div>
                  <div className="font-mono font-bold text-red-400">{(config.errorRateCritical * 100).toFixed(1)}%</div>
                </div>
                <div>
                  <div className="text-[#fffeeb]/50">Latency Warning</div>
                  <div className="font-mono font-bold text-[#fffeeb]">{config.latencyWarningMs}ms</div>
                </div>
                <div>
                  <div className="text-[#fffeeb]/50">Latency Critical</div>
                  <div className="font-mono font-bold text-red-400">{config.latencyCriticalMs}ms</div>
                </div>
                <div>
                  <div className="text-[#fffeeb]/50">Consecutive Failures Warning</div>
                  <div className="font-mono font-bold text-[#fffeeb]">{config.consecutiveFailuresWarning}</div>
                </div>
                <div>
                  <div className="text-[#fffeeb]/50">Consecutive Failures Critical</div>
                  <div className="font-mono font-bold text-red-400">{config.consecutiveFailuresCritical}</div>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-[#2d6a4f]/40 bg-[#0f3424]/60 p-5 space-y-4 text-xs">
              <h3 className="font-semibold text-sm text-[#abff44]">Alert Cooldown & Retention</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="text-[#fffeeb]/50">Alert Cooldown Window</div>
                  <div className="font-mono font-bold text-[#fffeeb]">{config.alertCooldownMinutes} minutes</div>
                </div>
                <div>
                  <div className="text-[#fffeeb]/50">Raw Events Retention</div>
                  <div className="font-mono font-bold text-[#fffeeb]">{config.rawEventsRetentionDays} days</div>
                </div>
                <div>
                  <div className="text-[#fffeeb]/50">Errors Retention</div>
                  <div className="font-mono font-bold text-[#fffeeb]">{config.errorsRetentionDays} days</div>
                </div>
                <div>
                  <div className="text-[#fffeeb]/50">Incidents Retention</div>
                  <div className="font-mono font-bold text-[#fffeeb]">{config.incidentsRetentionDays} days</div>
                </div>
                <div className="col-span-2">
                  <div className="text-[#fffeeb]/50">Webhook Alert URL</div>
                  <div className="font-mono text-[#fffeeb] truncate">
                    {config.webhookUrl || 'Not configured (set MONITOR_WEBHOOK_URL)'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* View Context Modal */}
      {contextModalEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#0f3424] border border-[#2d6a4f] rounded-2xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-[#1b4332] flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-[#fffeeb]">Failure Context & Correlation</h3>
                <p className="text-[11px] text-[#fffeeb]/60">
                  Showing events around {new Date(contextModalEvent.timestamp).toLocaleTimeString()} (&plusmn;5 mins)
                </p>
              </div>
              <button
                onClick={() => setContextModalEvent(null)}
                className="text-[#fffeeb]/60 hover:text-[#fffeeb] text-sm"
              >
                &times;
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-4 text-xs font-mono">
              <div className="p-3 rounded-lg bg-[#08251a] border border-red-500/30 text-red-300 space-y-1">
                <div className="font-bold">Target Error Event:</div>
                <div>Message: {contextModalEvent.errorMessage || contextModalEvent.endpoint}</div>
                <div>Request ID: {contextModalEvent.requestId || 'N/A'}</div>
                {contextModalEvent.stackTrace && (
                  <pre className="text-[10px] text-[#fffeeb]/60 whitespace-pre-wrap mt-2 max-h-40 overflow-y-auto">
                    {contextModalEvent.stackTrace}
                  </pre>
                )}
              </div>

              <div className="space-y-2">
                <div className="font-bold text-[#fffeeb]">Correlated Events in Window ({contextEvents.length}):</div>
                {contextLoading ? (
                  <div className="text-center py-4 text-[#fffeeb]/50">Loading correlated events...</div>
                ) : contextEvents.length === 0 ? (
                  <div className="text-[#fffeeb]/50">No adjacent events found in window.</div>
                ) : (
                  contextEvents.map((evt) => (
                    <div
                      key={evt.id}
                      className="p-2.5 rounded bg-[#08251a]/60 border border-[#1b4332] flex items-start justify-between gap-2"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[#fffeeb]/40 text-[10px]">
                            {new Date(evt.timestamp).toLocaleTimeString()}
                          </span>
                          <span className="font-semibold text-[#fffeeb]">{evt.service}</span>
                          <span className="text-[10px] text-amber-300 uppercase">{evt.severity}</span>
                        </div>
                        <div className="text-[11px] text-[#fffeeb]/70 mt-0.5">
                          {evt.endpoint || evt.errorMessage || 'System event'}
                        </div>
                      </div>
                      <span className="text-[9px] text-[#fffeeb]/40 truncate max-w-[100px]">
                        {evt.requestId || '-'}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="p-3 border-t border-[#1b4332] text-right">
              <button
                onClick={() => setContextModalEvent(null)}
                className="px-3 py-1.5 rounded-lg bg-[#133c2a] text-[#fffeeb] text-xs font-semibold hover:bg-[#1b4332]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Update Incident Modal */}
      {selectedIncident && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#0f3424] border border-[#2d6a4f] rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <h3 className="font-bold text-sm text-[#fffeeb]">Update Incident: {selectedIncident.title}</h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[#fffeeb]/70 block mb-1">Status State</label>
                <select
                  value={incidentStatusInput}
                  onChange={(e) => setIncidentStatusInput(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg bg-[#08251a] border border-[#2d6a4f] text-[#fffeeb] outline-none"
                >
                  <option value="investigating">INVESTIGATING</option>
                  <option value="identified">IDENTIFIED</option>
                  <option value="monitoring">MONITORING</option>
                  <option value="resolved">RESOLVED</option>
                </select>
              </div>

              <div>
                <label className="text-[#fffeeb]/70 block mb-1">Public Update Message</label>
                <textarea
                  rows={3}
                  value={incidentMessageInput}
                  onChange={(e) => setIncidentMessageInput(e.target.value)}
                  placeholder="e.g. Fix deployed, monitoring recovery."
                  className="w-full px-3 py-2 rounded-lg bg-[#08251a] border border-[#2d6a4f] text-[#fffeeb] outline-none placeholder-[#fffeeb]/30"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedIncident(null)}
                className="px-3 py-1.5 rounded-lg bg-[#133c2a] text-xs font-semibold text-[#fffeeb] hover:bg-[#1b4332]"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateIncident}
                className="px-4 py-1.5 rounded-lg bg-[#abff44] text-xs font-bold text-[#08251a] hover:bg-[#b8ff5e]"
              >
                Publish Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Incident Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <form
            onSubmit={handleCreateIncident}
            className="bg-[#0f3424] border border-[#2d6a4f] rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl"
          >
            <h3 className="font-bold text-sm text-[#fffeeb]">Create New Incident</h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[#fffeeb]/70 block mb-1">Affected Service</label>
                <select
                  value={newIncidentService}
                  onChange={(e) => setNewIncidentService(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#08251a] border border-[#2d6a4f] text-[#fffeeb] outline-none"
                >
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[#fffeeb]/70 block mb-1">Severity</label>
                <select
                  value={newIncidentSeverity}
                  onChange={(e) => setNewIncidentSeverity(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg bg-[#08251a] border border-[#2d6a4f] text-[#fffeeb] outline-none"
                >
                  <option value="warning">Warning (Degraded Performance)</option>
                  <option value="critical">Critical (Service Outage)</option>
                </select>
              </div>

              <div>
                <label className="text-[#fffeeb]/70 block mb-1">Incident Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Chatbot Streaming Disruption"
                  value={newIncidentTitle}
                  onChange={(e) => setNewIncidentTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#08251a] border border-[#2d6a4f] text-[#fffeeb] outline-none"
                />
              </div>

              <div>
                <label className="text-[#fffeeb]/70 block mb-1">Detected Reason</label>
                <input
                  type="text"
                  placeholder="e.g. Upstream API gateway timeout"
                  value={newIncidentReason}
                  onChange={(e) => setNewIncidentReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#08251a] border border-[#2d6a4f] text-[#fffeeb] outline-none"
                />
              </div>

              <div>
                <label className="text-[#fffeeb]/70 block mb-1">Public Announcement Message</label>
                <textarea
                  rows={3}
                  value={newIncidentPublicMsg}
                  onChange={(e) => setNewIncidentPublicMsg(e.target.value)}
                  placeholder="e.g. We are investigating elevated errors with chatbot streaming."
                  className="w-full px-3 py-2 rounded-lg bg-[#08251a] border border-[#2d6a4f] text-[#fffeeb] outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-3 py-1.5 rounded-lg bg-[#133c2a] text-xs font-semibold text-[#fffeeb] hover:bg-[#1b4332]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-[#abff44] text-xs font-bold text-[#08251a] hover:bg-[#b8ff5e]"
              >
                Create Incident
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
