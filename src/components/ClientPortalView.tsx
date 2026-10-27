import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Calendar, 
  Target, 
  Users, 
  CalendarCheck, 
  TrendingDown, 
  TrendingUp, 
  Phone, 
  Mail, 
  ShieldCheck, 
  Sparkles,
  ExternalLink,
  ChevronDown,
  CheckCircle2,
  Clock,
  Layers,
  ArrowRight
} from 'lucide-react';
import { Client, InsightsData, LeadRecord, AdCreative } from '../types';
import { api } from '../services/api';
import { StatsOverview } from './StatsOverview';
import { ChartsSection } from './ChartsSection';

interface ClientPortalViewProps {
  client: Client;
  onSelectAnotherClient?: (id: string) => void;
  availableClients?: Client[];
}

export const ClientPortalView: React.FC<ClientPortalViewProps> = ({
  client,
  onSelectAnotherClient,
  availableClients,
}) => {
  const [dateRange, setDateRange] = useState('30d');
  const [insights, setInsights] = useState<InsightsData | null>(null);
  const [leads, setLeads] = useState<LeadRecord[]>([]);
  const [ads, setAds] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadClientData();
  }, [client, dateRange]);

  const loadClientData = async () => {
    setIsLoading(true);
    try {
      const [insightsRes, leadsRes, campaignsRes] = await Promise.all([
        api.getInsights(client.id, dateRange),
        api.getLeads(client.id),
        api.getCampaigns(client.id),
      ]);
      setInsights(insightsRes.summary);
      setLeads(leadsRes);
      setAds(insightsRes.adStats);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      {/* Client Header Branding */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center text-amber-400 font-bold font-serif text-2xl shadow-md border border-slate-700">
                <span>E</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                    {client.businessName}
                  </h1>
                  <span className="text-xs bg-amber-50 text-amber-800 font-bold px-2 py-0.5 rounded border border-amber-200">
                    Client Portal
                  </span>
                </div>
                <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                  <span>Managed by Ecentra Concierge</span>
                  <span>•</span>
                  <span>{client.serviceArea.city}, {client.serviceArea.state}</span>
                </div>
              </div>
            </div>

            {/* Client switch dropdown if available in preview */}
            {availableClients && onSelectAnotherClient && availableClients.length > 1 && (
              <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-lg border border-slate-200 text-xs">
                <span className="text-slate-500 font-medium">Viewing as:</span>
                <select
                  value={client.id}
                  onChange={(e) => onSelectAnotherClient(e.target.value)}
                  className="bg-white text-slate-900 font-semibold rounded px-2 py-1 border border-slate-200"
                >
                  {availableClients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.businessName}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Client Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* Date Filter & Status Banner */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6 bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-semibold text-slate-900">Live Campaign Status:</span>
            <span>Your local lead campaigns are running continuously on Facebook & Instagram.</span>
          </div>

          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            {['today', '7d', '30d', 'this_month', 'lifetime'].map((rangeKey) => {
              const labels: Record<string, string> = {
                today: 'Today',
                '7d': 'Last 7 Days',
                '30d': 'Last 30 Days',
                this_month: 'This Month',
                lifetime: 'All-Time',
              };
              return (
                <button
                  key={rangeKey}
                  onClick={() => setDateRange(rangeKey)}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                    dateRange === rangeKey
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {labels[rangeKey]}
                </button>
              );
            })}
          </div>
        </div>

        {/* High-Level Overview Metrics (Read-Only) */}
        {insights && <StatsOverview insights={insights} clientName={client.businessName} />}

        {/* Daily Performance Chart */}
        {insights && <ChartsSection dailyData={insights.dailyBreakdown} />}

        {/* Active Creative Showcase (Read-Only) */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 mb-8">
          <div className="mb-4">
            <h3 className="font-bold text-slate-900 text-base">
              Top Performing Ad Creatives
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Live visuals and promotional offers actively generating inquiries for your business
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ads.map((ad) => (
              <div
                key={ad.adId}
                className="rounded-xl border border-slate-200 overflow-hidden bg-slate-50/50 flex flex-col justify-between"
              >
                <div>
                  <div className="aspect-video w-full bg-slate-200 relative overflow-hidden">
                    <img
                      src={ad.imageUrl}
                      alt={ad.adName}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded">
                      {ad.status === 'ACTIVE' ? 'Active in Feed' : 'Scheduled'}
                    </div>
                  </div>

                  <div className="p-4">
                    <h4 className="font-bold text-slate-900 text-sm leading-snug line-clamp-1">
                      {ad.headline}
                    </h4>
                    <div className="text-xs text-slate-600 line-clamp-2 mt-1">
                      {ad.adName}
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-200 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase block">New Leads</span>
                        <span className="font-bold text-slate-900 text-sm">{ad.leads}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase block">Cost Per Lead</span>
                        <span className="font-bold text-emerald-700 text-sm">${ad.cpl.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Verified Leads Received */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Recent Customer Inquiries ({leads.length})
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Automatically synced into your contact management system and dispatched to your team
              </p>
            </div>
            <div className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Real-Time Sync Active</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Customer Name</th>
                  <th className="py-2.5 px-3">Phone</th>
                  <th className="py-2.5 px-3">Email</th>
                  <th className="py-2.5 px-3">Date & Time</th>
                  <th className="py-2.5 px-3">Source</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-3 font-bold text-slate-900">{lead.fullName}</td>
                    <td className="py-3 px-3 font-semibold text-slate-800">{lead.phone}</td>
                    <td className="py-3 px-3 text-slate-600">{lead.email}</td>
                    <td className="py-3 px-3 text-slate-500">
                      {new Date(lead.submittedAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3 px-3">
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px] font-medium">
                        Instagram & Facebook Ad
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Concierge Support Card */}
        <div className="bg-slate-900 text-white rounded-xl p-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h4 className="font-bold text-base text-amber-400">
              Questions about your campaigns or want to adjust your monthly budget?
            </h4>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              Your Ecentra Concierge dedicated team monitors your target cost per lead daily. Contact Harold directly anytime to refresh offers or expand radius.
            </p>
          </div>
          <a
            href="mailto:support@ecentraconcierge.com"
            className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-sm"
          >
            Contact Ecentra Concierge
          </a>
        </div>
      </div>
    </div>
  );
};
