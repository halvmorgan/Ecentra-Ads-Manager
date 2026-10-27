import React from 'react';
import { 
  DollarSign, 
  Users, 
  CalendarCheck, 
  TrendingUp, 
  TrendingDown, 
  MousePointer, 
  Eye, 
  Percent, 
  Layers, 
  ArrowUpRight, 
  ArrowDownRight,
  Target
} from 'lucide-react';
import { InsightsData } from '../types';

interface StatsOverviewProps {
  insights: InsightsData;
  clientName?: string;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({ insights, clientName }) => {
  const isCplGood = insights.costPerLead > 0 && insights.costPerLead <= insights.targetCpl;
  const budgetPercentUsed = insights.monthlyBudget > 0 
    ? Math.min(100, Math.round((insights.totalSpentToDate / insights.monthlyBudget) * 100)) 
    : 0;

  return (
    <div className="space-y-4 mb-6">
      {/* Top 4 Hero Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* CARD 1: COST PER LEAD */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs relative overflow-hidden transition-all hover:shadow-sm">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            <span>Cost Per Lead (CPL)</span>
            <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${
              isCplGood ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              <Target className="w-3 h-3" />
              <span>Target: ${insights.targetCpl.toFixed(2)}</span>
            </div>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
              ${insights.costPerLead > 0 ? insights.costPerLead.toFixed(2) : '0.00'}
            </span>
            <span className="text-xs text-slate-500">/ lead</span>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1 font-medium">
              {isCplGood ? (
                <span className="text-emerald-600 flex items-center">
                  <TrendingDown className="w-3.5 h-3.5 mr-0.5" />
                  Within target budget
                </span>
              ) : (
                <span className="text-red-600 flex items-center">
                  <TrendingUp className="w-3.5 h-3.5 mr-0.5" />
                  +${(insights.costPerLead - insights.targetCpl).toFixed(2)} above target
                </span>
              )}
            </div>
            <span className="text-slate-400 text-[11px]">Meta Leads API</span>
          </div>
        </div>

        {/* CARD 2: TOTAL LEADS */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs relative overflow-hidden transition-all hover:shadow-sm">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            <span>New Client Leads</span>
            <span className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
              <Users className="w-3.5 h-3.5" />
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {insights.leads.toLocaleString()}
            </span>
            <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
              Verified Forms
            </span>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span>Avg {((insights.leads / 11) || 0).toFixed(1)} leads / day</span>
            <span className="text-slate-400 text-[11px]">Instant Forms</span>
          </div>
        </div>

        {/* CARD 3: BOOKINGS (GHL APPOINTMENTS) */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs relative overflow-hidden transition-all hover:shadow-sm">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            <span>Bookings (GoHighLevel)</span>
            <span className="w-6 h-6 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-xs">
              <CalendarCheck className="w-3.5 h-3.5" />
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {insights.bookings.toLocaleString()}
            </span>
            <span className="text-xs text-slate-500">appointments</span>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-700 font-medium">
              Cost / Booking: <strong className="text-purple-700">${insights.costPerBooking.toFixed(2)}</strong>
            </span>
            <span className="text-[11px] text-purple-600 font-semibold bg-purple-50 px-1.5 py-0.5 rounded">
              GHL Sync
            </span>
          </div>
        </div>

        {/* CARD 4: AD SPEND VS BUDGET */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs relative overflow-hidden transition-all hover:shadow-sm">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            <span>Total Spent To Date</span>
            <span className="text-[11px] font-medium text-slate-600">
              Budget: ${insights.monthlyBudget.toLocaleString()}
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
              ${insights.totalSpentToDate.toLocaleString()}
            </span>
            <span className="text-xs text-slate-500">this month</span>
          </div>

          {/* Budget progress bar */}
          <div className="mt-2">
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 ${
                  budgetPercentUsed > 90 ? 'bg-red-500' : budgetPercentUsed > 70 ? 'bg-amber-500' : 'bg-slate-900'
                }`}
                style={{ width: `${budgetPercentUsed}%` }}
              ></div>
            </div>
          </div>

          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-600">
              Left: <strong className="text-emerald-700 font-semibold">${insights.budgetRemaining.toLocaleString()}</strong>
            </span>
            <span className="text-slate-500 text-[11px]">
              {budgetPercentUsed}% paced
            </span>
          </div>
        </div>
      </div>

      {/* Secondary Metrics Bar (Clicks, CTR, Reach, Impressions, Frequency, CPC) */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 text-center">
          <div className="pt-2 sm:pt-0 sm:px-2">
            <span className="text-[11px] font-medium text-slate-500 block uppercase">Link Clicks</span>
            <span className="text-lg font-bold text-slate-900">{insights.clicks.toLocaleString()}</span>
          </div>
          <div className="pt-2 sm:pt-0 sm:px-2">
            <span className="text-[11px] font-medium text-slate-500 block uppercase">Click-Through (CTR)</span>
            <span className="text-lg font-bold text-slate-900">{insights.ctr.toFixed(2)}%</span>
          </div>
          <div className="pt-2 sm:pt-0 sm:px-2">
            <span className="text-[11px] font-medium text-slate-500 block uppercase">Reach</span>
            <span className="text-lg font-bold text-slate-900">{insights.reach.toLocaleString()}</span>
          </div>
          <div className="pt-2 sm:pt-0 sm:px-2">
            <span className="text-[11px] font-medium text-slate-500 block uppercase">Impressions</span>
            <span className="text-lg font-bold text-slate-900">{insights.impressions.toLocaleString()}</span>
          </div>
          <div className="pt-2 sm:pt-0 sm:px-2">
            <span className="text-[11px] font-medium text-slate-500 block uppercase">Frequency</span>
            <span className="text-lg font-bold text-slate-900">{insights.frequency.toFixed(2)}</span>
          </div>
          <div className="pt-2 sm:pt-0 sm:px-2">
            <span className="text-[11px] font-medium text-slate-500 block uppercase">Cost / Click (CPC)</span>
            <span className="text-lg font-bold text-slate-900">${insights.cpc.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
