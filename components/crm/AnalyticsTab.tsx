import React, { useState } from 'react';
import {
  BarChart3,
  Download,
  RefreshCw,
  TrendingUp,
  Users,
  Target,
  DollarSign,
  Award,
  Search,
  Filter,
  PieChart,
  ThumbsUp,
  MessageSquare,
  AlertCircle,
  Bot,
  CalendarCheck,
  CheckCircle2,
  Clock,
  XCircle,
  Sparkles,
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
  const [analyticsViewTab, setAnalyticsViewTab] = useState<'conversations' | 'bookings' | 'customers' | 'funnel'>('conversations');
  const [customerSearchQuery, setCustomerSearchQuery] = useState<string>('');
  const [customerStatusFilter, setCustomerStatusFilter] = useState<'all' | 'VIP' | 'Regular' | 'New'>('all');
  const [chatChartMetric, setChatChartMetric] = useState<'conversations' | 'leads'>('conversations');
  const [bookingChartMetric, setBookingChartMetric] = useState<'revenue' | 'bookings'>('revenue');

  // Key metrics calculation with robust fallbacks
  const wa = analyticsData?.webAnalytics;
  const metrics = analyticsData?.metrics;

  const totalConversations = metrics?.totalConversations ?? analyticsData?.totalConversations ?? wa?.overview?.totalConversations ?? 0;
  const totalMessages = metrics?.totalMessages ?? analyticsData?.totalMessages ?? wa?.overview?.totalMessages ?? 0;
  const totalBookings = wa?.overview?.totalBookings ?? appointments?.length ?? 0;
  const confirmedBookings = wa?.bookingStatus?.confirmed ?? wa?.overview?.confirmedBookings ?? 0;
  const pendingBookings = wa?.bookingStatus?.pending ?? wa?.overview?.pendingBookings ?? 0;
  const completedBookings = wa?.bookingStatus?.completed ?? 0;
  const cancelledBookings = wa?.bookingStatus?.cancelled ?? wa?.overview?.cancelledBookings ?? 0;
  const conversionRate = wa?.overview?.conversionRate ?? metrics?.conversionRate ?? '0.0';
  const resolutionRate = metrics?.resolutionRate ?? '98.5';
  const unansweredCount = analyticsData?.unansweredCount ?? metrics?.pendingUnanswered ?? 0;
  const pipelineRevenue = wa?.overview?.totalPipelineRevenue ?? 0;
  const avgBookingValue = wa?.overview?.avgBookingValue ?? 0;
  const totalLeads = metrics?.totalLeads ?? analyticsData?.totalLeads ?? wa?.overview?.totalLeads ?? 0;
  const totalClients = wa?.overview?.totalCustomers ?? 0;
  const realtimeActive = wa?.overview?.realtimeActive || 1;

  const handleExportAnalyticsCsv = () => {
    let csv = 'Category,Metric,Value\n';
    csv += `Chatbot,Total Conversations,${totalConversations}\n`;
    csv += `Chatbot,Total Messages Exchanged,${totalMessages}\n`;
    csv += `Chatbot,AI Resolution Rate,${resolutionRate}%\n`;
    csv += `Chatbot,Captured Leads,${totalLeads}\n`;
    csv += `Chatbot,Unanswered Queries,${unansweredCount}\n`;
    csv += `Bookings,Total Bookings,${totalBookings}\n`;
    csv += `Bookings,Confirmed Bookings,${confirmedBookings}\n`;
    csv += `Bookings,Completed Bookings,${completedBookings}\n`;
    csv += `Bookings,Pending Bookings,${pendingBookings}\n`;
    csv += `Bookings,Cancelled Bookings,${cancelledBookings}\n`;
    csv += `Bookings,Pipeline Revenue,$${pipelineRevenue}\n`;
    csv += `Bookings,Average Booking Value,$${avgBookingValue}\n`;
    csv += `Bookings,Chat-to-Booking Rate,${conversionRate}%\n\n`;

    csv += 'Daily Time Series Trends\nDate,Conversations,Messages,Bookings,Revenue,Leads\n';
    (wa?.timeSeries || []).forEach((t: any) => {
      csv += `${t.date},${t.conversations || 0},${t.messages || 0},${t.bookings || 0},${t.revenue || 0},${t.leads || 0}\n`;
    });
    csv += '\n';

    csv += 'Service Performance Breakdown\nService Name,Bookings,Revenue,Share %,Avg Price\n';
    (wa?.servicePerformance || []).forEach((s: any) => {
      csv += `"${s.serviceName}",${s.bookings},${s.revenue},${s.percent}%,${s.avgPrice}\n`;
    });
    csv += '\n';

    csv += 'Client Directory\nName,Email,Phone,Status,Bookings,Total Spend,Preferred Services,Last Booking\n';
    (wa?.customerDirectory || []).forEach((c: any) => {
      csv += `"${c.name}","${c.email}","${c.phone || ''}","${c.status}",${c.totalBookings},${c.totalSpend},"${(c.preferredServices || []).join(';') || 'General'}","${c.lastBooking || ''}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `crescelo_analytics_report_${new Date().toISOString().slice(0, 10)}.csv`;
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
              <span>{realtimeActive} Active Now</span>
            </div>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Track real-time chatbot conversations, user engagement, and appointment bookings.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Note: Landing page dropdown is hidden as requested, keeping analytics focused on chatbot & bookings */}

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
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer ${
                  analyticsRange === rng.days
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
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

      {/* Primary KPI Metric Row: Chatbot & Bookings */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* KPI 1: Chatbot Conversations */}
        <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Conversations</span>
            <MessageSquare className="h-4 w-4 text-blue-500" />
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-white font-mono">
            {totalConversations.toLocaleString()}
          </div>
          <div className="text-[10.5px] text-blue-600 dark:text-blue-400 font-semibold flex items-center gap-1 truncate">
            <span>{totalMessages.toLocaleString()} messages</span>
          </div>
        </div>

        {/* KPI 2: Total Bookings */}
        <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Total Bookings</span>
            <CalendarCheck className="h-4 w-4 text-indigo-500" />
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-white font-mono">
            {totalBookings.toLocaleString()}
          </div>
          <div className="text-[10.5px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1 truncate">
            <span>{confirmedBookings} confirmed</span>
          </div>
        </div>

        {/* KPI 3: Chat-to-Booking Rate */}
        <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Conversion Rate</span>
            <Target className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-white font-mono">
            {conversionRate}%
          </div>
          <div className="text-[10.5px] text-emerald-600 dark:text-emerald-400 font-semibold truncate">
            Chat to booking
          </div>
        </div>

        {/* KPI 4: AI Resolution Rate */}
        <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>AI Resolution</span>
            <Bot className="h-4 w-4 text-purple-500" />
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-white font-mono">
            {resolutionRate}%
          </div>
          <div className="text-[10.5px] text-slate-400 truncate">
            {unansweredCount} flagged gaps
          </div>
        </div>

        {/* KPI 5: Booking Revenue */}
        <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Booking Revenue</span>
            <DollarSign className="h-4 w-4 text-amber-500" />
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-white font-mono">
            ${pipelineRevenue.toLocaleString()}
          </div>
          <div className="text-[10.5px] text-slate-400 truncate">
            Avg ${avgBookingValue}/booking
          </div>
        </div>

        {/* KPI 6: Captured Leads */}
        <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Captured Leads</span>
            <Users className="h-4 w-4 text-rose-500" />
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-white font-mono">
            {totalLeads.toLocaleString()}
          </div>
          <div className="text-[10.5px] text-slate-400 truncate">
            {totalClients} client profiles
          </div>
        </div>
      </div>

      {/* Sub-Tabs Switcher */}
      <div className="flex items-center gap-1.5 border-b border-slate-200 dark:border-slate-800 pb-1">
        {[
          { id: 'conversations', label: 'Chatbot Engagement & AI Tone', icon: Bot },
          { id: 'bookings', label: 'Bookings & Service Performance', icon: CalendarCheck },
          { id: 'customers', label: 'Client & Booking CRM', icon: Users },
          { id: 'funnel', label: 'Chat-to-Booking Funnel', icon: Target },
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

      {/* SUBTAB 1: CHATBOT ENGAGEMENT & AI TONE */}
      {analyticsViewTab === 'conversations' && (
        <div className="space-y-6">
          {/* Daily Chatbot Engagement Time-Series Chart */}
          <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-blue-500" />
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                    Daily Chatbot Conversation Activity
                  </h2>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Daily trajectory of user conversations, incoming inquiries, and captured leads.
                </p>
              </div>

              {/* Chart Metric Toggle */}
              <div className="flex items-center p-0.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setChatChartMetric('conversations')}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition cursor-pointer ${
                    chatChartMetric === 'conversations'
                      ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  Conversations &amp; Messages
                </button>
                <button
                  type="button"
                  onClick={() => setChatChartMetric('leads')}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition cursor-pointer ${
                    chatChartMetric === 'leads'
                      ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  Leads &amp; Inquiries
                </button>
              </div>
            </div>

            {/* Visual Bar Columns Chart */}
            {(() => {
              const series = wa?.timeSeries || [];
              if (series.length === 0) {
                return (
                  <div className="py-12 text-center text-xs text-slate-400">
                    No conversation events recorded for this selected time range yet.
                  </div>
                );
              }

              const maxMetric = Math.max(
                1,
                ...series.map((s: any) => (chatChartMetric === 'conversations' ? (s.conversations || s.views || 0) : (s.leads || s.bookings || 0)))
              );

              return (
                <div className="space-y-2">
                  <div className="flex items-end gap-1 sm:gap-2 h-48 pt-6 pb-2 px-1 overflow-x-auto">
                    {series.map((item: any, idx: number) => {
                      const val = chatChartMetric === 'conversations'
                        ? (item.conversations || item.views || 0)
                        : (item.leads || item.bookings || 0);
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
                              <div>Conversations: <span className="text-blue-400 font-mono font-bold">{item.conversations || 0}</span></div>
                              <div>Messages: <span className="text-indigo-300 font-mono font-bold">{item.messages || 0}</span></div>
                              <div>Leads: <span className="text-rose-300 font-mono font-bold">{item.leads || 0}</span></div>
                              <div>Bookings: <span className="text-emerald-400 font-mono font-bold">{item.bookings || 0}</span></div>
                            </div>
                          </div>

                          {/* Bar visual */}
                          <div className="w-full flex items-end justify-center h-full">
                            <div
                              style={{ height: `${heightPct}%` }}
                              className={`w-full rounded-t-md transition-all cursor-pointer ${
                                chatChartMetric === 'conversations'
                                  ? 'bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-500'
                                  : 'bg-indigo-500 hover:bg-indigo-600 dark:bg-indigo-600 dark:hover:bg-indigo-500'
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
                        <span className={`h-2.5 w-2.5 rounded-sm ${chatChartMetric === 'conversations' ? 'bg-blue-500' : 'bg-indigo-500'}`} />
                        <span>{chatChartMetric === 'conversations' ? 'Daily Conversations' : 'Captured Leads'}</span>
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

          {/* Visitor Sentiment & 7-Day Activity Grid */}
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
                const sentimentObj = analyticsData?.sentiment ?? metrics?.sentiment;
                const pos = sentimentObj?.positive ?? 0;
                const neu = sentimentObj?.neutral ?? (totalConversations || 1);
                const urg = sentimentObj?.urgent ?? 0;
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
                Daily conversation volume and lead capture frequency across your assistant.
              </p>

              <div className="grid grid-cols-7 gap-2 pt-2 items-end h-36">
                {(analyticsData?.trend7Days ?? metrics?.trend ?? [
                  { date: 'Day 1', count: 0, leads: 0 },
                  { date: 'Day 2', count: 0, leads: 0 },
                  { date: 'Day 3', count: 0, leads: 0 },
                  { date: 'Day 4', count: 0, leads: 0 },
                  { date: 'Day 5', count: 0, leads: 0 },
                  { date: 'Day 6', count: 0, leads: 0 },
                  { date: 'Day 7', count: 0, leads: 0 },
                ]).map((item: any, idx: number, arr: any[]) => {
                  const val = item.count ?? item.conversations ?? 0;
                  const maxVal = Math.max(5, ...(arr.map((t: any) => t.count ?? t.conversations ?? 0)));
                  const heightPct = Math.max(12, Math.round((val / maxVal) * 100));
                  return (
                    <div key={idx} className="flex flex-col items-center gap-1.5 h-full justify-end">
                      <div className="text-[10px] font-mono text-slate-500 font-bold">{val}</div>
                      <div
                        style={{ height: `${heightPct}%` }}
                        className="w-full rounded-t-lg bg-blue-500 hover:bg-blue-600 transition-all cursor-pointer"
                        title={`${item.date || item.label}: ${val} conversations, ${item.leads || 0} leads`}
                      />
                      <div className="text-[9.5px] text-slate-400 font-mono truncate w-full text-center">
                        {item.label || (item.date ? item.date.slice(5) : `D${idx+1}`)}
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
                  {unansweredCount} queries currently flagged where the AI had low retrieval confidence.
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

      {/* SUBTAB 2: BOOKINGS & SERVICE PERFORMANCE */}
      {analyticsViewTab === 'bookings' && (
        <div className="space-y-6">
          {/* Daily Bookings & Revenue Time-Series Chart */}
          <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <CalendarCheck className="h-4 w-4 text-emerald-500" />
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                    Bookings &amp; Revenue Trajectory
                  </h2>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Track revenue generated from confirmed client appointments over time.
                </p>
              </div>

              {/* Chart Metric Toggle */}
              <div className="flex items-center p-0.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setBookingChartMetric('revenue')}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition cursor-pointer ${
                    bookingChartMetric === 'revenue'
                      ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  Pipeline Revenue ($)
                </button>
                <button
                  type="button"
                  onClick={() => setBookingChartMetric('bookings')}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition cursor-pointer ${
                    bookingChartMetric === 'bookings'
                      ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  Booking Count
                </button>
              </div>
            </div>

            {/* Visual Bar Columns Chart */}
            {(() => {
              const series = wa?.timeSeries || [];
              if (series.length === 0) {
                return (
                  <div className="py-12 text-center text-xs text-slate-400">
                    No bookings recorded for this selected time range yet.
                  </div>
                );
              }

              const maxMetric = Math.max(
                1,
                ...series.map((s: any) => (bookingChartMetric === 'revenue' ? (s.revenue || s.bookings * 45) : (s.bookings || 0)))
              );

              return (
                <div className="space-y-2">
                  <div className="flex items-end gap-1 sm:gap-2 h-48 pt-6 pb-2 px-1 overflow-x-auto">
                    {series.map((item: any, idx: number) => {
                      const val = bookingChartMetric === 'revenue'
                        ? (item.revenue || item.bookings * 45)
                        : (item.bookings || 0);
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
                              <div>Revenue: <span className="text-emerald-400 font-mono font-bold">${item.revenue || item.bookings * 45}</span></div>
                              <div>Bookings: <span className="text-blue-400 font-mono font-bold">{item.bookings || 0}</span></div>
                            </div>
                          </div>

                          {/* Bar visual */}
                          <div className="w-full flex items-end justify-center h-full">
                            <div
                              style={{ height: `${heightPct}%` }}
                              className="w-full rounded-t-md bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-500 transition-all cursor-pointer"
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
                        <span className="h-2.5 w-2.5 rounded-sm bg-emerald-500" />
                        <span>{bookingChartMetric === 'revenue' ? 'Pipeline Revenue ($)' : 'Confirmed Bookings'}</span>
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

          {/* Booking Status Distribution */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Confirmed</span>
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              </div>
              <div className="text-xl font-bold font-mono text-slate-900 dark:text-white">
                {confirmedBookings}
              </div>
              <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                Scheduled &amp; Active
              </div>
            </div>

            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Completed</span>
                <Award className="h-4 w-4 text-blue-500" />
              </div>
              <div className="text-xl font-bold font-mono text-slate-900 dark:text-white">
                {completedBookings}
              </div>
              <div className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold">
                Fulfilled Appointments
              </div>
            </div>

            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Pending</span>
                <Clock className="h-4 w-4 text-amber-500" />
              </div>
              <div className="text-xl font-bold font-mono text-slate-900 dark:text-white">
                {pendingBookings}
              </div>
              <div className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">
                Awaiting Confirmation
              </div>
            </div>

            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Cancelled</span>
                <XCircle className="h-4 w-4 text-rose-500" />
              </div>
              <div className="text-xl font-bold font-mono text-slate-900 dark:text-white">
                {cancelledBookings}
              </div>
              <div className="text-[10px] text-rose-600 dark:text-rose-400 font-semibold">
                Rescheduled / Voided
              </div>
            </div>
          </div>

          {/* Booked Services & Appointment Performance Table */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <CalendarCheck className="h-4 w-4 text-emerald-500" />
                  <span>Booked Services &amp; Appointment Performance</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Breakdown of client appointment volume, booking share, and revenue per service.
                </p>
              </div>
              <span className="text-xs font-mono text-slate-400">
                {totalBookings} Total Bookings
              </span>
            </div>

            {(() => {
              const services = wa?.servicePerformance || [];
              if (services.length === 0) {
                return (
                  <div className="py-12 text-center text-xs text-slate-400">
                    No services have been booked yet. Appointments scheduled through your chatbot will appear here.
                  </div>
                );
              }

              return (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-800">
                      <tr>
                        <th className="px-4 py-3">Service Name</th>
                        <th className="px-4 py-3">Bookings</th>
                        <th className="px-4 py-3">Booking Share</th>
                        <th className="px-4 py-3">Total Revenue</th>
                        <th className="px-4 py-3">Average Price</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {services.map((svc: any, idx: number) => (
                        <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                          <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">
                            {svc.serviceName}
                          </td>
                          <td className="px-4 py-3 font-mono font-bold text-slate-900 dark:text-white">
                            {svc.bookings}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-slate-700 dark:text-slate-300">{svc.percent}%</span>
                              <div className="w-16 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                                <div style={{ width: `${svc.percent}%` }} className="h-full rounded-full bg-emerald-500" />
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                            ${svc.revenue}
                          </td>
                          <td className="px-4 py-3 font-mono text-slate-600 dark:text-slate-400">
                            ${svc.avgPrice}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* SUBTAB 3: CLIENT & BOOKING CRM */}
      {analyticsViewTab === 'customers' && (
        <div className="space-y-6">
          {/* Customer CRM Search & Filter Toolbar */}
          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative flex-1 w-full">
              <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search clients by name, email, phone, or service..."
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
            const allCusts = wa?.customerDirectory || [];
            const filtered = allCusts.filter((c: any) => {
              if (customerStatusFilter !== 'all' && c.status !== customerStatusFilter) return false;
              if (customerSearchQuery.trim()) {
                const q = customerSearchQuery.toLowerCase();
                return (
                  c.name.toLowerCase().includes(q) ||
                  c.email.toLowerCase().includes(q) ||
                  (c.phone && c.phone.toLowerCase().includes(q)) ||
                  ((c.preferredServices || []).join(' ').toLowerCase().includes(q))
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
                      <span>Client &amp; Booking CRM Directory</span>
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Showing {filtered.length} client profile(s) with booking frequency and spend tracking.
                    </p>
                  </div>
                  <span className="text-xs font-mono text-slate-400">
                    {wa?.overview?.repeatRate ?? 0}% Repeat Client Rate
                  </span>
                </div>

                {filtered.length === 0 ? (
                  <div className="py-12 text-center text-xs text-slate-400">
                    No client profiles match your search criteria.
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
                            <td className="px-4 py-3 text-slate-600 dark:text-slate-300 max-w-[240px] truncate">
                              {(client.preferredServices || []).join(', ') || 'General Consultation'}
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

      {/* SUBTAB 4: CHAT-TO-BOOKING FUNNEL */}
      {analyticsViewTab === 'funnel' && (
        <div className="space-y-6">
          {/* 4-Stage Chatbot Conversion Funnel */}
          <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-purple-500" />
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  Chat-to-Booking Conversion Funnel
                </h2>
              </div>
              <span className="text-[11px] text-slate-400">Visitor Drop-off Analysis</span>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Tracks visitor progression from their first chat session down to confirmed appointment booking.
            </p>

            <div className="space-y-3 pt-2">
              {(wa?.chatbotFunnelSteps || wa?.funnelSteps || [
                { step: 'Chat Sessions Started', count: totalConversations, dropOffPercent: 0 },
                { step: 'Engaged Inquiries (Multi-Turn)', count: Math.round(totalConversations * 0.7), dropOffPercent: 30 },
                { step: 'Lead Details Captured', count: totalLeads, dropOffPercent: 40 },
                { step: 'Confirmed Bookings', count: totalBookings, dropOffPercent: 25 },
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
                          {st.count} {idx === 3 ? 'bookings' : 'users'}
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

          {/* Booked Services Summary Table */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <CalendarCheck className="h-4 w-4 text-emerald-500" />
                <span>Service Booking Performance</span>
              </h2>
              <span className="text-xs text-slate-400">
                {(wa?.servicePerformance || []).length} active service(s)
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-4 py-3">Service Name</th>
                    <th className="px-4 py-3">Total Bookings</th>
                    <th className="px-4 py-3">Booking Share</th>
                    <th className="px-4 py-3">Total Revenue</th>
                    <th className="px-4 py-3">Avg Booking Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {(wa?.servicePerformance || []).length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-xs text-slate-400">
                        No service bookings recorded yet.
                      </td>
                    </tr>
                  ) : (
                    (wa?.servicePerformance || []).map((service: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                        <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">
                          {service.serviceName}
                        </td>
                        <td className="px-4 py-3 font-mono font-bold text-slate-900 dark:text-white">
                          {service.bookings}
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded-md text-[10.5px] font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                            {service.percent}%
                          </span>
                        </td>
                        <td className="px-4 py-3 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          ${service.revenue}
                        </td>
                        <td className="px-4 py-3 font-mono text-slate-600 dark:text-slate-400">
                          ${service.avgPrice}
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
    </div>
  );
};
