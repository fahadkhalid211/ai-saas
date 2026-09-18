import React, { useState } from 'react';
import {
  BarChart3,
  Download,
  RefreshCw,
  Eye,
  TrendingUp,
  Users,
  Target,
  Activity,
  DollarSign,
  Award,
  Globe,
  Smartphone,
  Monitor,
  Search,
  Filter,
  LayoutTemplate,
  ExternalLink,
  PieChart,
  ThumbsUp,
  MessageSquare,
  AlertCircle,
  Bot,
} from 'lucide-react';

export interface AnalyticsTabProps {
  analyticsData: any;
  isLoadingAnalytics: boolean;
  analyticsRange: number;
  setAnalyticsRange: (range: number) => void;
  analyticsSlugFilter: string;
  setAnalyticsSlugFilter: (slug: string) => void;
  fetchAnalytics: (assistantId?: string, slug?: string, days?: number) => Promise<void>;
  activeAssistant: any;
  allLandingPages: any[];
  setActiveTab: (tab: any) => void;
  appointments: any[];
}

export const AnalyticsTab: React.FC<AnalyticsTabProps> = ({
  analyticsData,
  isLoadingAnalytics,
  analyticsRange,
  setAnalyticsRange,
  analyticsSlugFilter,
  setAnalyticsSlugFilter,
  fetchAnalytics,
  activeAssistant,
  allLandingPages,
  setActiveTab,
  appointments,
}) => {
  const [analyticsViewTab, setAnalyticsViewTab] = useState<'traffic' | 'customers' | 'funnel' | 'conversations'>('traffic');
  const [customerSearchQuery, setCustomerSearchQuery] = useState<string>('');
  const [customerStatusFilter, setCustomerStatusFilter] = useState<'all' | 'VIP' | 'Regular' | 'New'>('all');
  const [chartMetric, setChartMetric] = useState<'traffic' | 'revenue'>('traffic');

  const handleExportAnalyticsCsv = () => {
    if (!analyticsData?.webAnalytics) return;
    const wa = analyticsData.webAnalytics;
    let csv = 'Category,Metric,Value\n';
    csv += `Overview,Total Page Views,${wa.overview?.totalPageViews || 0}\n`;
    csv += `Overview,Unique Visitors,${wa.overview?.uniqueVisitors || 0}\n`;
    csv += `Overview,Active Realtime Visitors,${wa.overview?.realtimeActive || 1}\n`;
    csv += `Overview,Conversion Rate,${wa.overview?.conversionRate || 0}%\n`;
    csv += `Overview,Bounce Rate,${wa.overview?.bounceRate || 0}%\n`;
    csv += `Overview,Pipeline Revenue,${wa.overview?.totalPipelineRevenue || 0}\n`;
    csv += `Overview,Repeat Customer Rate,${wa.overview?.repeatRate || 0}%\n\n`;

    csv += 'Daily Time Series Trends\nDate,Views,Unique Visitors,Bookings,Revenue\n';
    (wa.timeSeries || []).forEach((t: any) => {
      csv += `${t.date},${t.views},${t.visitors},${t.bookings},${t.revenue}\n`;
    });
    csv += '\n';

    csv += 'Traffic Acquisition Sources\nChannel,Visitors,Percentage\n';
    (wa.trafficSources || []).forEach((s: any) => {
      csv += `"${s.channel}",${s.count},${s.percent}%\n`;
    });
    csv += '\n';

    csv += 'Customer Intelligence Directory\nName,Email,Phone,Status,Bookings,Total Spend,Preferred Services,Source Landing Page\n';
    (wa.customerDirectory || []).forEach((c: any) => {
      csv += `"${c.name}","${c.email}","${c.phone}","${c.status}",${c.totalBookings},${c.totalSpend},"${(c.preferredServices || []).join(';') || 'General'}","${c.sourceLandingPage}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kortex_analytics_report_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
              <div className="max-w-6xl space-y-6 mx-auto">
                {/* Header & Controls Toolbar */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <BarChart3 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                      <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                        Analytics
                      </h1>
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        <span>{analyticsData?.webAnalytics?.overview?.realtimeActive || 1} Active Now</span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      See how many visitors your assistant is engaging, where they come from, and how many become leads or bookings.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* Landing Page Filter Dropdown */}
                    <div className="relative">
                      <select
                        value={analyticsSlugFilter}
                        onChange={(e) => {
                          const newSlug = e.target.value;
                          setAnalyticsSlugFilter(newSlug);
                          fetchAnalytics(activeAssistant?.id, newSlug, analyticsRange);
                        }}
                        className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs rounded-xl px-3 py-1.5 font-medium focus:outline-none focus:border-blue-500 cursor-pointer"
                      >
                        <option value="all">All Landing Pages</option>
                        <option value="classic-barbershop">Crown &amp; Blade Barbershop</option>
                        <option value="fitzone-gym">FitZone Performance Gym</option>
                        <option value="prime-properties">Prime Luxury Properties</option>
                        <option value="glow-cosmetics">Glow Cosmetics</option>
                        <option value="techflow-saas">TechFlow Cloud Solutions</option>
                        <option value="apex-legal">Apex Legal Partners</option>
                        {(allLandingPages || [])
                          .filter((p) => !['classic-barbershop', 'fitzone-gym', 'prime-properties', 'glow-cosmetics', 'techflow-saas', 'apex-legal'].includes(p.slug))
                          .map((p) => (
                            <option key={p.slug} value={p.slug}>
                              {p.businessName} ({p.slug})
                            </option>
                          ))}
                      </select>
                    </div>

                    {/* Date Range Selector Pills */}
                    <div className="flex items-center p-0.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
                      {[
                        { label: '7D', days: 7 },
                        { label: '14D', days: 14 },
                        { label: '30D', days: 30 },
                        { label: '90D', days: 90 },
                      ].map((rng) => (
                        <button
                          key={rng.days}
                          type="button"
                          onClick={() => {
                            setAnalyticsRange(rng.days);
                            fetchAnalytics(activeAssistant?.id, analyticsSlugFilter, rng.days);
                          }}
                          className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition cursor-pointer ${
                            analyticsRange === rng.days
                              ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                          }`}
                        >
                          {rng.label}
                        </button>
                      ))}
                    </div>

                    {/* Export CSV Report Button */}
                    <button
                      type="button"
                      onClick={handleExportAnalyticsCsv}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition shadow-xs cursor-pointer"
                      title="Export Analytics Data as CSV"
                    >
                      <Download className="h-3.5 w-3.5 text-slate-500" />
                      <span className="hidden sm:inline">Export CSV</span>
                    </button>

                    {/* Refresh Button */}
                    <button
                      type="button"
                      onClick={() => fetchAnalytics(activeAssistant?.id, analyticsSlugFilter, analyticsRange)}
                      disabled={isLoadingAnalytics}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition shadow-xs cursor-pointer"
                    >
                      <RefreshCw className={`h-3.5 w-3.5 ${isLoadingAnalytics ? 'animate-spin' : ''}`} />
                      <span>Refresh</span>
                    </button>
                  </div>
                </div>

                {/* Primary Google Analytics KPI Metric Row */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
                  <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-1">
                    <div className="flex items-center justify-between text-slate-500 text-xs">
                      <span>Page Views</span>
                      <Eye className="h-4 w-4 text-blue-500" />
                    </div>
                    <div className="text-xl font-bold text-slate-900 dark:text-white font-mono">
                      {(analyticsData?.webAnalytics?.overview?.totalPageViews ?? 0).toLocaleString()}
                    </div>
                    <div className="text-[10.5px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      <span>+18.4% traffic</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-1">
                    <div className="flex items-center justify-between text-slate-500 text-xs">
                      <span>Unique Visitors</span>
                      <Users className="h-4 w-4 text-indigo-500" />
                    </div>
                    <div className="text-xl font-bold text-slate-900 dark:text-white font-mono">
                      {(analyticsData?.webAnalytics?.overview?.uniqueVisitors ?? 0).toLocaleString()}
                    </div>
                    <div className="text-[10.5px] text-slate-400">Tracked sessions</div>
                  </div>

                  <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-1">
                    <div className="flex items-center justify-between text-slate-500 text-xs">
                      <span>Conversion Rate</span>
                      <Target className="h-4 w-4 text-emerald-500" />
                    </div>
                    <div className="text-xl font-bold text-slate-900 dark:text-white font-mono">
                      {analyticsData?.webAnalytics?.overview?.conversionRate ?? '0.0'}%
                    </div>
                    <div className="text-[10.5px] text-emerald-600 dark:text-emerald-400 font-semibold">
                      Visitor to customer
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-1">
                    <div className="flex items-center justify-between text-slate-500 text-xs">
                      <span>Bounce Rate</span>
                      <Activity className="h-4 w-4 text-purple-500" />
                    </div>
                    <div className="text-xl font-bold text-slate-900 dark:text-white font-mono">
                      {analyticsData?.webAnalytics?.overview?.bounceRate ?? '24.6'}%
                    </div>
                    <div className="text-[10.5px] text-slate-400">
                      Avg {Math.floor((analyticsData?.webAnalytics?.overview?.avgDurationSeconds || 165) / 60)}m {(analyticsData?.webAnalytics?.overview?.avgDurationSeconds || 165) % 60}s
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-1">
                    <div className="flex items-center justify-between text-slate-500 text-xs">
                      <span>Pipeline Revenue</span>
                      <DollarSign className="h-4 w-4 text-amber-500" />
                    </div>
                    <div className="text-xl font-bold text-slate-900 dark:text-white font-mono">
                      ${(analyticsData?.webAnalytics?.overview?.totalPipelineRevenue ?? 0).toLocaleString()}
                    </div>
                    <div className="text-[10.5px] text-slate-400">
                      Avg ${analyticsData?.webAnalytics?.overview?.avgBookingValue ?? 45}/order
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-1">
                    <div className="flex items-center justify-between text-slate-500 text-xs">
                      <span>Repeat Rate</span>
                      <Award className="h-4 w-4 text-rose-500" />
                    </div>
                    <div className="text-xl font-bold text-slate-900 dark:text-white font-mono">
                      {analyticsData?.webAnalytics?.overview?.repeatRate ?? 0}%
                    </div>
                    <div className="text-[10.5px] text-slate-400">
                      {analyticsData?.webAnalytics?.overview?.totalCustomers ?? 0} total clients
                    </div>
                  </div>
                </div>

                {/* Sub-Tabs Switcher */}
                <div className="flex items-center gap-1.5 border-b border-slate-200 dark:border-slate-800 pb-1">
                  {[
                    { id: 'traffic', label: 'Web Traffic & Acquisition', icon: Globe },
                    { id: 'customers', label: 'Customer Intelligence & CRM', icon: Users },
                    { id: 'funnel', label: 'Conversion Funnel & Pages', icon: LayoutTemplate },
                    { id: 'conversations', label: 'AI Conversations & Tone', icon: Bot },
                  ].map((tb) => {
                    const Icon = tb.icon;
                    const isActive = analyticsViewTab === tb.id;
                    return (
                      <button
                        key={tb.id}
                        type="button"
                        onClick={() => setAnalyticsViewTab(tb.id as any)}
                        className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl transition cursor-pointer ${
                          isActive
                            ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        <span>{tb.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* SUBTAB 1: WEB TRAFFIC & ACQUISITION */}
                {analyticsViewTab === 'traffic' && (
                  <div className="space-y-6">
                    {/* Time-Series Daily Trend Chart */}
                    <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-blue-500" />
                            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                              Daily Audience &amp; Engagement Activity
                            </h2>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            Daily trajectory of page views, unique visitors, and completed booking conversions.
                          </p>
                        </div>

                        {/* Chart Metric Toggle */}
                        <div className="flex items-center p-0.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 self-start sm:self-auto">
                          <button
                            type="button"
                            onClick={() => setChartMetric('traffic')}
                            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition cursor-pointer ${
                              chartMetric === 'traffic'
                                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                                : 'text-slate-500 dark:text-slate-400'
                            }`}
                          >
                            Views &amp; Visitors
                          </button>
                          <button
                            type="button"
                            onClick={() => setChartMetric('revenue')}
                            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition cursor-pointer ${
                              chartMetric === 'revenue'
                                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                                : 'text-slate-500 dark:text-slate-400'
                            }`}
                          >
                            Bookings &amp; Revenue
                          </button>
                        </div>
                      </div>

                      {/* Visual Bar Columns Chart */}
                      {(() => {
                        const series = analyticsData?.webAnalytics?.timeSeries || [];
                        if (series.length === 0) {
                          return (
                            <div className="py-12 text-center text-xs text-slate-400">
                              No analytics events recorded for this selected time range yet.
                            </div>
                          );
                        }

                        const maxMetric = Math.max(
                          1,
                          ...series.map((s: any) => (chartMetric === 'traffic' ? s.views : s.revenue || s.bookings * 45))
                        );

                        return (
                          <div className="space-y-2">
                            <div className="flex items-end gap-1 sm:gap-2 h-48 pt-6 pb-2 px-1 overflow-x-auto">
                              {series.map((item: any, idx: number) => {
                                const val = chartMetric === 'traffic' ? item.views : (item.revenue || item.bookings * 45);
                                const secondaryVal = chartMetric === 'traffic' ? item.visitors : item.bookings;
                                const heightPct = Math.max(8, Math.round((val / maxMetric) * 100));

                                return (
                                  <div
                                    key={idx}
                                    className="flex-1 min-w-[20px] max-w-[48px] h-full flex flex-col items-center justify-end group relative"
                                  >
                                    {/* Tooltip on hover */}
                                    <div className="absolute bottom-full mb-2 hidden group-hover:flex flex-col items-center z-20 pointer-events-none">
                                      <div className="p-2 rounded-lg bg-slate-900 text-white text-[10px] whitespace-nowrap shadow-lg border border-slate-700">
                                        <div className="font-bold text-slate-200">{item.date}</div>
                                        {chartMetric === 'traffic' ? (
                                          <>
                                            <div>Views: <span className="text-blue-400 font-mono font-bold">{item.views}</span></div>
                                            <div>Visitors: <span className="text-indigo-300 font-mono font-bold">{item.visitors}</span></div>
                                            <div>Bookings: <span className="text-emerald-400 font-mono font-bold">{item.bookings}</span></div>
                                          </>
                                        ) : (
                                          <>
                                            <div>Revenue: <span className="text-emerald-400 font-mono font-bold">${item.revenue || item.bookings * 45}</span></div>
                                            <div>Bookings: <span className="text-blue-400 font-mono font-bold">{item.bookings}</span></div>
                                          </>
                                        )}
                                      </div>
                                    </div>

                                    {/* Bar visual */}
                                    <div className="w-full flex items-end justify-center h-full">
                                      <div
                                        style={{ height: `${heightPct}%` }}
                                        className={`w-full rounded-t-md transition-all cursor-pointer ${
                                          chartMetric === 'traffic'
                                            ? 'bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-500'
                                            : 'bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-500'
                                        }`}
                                      />
                                    </div>

                                    {/* X-axis date label */}
                                    <div className="text-[9px] text-slate-400 font-mono mt-1.5 truncate text-center w-full">
                                      {item.label || item.date.slice(5)}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>

                            {/* Chart Legend */}
                            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                              <div className="flex items-center gap-4">
                                <div className="flex items-center gap-1.5">
                                  <span className={`h-2.5 w-2.5 rounded-sm ${chartMetric === 'traffic' ? 'bg-blue-500' : 'bg-emerald-500'}`} />
                                  <span>{chartMetric === 'traffic' ? 'Total Page Views' : 'Pipeline Revenue ($)'}</span>
                                </div>
                                <span className="text-slate-300 dark:text-slate-700">|</span>
                                <span>Hover over any day bar for granular breakdown</span>
                              </div>
                              <span className="font-mono">Range: Last {analyticsRange} Days</span>
                            </div>
                          </div>
                        );
                      })()}
                    </div>

                    {/* Traffic Channels & Device / Browser Breakdown */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Acquisition Channels Card */}
                      <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Globe className="h-4 w-4 text-emerald-500" />
                            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                              Traffic Acquisition Channels
                            </h2>
                          </div>
                          <span className="text-[11px] text-slate-400">Audience Sources</span>
                        </div>

                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Where your prospective clients and visitors are originating before landing on your page.
                        </p>

                        <div className="space-y-3">
                          {(analyticsData?.webAnalytics?.trafficSources || []).length === 0 ? (
                            <div className="py-8 text-center text-xs text-slate-400">
                              No traffic acquisition data recorded yet for this period. Share your landing page link to begin tracking real visitors.
                            </div>
                          ) : (
                            (analyticsData?.webAnalytics?.trafficSources || []).map((src: any, idx: number) => (
                              <div key={idx} className="space-y-1">
                                <div className="flex items-center justify-between text-xs">
                                  <span className="font-medium text-slate-800 dark:text-slate-200">
                                    {src.channel}
                                  </span>
                                  <div className="flex items-center gap-2 text-[11px]">
                                    <span className="font-mono font-bold text-slate-900 dark:text-white">
                                      {src.count} views
                                    </span>
                                    <span className="text-slate-400 font-mono">({src.percent}%)</span>
                                  </div>
                                </div>
                                <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                                  <div
                                    style={{ width: `${src.percent}%` }}
                                    className="h-full rounded-full bg-blue-500 transition-all duration-500"
                                  />
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>

                      {/* Device & Browser Distribution Card */}
                      <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Smartphone className="h-4 w-4 text-purple-500" />
                            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                              Devices &amp; Browser Demographics
                            </h2>
                          </div>
                          <span className="text-[11px] text-slate-400">User Hardware</span>
                        </div>

                        {/* Device Types */}
                        <div className="space-y-2">
                          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Device Split</span>
                          <div className="grid grid-cols-3 gap-2 text-center">
                            {(analyticsData?.webAnalytics?.devices || []).length === 0 ? (
                              <div className="col-span-3 py-4 text-center text-xs text-slate-400">No device data recorded yet.</div>
                            ) : (
                              (analyticsData?.webAnalytics?.devices || []).map((dev: any, idx: number) => (
                                <div key={idx} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                                  <div className="flex items-center justify-center gap-1 text-[11px] font-semibold text-slate-700 dark:text-slate-300 capitalize">
                                    {dev.device === 'mobile' ? <Smartphone className="h-3 w-3 text-blue-500" /> : <Monitor className="h-3 w-3 text-indigo-500" />}
                                    <span>{dev.device}</span>
                                  </div>
                                  <div className="text-base font-bold font-mono text-slate-900 dark:text-white mt-1">
                                    {dev.percent}%
                                  </div>
                                  <div className="text-[10px] text-slate-400 font-mono">{dev.count} visits</div>
                                </div>
                              ))
                            )}
                          </div>
                        </div>

                        {/* Top Browsers */}
                        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Web Browsers</span>
                          <div className="space-y-1.5">
                            {(analyticsData?.webAnalytics?.browsers || []).length === 0 ? (
                              <div className="py-2 text-center text-xs text-slate-400">No browser data recorded yet.</div>
                            ) : (
                              (analyticsData?.webAnalytics?.browsers || []).map((br: any, idx: number) => (
                                <div key={idx} className="flex items-center justify-between text-xs">
                                  <span className="text-slate-700 dark:text-slate-300">{br.browser}</span>
                                  <div className="flex items-center gap-2 text-[11px]">
                                    <span className="font-mono font-bold text-slate-900 dark:text-white">{br.percent}%</span>
                                    <span className="text-slate-400 font-mono">({br.count})</span>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </div>

                        {/* Top Cities */}
                        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Top Geographies</span>
                          <div className="flex flex-wrap gap-1.5">
                            {(analyticsData?.webAnalytics?.topCities || []).length === 0 ? (
                              <div className="py-2 text-center text-xs text-slate-400">No geographic data recorded yet.</div>
                            ) : (
                              (analyticsData?.webAnalytics?.topCities || []).map((c: any, idx: number) => (
                                <span
                                  key={idx}
                                  className="px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] text-slate-700 dark:text-slate-300 font-medium"
                                >
                                  {c.city}, {c.country} ({c.count})
                                </span>
                              ))
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* SUBTAB 2: CUSTOMER INTELLIGENCE & CRM */}
                {analyticsViewTab === 'customers' && (
                  <div className="space-y-6">
                    {/* Customer CRM Search & Filter Toolbar */}
                    <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
                      <div className="relative flex-1 w-full">
                        <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          placeholder="Search clients by name, email, phone, or landing page..."
                          value={customerSearchQuery}
                          onChange={(e) => setCustomerSearchQuery(e.target.value)}
                          className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0 self-start sm:self-auto">
                        <Filter className="h-3.5 w-3.5 text-slate-400 mr-1" />
                        {(['all', 'VIP', 'Regular', 'New'] as const).map((st) => (
                          <button
                            key={st}
                            type="button"
                            onClick={() => setCustomerStatusFilter(st)}
                            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition cursor-pointer ${
                              customerStatusFilter === st
                                ? 'bg-blue-600 text-white shadow-xs'
                                : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                            }`}
                          >
                            {st === 'all' ? 'All' : st}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Customer Intelligence Directory Table */}
                    {(() => {
                      const allCusts = analyticsData?.webAnalytics?.customerDirectory || [];
                      const filtered = allCusts.filter((c: any) => {
                        if (customerStatusFilter !== 'all' && c.status !== customerStatusFilter) return false;
                        if (customerSearchQuery.trim()) {
                          const q = customerSearchQuery.toLowerCase();
                          return (
                            c.name.toLowerCase().includes(q) ||
                            c.email.toLowerCase().includes(q) ||
                            (c.phone && c.phone.toLowerCase().includes(q)) ||
                            (c.sourceLandingPage && c.sourceLandingPage.toLowerCase().includes(q))
                          );
                        }
                        return true;
                      });

                      return (
                        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
                          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                            <div>
                              <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <Users className="h-4 w-4 text-blue-500" />
                                <span>Customer Intelligence &amp; LTV Directory</span>
                              </h2>
                              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                Showing {filtered.length} client profile(s) with booking frequency and spend tracking.
                              </p>
                            </div>
                            <span className="text-xs font-mono text-slate-400">
                              {analyticsData?.webAnalytics?.overview?.repeatRate ?? 0}% Repeat Client Rate
                            </span>
                          </div>

                          {filtered.length === 0 ? (
                            <div className="py-12 text-center text-xs text-slate-400">
                              No customer profiles match your search criteria.
                            </div>
                          ) : (
                            <div className="overflow-x-auto">
                              <table className="w-full text-left text-xs">
                                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-800">
                                  <tr>
                                    <th className="px-4 py-3">Client</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3">Bookings</th>
                                    <th className="px-4 py-3">Total Spend</th>
                                    <th className="px-4 py-3">Preferred Services</th>
                                    <th className="px-4 py-3">Acquisition Source</th>
                                    <th className="px-4 py-3">Last Visit</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                  {filtered.map((client: any, idx: number) => (
                                    <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                                      <td className="px-4 py-3 font-medium">
                                        <div className="text-slate-900 dark:text-white font-bold">{client.name}</div>
                                        <div className="text-[11px] text-slate-400 font-mono">{client.email}</div>
                                        {client.phone && (
                                          <div className="text-[10px] text-slate-500 font-mono">{client.phone}</div>
                                        )}
                                      </td>
                                      <td className="px-4 py-3">
                                        <span
                                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${
                                            client.status === 'VIP'
                                              ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                                              : client.status === 'Regular'
                                              ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                                              : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                                          }`}
                                        >
                                          {client.status === 'VIP' && <Award className="h-3 w-3" />}
                                          <span>{client.status}</span>
                                        </span>
                                      </td>
                                      <td className="px-4 py-3 font-mono font-bold text-slate-900 dark:text-white">
                                        {client.totalBookings}
                                      </td>
                                      <td className="px-4 py-3 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                                        ${client.totalSpend}
                                      </td>
                                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300 max-w-[200px] truncate">
                                        {(client.preferredServices || []).join(', ') || 'General Consultation'}
                                      </td>
                                      <td className="px-4 py-3 text-slate-500 max-w-[180px] truncate">
                                        {client.sourceLandingPage || 'Default Site'}
                                      </td>
                                      <td className="px-4 py-3 font-mono text-[11px] text-slate-400">
                                        {client.lastBooking ? new Date(client.lastBooking).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                )}

                {/* SUBTAB 3: CONVERSION FUNNEL & LANDING PAGES */}
                {analyticsViewTab === 'funnel' && (
                  <div className="space-y-6">
                    {/* 4-Stage Conversion Funnel */}
                    <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Target className="h-4 w-4 text-purple-500" />
                          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                            Google-Grade Customer Conversion Funnel
                          </h2>
                        </div>
                        <span className="text-[11px] text-slate-400">Visitor Drop-off Analysis</span>
                      </div>

                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Tracks visitor progression from their first page view down to appointment confirmation.
                      </p>

                      <div className="space-y-3 pt-2">
                        {(analyticsData?.webAnalytics?.funnelSteps || [
                          { step: 'Page Views', count: analyticsData?.webAnalytics?.overview?.totalPageViews || 140, dropOffPercent: 0 },
                          { step: 'Services Menu Viewed', count: Math.round((analyticsData?.webAnalytics?.overview?.totalPageViews || 140) * 0.44), dropOffPercent: 56 },
                          { step: 'Booking Slot Selected', count: Math.round((analyticsData?.webAnalytics?.overview?.totalPageViews || 140) * 0.22), dropOffPercent: 50 },
                          { step: 'Confirmed Bookings', count: appointments.length || 12, dropOffPercent: 45 },
                        ]).map((st: any, idx: number, arr: any[]) => {
                          const baseCount = Math.max(1, arr[0].count);
                          const widthPct = Math.max(12, Math.round((st.count / baseCount) * 100));

                          return (
                            <div key={idx} className="space-y-1">
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-semibold text-slate-800 dark:text-slate-200">
                                  Stage {idx + 1}: {st.step}
                                </span>
                                <div className="flex items-center gap-2">
                                  <span className="font-mono font-bold text-slate-900 dark:text-white">
                                    {st.count} visitors
                                  </span>
                                  {idx > 0 && (
                                    <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
                                      {st.dropOffPercent}% drop-off
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="h-3 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex">
                                <div
                                  style={{ width: `${widthPct}%` }}
                                  className={`h-full rounded-full transition-all duration-500 ${
                                    idx === 0
                                      ? 'bg-blue-500'
                                      : idx === 1
                                      ? 'bg-indigo-500'
                                      : idx === 2
                                      ? 'bg-purple-500'
                                      : 'bg-emerald-500'
                                  }`}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Page-by-Page Performance Comparison Table */}
                    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
                      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                        <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          <LayoutTemplate className="h-4 w-4 text-emerald-500" />
                          <span>Performance by Landing Page</span>
                        </h2>
                        <span className="text-xs text-slate-400">
                          {analyticsData?.webAnalytics?.pagePerformance?.length || 0} active landing pages
                        </span>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-800">
                            <tr>
                              <th className="px-4 py-3">Landing Page</th>
                              <th className="px-4 py-3">Slug / Path</th>
                              <th className="px-4 py-3">Views</th>
                              <th className="px-4 py-3">Visitors</th>
                              <th className="px-4 py-3">Bookings</th>
                              <th className="px-4 py-3">Conversion Rate</th>
                              <th className="px-4 py-3">Revenue</th>
                              <th className="px-4 py-3 text-right">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {(analyticsData?.webAnalytics?.pagePerformance || []).map((page: any, idx: number) => (
                              <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                                <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">
                                  {page.name}
                                </td>
                                <td className="px-4 py-3 font-mono text-[11px] text-blue-600 dark:text-blue-400">
                                  /site/{page.slug}
                                </td>
                                <td className="px-4 py-3 font-mono font-bold text-slate-900 dark:text-white">
                                  {page.views}
                                </td>
                                <td className="px-4 py-3 font-mono text-slate-600 dark:text-slate-400">
                                  {page.uniqueVisitors}
                                </td>
                                <td className="px-4 py-3 font-mono font-bold text-purple-600 dark:text-purple-400">
                                  {page.bookings}
                                </td>
                                <td className="px-4 py-3">
                                  <span className="px-2 py-0.5 rounded-md text-[10.5px] font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                                    {page.conversionRate}%
                                  </span>
                                </td>
                                <td className="px-4 py-3 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                                  ${page.revenue}
                                </td>
                                <td className="px-4 py-3 text-right">
                                  <a
                                    href={`/site/${page.slug}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-700 hover:underline"
                                  >
                                    <span>View</span>
                                    <ExternalLink className="h-3 w-3" />
                                  </a>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* SUBTAB 4: AI CONVERSATIONS & TONE */}
                {analyticsViewTab === 'conversations' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Visitor Sentiment Breakdown Card */}
                      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <PieChart className="h-4 w-4 text-blue-500" />
                            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Visitor Sentiment Analysis</h2>
                          </div>
                          <span className="text-[11px] text-slate-400">Real-time Tone AI</span>
                        </div>

                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                          AI continuously scans visitor conversations for frustration, urgent escalations, or positive satisfaction.
                        </p>

                        {/* Progress Bar Distribution */}
                        {(() => {
                          const pos = analyticsData?.sentiment?.positive ?? 0;
                          const neu = analyticsData?.sentiment?.neutral ?? (analyticsData?.totalConversations || 1);
                          const urg = analyticsData?.sentiment?.urgent ?? 0;
                          const total = Math.max(1, pos + neu + urg);
                          const posPct = Math.round((pos / total) * 100);
                          const urgPct = Math.round((urg / total) * 100);
                          const neuPct = 100 - posPct - urgPct;

                          return (
                            <div className="space-y-3">
                              <div className="h-3 w-full rounded-full bg-slate-100 dark:bg-slate-800 flex overflow-hidden">
                                <div style={{ width: `${posPct}%` }} className="bg-emerald-500 transition-all duration-500" title="Positive" />
                                <div style={{ width: `${neuPct}%` }} className="bg-slate-400 dark:bg-slate-600 transition-all duration-500" title="Neutral" />
                                <div style={{ width: `${urgPct}%` }} className="bg-rose-500 transition-all duration-500" title="Urgent / Escalated" />
                              </div>

                              <div className="grid grid-cols-3 gap-2 text-center">
                                <div className="p-2.5 rounded-xl border border-emerald-100 dark:border-emerald-900/40 bg-emerald-50/50 dark:bg-emerald-950/20">
                                  <div className="flex items-center justify-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                                    <ThumbsUp className="h-3 w-3" /> Positive
                                  </div>
                                  <div className="text-base font-bold font-mono text-emerald-900 dark:text-emerald-300 mt-0.5">{pos}</div>
                                  <div className="text-[10px] text-emerald-600/70">{posPct}%</div>
                                </div>

                                <div className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
                                  <div className="flex items-center justify-center gap-1 text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                                    <MessageSquare className="h-3 w-3" /> Neutral
                                  </div>
                                  <div className="text-base font-bold font-mono text-slate-900 dark:text-white mt-0.5">{neu}</div>
                                  <div className="text-[10px] text-slate-400">{neuPct}%</div>
                                </div>

                                <div className="p-2.5 rounded-xl border border-rose-100 dark:border-rose-900/40 bg-rose-50/50 dark:bg-rose-950/20">
                                  <div className="flex items-center justify-center gap-1 text-[11px] font-semibold text-rose-700 dark:text-rose-400">
                                    <AlertCircle className="h-3 w-3" /> Urgent
                                  </div>
                                  <div className="text-base font-bold font-mono text-rose-900 dark:text-rose-300 mt-0.5">{urg}</div>
                                  <div className="text-[10px] text-rose-600/70">{urgPct}%</div>
                                </div>
                              </div>
                            </div>
                          );
                        })()}
                      </div>

                      {/* 7-Day Trend Chart */}
                      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-emerald-500" />
                            <h2 className="text-sm font-bold text-slate-900 dark:text-white">7-Day Conversation Activity</h2>
                          </div>
                          <span className="text-[11px] text-slate-400">Last 7 Days</span>
                        </div>

                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                          Daily conversation volume and lead capture frequency across your deployed channels.
                        </p>

                        <div className="grid grid-cols-7 gap-2 pt-2 items-end h-36">
                          {(analyticsData?.trend7Days || [
                            { date: 'Day 1', conversations: 0, leads: 0 },
                            { date: 'Day 2', conversations: 0, leads: 0 },
                            { date: 'Day 3', conversations: 0, leads: 0 },
                            { date: 'Day 4', conversations: 0, leads: 0 },
                            { date: 'Day 5', conversations: 0, leads: 0 },
                            { date: 'Day 6', conversations: 0, leads: 0 },
                            { date: 'Day 7', conversations: 0, leads: 0 },
                          ]).map((item: any, idx: number) => {
                            const maxVal = Math.max(5, ...((analyticsData?.trend7Days || []).map((t: any) => t.conversations)));
                            const heightPct = Math.max(12, Math.round((item.conversations / maxVal) * 100));
                            return (
                              <div key={idx} className="flex flex-col items-center gap-1.5 h-full justify-end">
                                <div className="text-[10px] font-mono text-slate-500 font-bold">{item.conversations}</div>
                                <div
                                  style={{ height: `${heightPct}%` }}
                                  className="w-full rounded-t-lg bg-blue-500 hover:bg-blue-600 transition-all cursor-pointer"
                                  title={`${item.date}: ${item.conversations} conversations, ${item.leads} leads`}
                                />
                                <div className="text-[9.5px] text-slate-400 font-mono truncate w-full text-center">
                                  {item.date.slice(5) || item.date}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Knowledge Base Gap Health Card */}
                    <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="flex items-center gap-3.5">
                        <div className="h-10 w-10 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 flex items-center justify-center shrink-0">
                          <Target className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                        </div>
                        <div>
                          <h3 className="text-xs font-bold text-slate-900 dark:text-white">Knowledge Gap Engine</h3>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            {analyticsData?.unansweredCount ?? 0} queries currently flagged where the AI had low retrieval confidence.
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveTab('overview')}
                        className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 text-xs font-semibold transition cursor-pointer"
                      >
                        View Gap Resolution &rarr;
                      </button>
                    </div>
                  </div>
                )}
              </div>
  );
};
