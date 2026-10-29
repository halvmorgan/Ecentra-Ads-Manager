import React, { useState } from 'react';
import { DailyInsight } from '../types';
import { TrendingUp, DollarSign, Users, CalendarCheck } from 'lucide-react';

interface ChartsSectionProps {
  dailyData: DailyInsight[];
}

export const ChartsSection: React.FC<ChartsSectionProps> = ({ dailyData }) => {
  const [metricView, setMetricView] = useState<'both' | 'spend' | 'leads'>('both');

  if (!dailyData || dailyData.length === 0) {
    return (
      <div className="bg-white rounded-xl p-8 border border-slate-200 shadow-xs mb-6 text-center">
        <TrendingUp className="w-8 h-8 text-slate-300 mx-auto mb-2" />
        <h3 className="font-semibold text-slate-700 text-sm">No ad results yet</h3>
        <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
          Daily performance trajectory will appear here once live Meta campaigns deliver impressions and leads.
        </p>
      </div>
    );
  }

  const maxSpend = Math.max(...dailyData.map((d) => d.spend), 10);
  const maxLeads = Math.max(...dailyData.map((d) => d.leads), 5);

  return (
    <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs mb-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="font-semibold text-slate-900 text-sm flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-amber-600" />
            <span>Daily Performance Trajectory</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time correlation of ad spend vs. verified customer lead acquisition
          </p>
        </div>

        {/* Chart View Filters */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg text-xs font-medium">
          <button
            onClick={() => setMetricView('both')}
            className={`px-2.5 py-1 rounded transition-all ${
              metricView === 'both' ? 'bg-white shadow-2xs text-slate-900 font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Combined
          </button>
          <button
            onClick={() => setMetricView('spend')}
            className={`px-2.5 py-1 rounded transition-all flex items-center gap-1 ${
              metricView === 'spend' ? 'bg-white shadow-2xs text-slate-900 font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-slate-900"></span>
            Spend ($)
          </button>
          <button
            onClick={() => setMetricView('leads')}
            className={`px-2.5 py-1 rounded transition-all flex items-center gap-1 ${
              metricView === 'leads' ? 'bg-white shadow-2xs text-slate-900 font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            Leads
          </button>
        </div>
      </div>

      {/* Chart Visualization */}
      <div className="h-56 w-full flex items-end gap-2 pt-6 pb-2 px-1 border-b border-slate-100">
        {dailyData.map((day, idx) => {
          const spendHeightPercent = Math.min(100, Math.round((day.spend / maxSpend) * 100));
          const leadsHeightPercent = Math.min(100, Math.round((day.leads / maxLeads) * 100));

          return (
            <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group relative">
              {/* Tooltip on hover */}
              <div className="absolute -top-14 opacity-0 group-hover:opacity-100 pointer-events-none transition-all z-20 bg-slate-900 text-white text-[11px] rounded-lg py-1.5 px-2.5 shadow-lg whitespace-nowrap">
                <div className="font-semibold text-amber-300">{day.date}</div>
                <div className="text-slate-300">Spend: ${day.spend.toFixed(2)}</div>
                <div className="text-slate-300">Leads: {day.leads} | Bookings: {day.bookings}</div>
              </div>

              {/* Bars container */}
              <div className="w-full flex items-end justify-center gap-1 h-full">
                {(metricView === 'both' || metricView === 'spend') && (
                  <div
                    style={{ height: `${spendHeightPercent}%` }}
                    className="w-full max-w-[14px] bg-slate-800 rounded-t transition-all group-hover:bg-slate-700"
                  ></div>
                )}
                {(metricView === 'both' || metricView === 'leads') && (
                  <div
                    style={{ height: `${leadsHeightPercent}%` }}
                    className="w-full max-w-[14px] bg-amber-500 rounded-t transition-all group-hover:bg-amber-400"
                  ></div>
                )}
              </div>

              {/* Date label */}
              <span className="text-[10px] text-slate-400 mt-2 truncate w-full text-center">
                {day.date.split(' ')[1] ? day.date.split(' ')[1] : day.date}
              </span>
            </div>
          );
        })}
      </div>

      {/* Legend & Summary */}
      <div className="flex flex-wrap items-center justify-between pt-3 text-xs text-slate-600 gap-2">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs bg-slate-800"></span>
            <span>Ad Spend ($)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs bg-amber-500"></span>
            <span>Instant Form Leads</span>
          </div>
        </div>

        <div className="text-[11px] text-slate-500">
          Showing 14-day rolling cadence • CPL calculated per lead event
        </div>
      </div>
    </div>
  );
};
