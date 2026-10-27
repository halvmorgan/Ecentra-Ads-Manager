import React, { useState } from 'react';
import { 
  Play, 
  Pause, 
  Copy, 
  Archive, 
  DollarSign, 
  AlertCircle, 
  ExternalLink, 
  Eye, 
  CheckCircle2, 
  XCircle, 
  Clock,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Image as ImageIcon,
  Rocket
} from 'lucide-react';
import { AdCreative, AdStatus, Client, AdStatItem } from '../types';

interface AdsTableProps {
  adStats: AdStatItem[];
  clients: Client[];
  onToggleStatus: (adId: string, currentStatus: AdStatus) => void;
  onDuplicate: (adId: string) => void;
  onArchive: (adId: string) => void;
  onAdjustBudget: (clientId: string, adId: string) => void;
  onSelectAdDetail: (adId: string) => void;
  onGoLive?: (campaignId: string) => void;
}

export const AdsTable: React.FC<AdsTableProps> = ({
  adStats,
  clients,
  onToggleStatus,
  onDuplicate,
  onArchive,
  onAdjustBudget,
  onSelectAdDetail,
  onGoLive,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [selectedAdForRejection, setSelectedAdForRejection] = useState<AdStatItem | null>(null);

  const filteredAds = adStats.filter((ad) => {
    if (filterStatus === 'ALL') return ad.status !== 'ARCHIVED';
    return ad.status === filterStatus;
  });

  const getStatusBadge = (status: AdStatus, effectiveStatus?: string, rejectionReason?: string) => {
    const st = effectiveStatus || status;
    switch (st) {
      case 'ACTIVE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Active
          </span>
        );
      case 'PAUSED':
      case 'CAMPAIGN_PAUSED':
      case 'ADSET_PAUSED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
            <Pause className="w-3 h-3 text-slate-500" />
            Paused
          </span>
        );
      case 'IN_REVIEW':
      case 'IN_PROCESS':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
            <Clock className="w-3 h-3 text-blue-500" />
            In Review
          </span>
        );
      case 'LEARNING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">
            <Sparkles className="w-3 h-3 text-purple-600" />
            Learning
          </span>
        );
      case 'LIMITED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
            <AlertCircle className="w-3 h-3 text-amber-600" />
            Limited
          </span>
        );
      case 'REJECTED':
      case 'DISAPPROVED':
        return (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedAdForRejection(adStats.find(a => a.rejectionReason === rejectionReason) || null);
            }}
            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800 hover:bg-red-200 transition-colors cursor-pointer"
            title="Click to view Meta policy reason"
          >
            <XCircle className="w-3 h-3 text-red-600" />
            Rejected
          </button>
        );
      case 'ARCHIVED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-50 text-slate-500">
            Archived
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
            {st}
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden mb-8">
      {/* Table Header Controls */}
      <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-semibold text-slate-900 text-base">
            Campaign Creatives & Performance
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Real delivery status from Meta Marketing API. Click any ad to view its complete detail page.
          </p>
        </div>

        {/* Status filters */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs font-medium">
          {['ALL', 'ACTIVE', 'PAUSED', 'REJECTED'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                filterStatus === st
                  ? 'bg-white shadow-xs text-slate-900 font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {st === 'ALL' ? 'All Active' : st.charAt(0) + st.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Responsive Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-600">
          <thead className="bg-slate-50 text-slate-500 font-semibold uppercase text-[11px] tracking-wider border-b border-slate-200">
            <tr>
              <th className="py-3 px-4">Ad Creative / Client</th>
              <th className="py-3 px-3">Delivery Status</th>
              <th className="py-3 px-3">Cost / Lead</th>
              <th className="py-3 px-3 text-right">Leads</th>
              <th className="py-3 px-3 text-right">Spend</th>
              <th className="py-3 px-3 text-right">CTR</th>
              <th className="py-3 px-3 text-right">Clicks</th>
              <th className="py-3 px-4 text-center">Quick Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredAds.map((ad) => {
              const isOverTarget = ad.isOverTarget && ad.status === 'ACTIVE';
              return (
                <tr 
                  key={ad.adId} 
                  onClick={() => onSelectAdDetail(ad.adId)}
                  className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                >
                  {/* Creative Name & Image Thumbnail */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-lg overflow-hidden bg-slate-100 shrink-0 border border-slate-200 relative group-hover:ring-2 group-hover:ring-amber-500/30 transition-all">
                        <img
                          src={ad.imageUrl}
                          alt={ad.adName}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                          <Eye className="w-3.5 h-3.5" />
                        </div>
                      </div>

                      <div className="min-w-0">
                        <div className="font-semibold text-slate-900 group-hover:text-amber-700 transition-colors truncate max-w-xs sm:max-w-md">
                          {ad.adName}
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                          <span className="font-medium text-slate-700">{ad.clientName}</span>
                          <span>•</span>
                          <span className="truncate italic">"{ad.headline}"</span>
                        </div>
                        {ad.rejectionReason && (
                          <div className="text-[11px] text-red-600 font-medium flex items-center gap-1 mt-1">
                            <AlertCircle className="w-3 h-3 shrink-0" />
                            <span className="truncate max-w-xs">{ad.rejectionReason}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Status Badge */}
                  <td className="py-3.5 px-3 whitespace-nowrap">
                    {getStatusBadge(ad.status, ad.effectiveStatus, ad.rejectionReason)}
                  </td>

                  {/* Cost Per Lead or Cost Per Click */}
                  <td className="py-3.5 px-3 whitespace-nowrap">
                    {ad.goalType === 'TRAFFIC_WEBSITE' ? (
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-bold text-slate-900">
                            ${(ad.cpc || (ad.clicks > 0 ? ad.spend / ad.clicks : 0)).toFixed(2)}
                          </span>
                          <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-blue-50 text-blue-700">
                            CPC
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          Direct Website Traffic
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className={`text-sm font-bold ${
                            isOverTarget ? 'text-red-600' : 'text-slate-900'
                          }`}>
                            ${ad.cpl > 0 ? ad.cpl.toFixed(2) : '0.00'}
                          </span>
                          {ad.cpl > 0 && !ad.isOwnBusiness && (
                            <span className={`text-[10px] font-semibold px-1 rounded ${
                              isOverTarget ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'
                            }`}>
                              {isOverTarget ? 'High' : 'On Target'}
                            </span>
                          )}
                          {ad.isOwnBusiness && (
                            <span className="text-[10px] font-semibold px-1 rounded bg-amber-50 text-amber-800">
                              Own Business
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          {ad.isOwnBusiness ? 'No Target CPL' : `Target: $${ad.targetCpl.toFixed(2)}`}
                        </div>
                      </div>
                    )}
                  </td>

                  {/* Results: Leads or Link Clicks */}
                  <td className="py-3.5 px-3 text-right whitespace-nowrap">
                    {ad.goalType === 'TRAFFIC_WEBSITE' ? (
                      <div>
                        <div className="font-semibold text-slate-900 text-sm">
                          {ad.clicks.toLocaleString()} clicks
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {ad.landingPageViews || Math.round(ad.clicks * 0.88)} views
                        </div>
                      </div>
                    ) : (
                      <span className="font-semibold text-slate-900 text-sm">
                        {ad.leads}
                      </span>
                    )}
                  </td>

                  {/* Spend */}
                  <td className="py-3.5 px-3 text-right whitespace-nowrap font-medium text-slate-900">
                    ${ad.spend.toLocaleString()}
                  </td>

                  {/* CTR */}
                  <td className="py-3.5 px-3 text-right whitespace-nowrap text-slate-700">
                    {ad.ctr.toFixed(2)}%
                  </td>

                  {/* Clicks */}
                  <td className="py-3.5 px-3 text-right whitespace-nowrap text-slate-600">
                    {ad.clicks.toLocaleString()}
                  </td>

                  {/* One-Click Action Controls */}
                  <td className="py-3.5 px-4 whitespace-nowrap text-center" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-center gap-1">
                      {/* One-Click Pause / Resume */}
                      <button
                        onClick={() => onToggleStatus(ad.adId, ad.status)}
                        disabled={ad.status === 'REJECTED'}
                        title={ad.status === 'ACTIVE' ? 'Pause Ad on Meta' : 'Resume Ad on Meta'}
                        className={`p-1.5 rounded-md border transition-all cursor-pointer ${
                          ad.status === 'ACTIVE'
                            ? 'text-amber-700 bg-amber-50 border-amber-200 hover:bg-amber-100'
                            : 'text-emerald-700 bg-emerald-50 border-emerald-200 hover:bg-emerald-100'
                        }`}
                      >
                        {ad.status === 'ACTIVE' ? (
                          <Pause className="w-3.5 h-3.5" />
                        ) : (
                          <Play className="w-3.5 h-3.5" />
                        )}
                      </button>

                      {/* Details View */}
                      <button
                        onClick={() => onSelectAdDetail(ad.adId)}
                        title="View Full Ad Detail & Performance"
                        className="p-1.5 rounded-md border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      {/* Duplicate Ad Creative (test new copy/image) */}
                      <button
                        onClick={() => onDuplicate(ad.adId)}
                        title="Duplicate Ad (test new text or image)"
                        className="p-1.5 rounded-md border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>

                      {/* Change Budget */}
                      <button
                        onClick={() => onAdjustBudget(ad.clientId, ad.adId)}
                        title="Change Daily Budget"
                        className="p-1.5 rounded-md border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
                      >
                        <DollarSign className="w-3.5 h-3.5" />
                      </button>

                      {/* Archive */}
                      <button
                        onClick={() => onArchive(ad.adId)}
                        title="Archive Ad"
                        className="p-1.5 rounded-md border border-slate-200 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
                      >
                        <Archive className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filteredAds.length === 0 && (
          <div className="p-8 text-center text-slate-500 text-xs">
            No ads found in this view. Click "Create Ad" above to launch a new campaign.
          </div>
        )}
      </div>

      {/* Meta Rejection Reason Detail Modal */}
      {selectedAdForRejection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl border border-red-200">
            <div className="flex items-center gap-2 text-red-600 font-bold text-base mb-2">
              <AlertCircle className="w-5 h-5" />
              <span>Meta Advertising Policy Rejection Notice</span>
            </div>
            <p className="text-xs text-slate-600 mb-4">
              Meta's automated ad review flagged this creative:
            </p>
            <div className="bg-red-50 p-3.5 rounded-lg border border-red-200 text-red-900 text-xs leading-relaxed mb-4">
              {selectedAdForRejection.rejectionReason}
            </div>
            <div className="bg-slate-50 p-3 rounded-lg text-xs text-slate-700 mb-5">
              <strong>How to fix:</strong> Click "Edit Ad" to replace the image or remove health/results guarantees.
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setSelectedAdForRejection(null)}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
