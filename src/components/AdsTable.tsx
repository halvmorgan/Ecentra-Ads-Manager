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
import { api } from '../services/api';

interface AdsTableProps {
  adStats: AdStatItem[];
  clients: Client[];
  onToggleStatus: (adId: string, currentStatus: AdStatus, configuredStatus?: string) => void;
  onDuplicate: (adId: string) => void;
  onArchive: (adId: string) => void;
  onAdjustBudget: (clientId: string, adId: string) => void;
  onSelectAdDetail: (adId: string) => void;
  onGoLive?: (campaignId: string) => void;
  onRefreshData?: () => void;
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
  onRefreshData,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [selectedAdForRejection, setSelectedAdForRejection] = useState<AdStatItem | null>(null);

  // Pause ALL ads state
  const [isPauseAllConfirmOpen, setIsPauseAllConfirmOpen] = useState(false);
  const [isPausingAll, setIsPausingAll] = useState(false);
  const [pauseAllResults, setPauseAllResults] = useState<{
    paused: Array<{ id: string; name: string; type: string; details?: string }>;
    failed: Array<{ id: string; name: string; error: string }>;
    message: string;
  } | null>(null);

  const filteredAds = adStats.filter((ad) => {
    if (filterStatus === 'ALL') return ad.status !== 'ARCHIVED';
    return ad.status === filterStatus;
  });

  // PROBLEM 1: Show "In Review" ONLY when effective_status is PENDING_REVIEW.
  // Show "Active" when it is ACTIVE, and "Paused" when it is PAUSED, ADSET_PAUSED or CAMPAIGN_PAUSED.
  const getStatusBadge = (status: AdStatus, effectiveStatus?: string, rejectionReason?: string) => {
    if (effectiveStatus === 'PENDING_REVIEW') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
          <Clock className="w-3 h-3 text-blue-500" />
          In Review
        </span>
      );
    }

    if (effectiveStatus === 'ACTIVE') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          Active
        </span>
      );
    }

    if (
      effectiveStatus === 'PAUSED' ||
      effectiveStatus === 'CAMPAIGN_PAUSED' ||
      effectiveStatus === 'ADSET_PAUSED' ||
      status === 'PAUSED'
    ) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
          <Pause className="w-3 h-3 text-slate-500" />
          Paused
        </span>
      );
    }

    if ((status as string) === 'REJECTED' || (status as string) === 'DISAPPROVED' || status === 'WITH_ISSUES' || effectiveStatus === 'DISAPPROVED' || effectiveStatus === 'REJECTED') {
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
    }

    if (status === 'ACTIVE') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          Active
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
        {effectiveStatus || status}
      </span>
    );
  };

  const handleExecutePauseAll = async () => {
    setIsPausingAll(true);
    try {
      const res = await api.pauseAllAds();
      setPauseAllResults({
        paused: res.paused || [],
        failed: res.failed || [],
        message: res.message || 'Pause operation complete',
      });
      setIsPauseAllConfirmOpen(false);
      onRefreshData?.();
    } catch (err: any) {
      alert(`Error pausing all ads: ${err.message}`);
    } finally {
      setIsPausingAll(false);
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

        <div className="flex items-center gap-2">
          {/* Pause ALL ads Button (Requirement 2) */}
          <button
            onClick={() => setIsPauseAllConfirmOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-bold transition-all shadow-2xs cursor-pointer"
            title="Pause every active campaign in this Meta ad account"
          >
            <Pause className="w-3.5 h-3.5 text-red-600" />
            <span>Pause ALL ads</span>
          </button>

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

                  {/* Stats columns or Couldn't load from Meta error notice */}
                  {ad.insightsError ? (
                    <td colSpan={5} className="py-3.5 px-3 text-left">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-red-50 border border-red-200 text-red-800 text-xs font-medium max-w-md shadow-2xs">
                        <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                        <div>
                          <span className="font-bold text-red-900">Couldn't load from Meta: </span>
                          <span className="text-[11px] text-red-700">{ad.insightsError}</span>
                        </div>
                      </div>
                    </td>
                  ) : (
                    <>
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
                              {(ad.impressions ?? 0).toLocaleString()} views
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
                        ${ad.spend.toFixed(2)}
                      </td>

                      {/* CTR */}
                      <td className="py-3.5 px-3 text-right whitespace-nowrap text-slate-700">
                        {ad.ctr.toFixed(2)}%
                      </td>

                      {/* Clicks */}
                      <td className="py-3.5 px-3 text-right whitespace-nowrap text-slate-600">
                        {ad.clicks.toLocaleString()}
                      </td>
                    </>
                  )}

                  {/* One-Click Action Controls */}
                  <td className="py-3.5 px-4 whitespace-nowrap text-center" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-center gap-1">
                      {/* One-Click Pause / Resume (based on configured_status per Requirement 1) */}
                      {(() => {
                        const isConfiguredActive = ad.configuredStatus ? ad.configuredStatus === 'ACTIVE' : ad.status === 'ACTIVE';
                        return (
                          <button
                            onClick={() => onToggleStatus(ad.adId, ad.status, ad.configuredStatus)}
                            disabled={ad.status === 'REJECTED'}
                            title={isConfiguredActive ? 'Pause Ad on Meta' : 'Resume Ad on Meta'}
                            className={`p-1.5 rounded-md border transition-all cursor-pointer ${
                              isConfiguredActive
                                ? 'text-amber-700 bg-amber-50 border-amber-200 hover:bg-amber-100'
                                : 'text-emerald-700 bg-emerald-50 border-emerald-200 hover:bg-emerald-100'
                            }`}
                          >
                            {isConfiguredActive ? (
                              <Pause className="w-3.5 h-3.5" />
                            ) : (
                              <Play className="w-3.5 h-3.5" />
                            )}
                          </button>
                        );
                      })()}

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
            No ad results yet. Click "Create Ad" above to launch a new campaign.
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

      {/* Confirmation Modal for "Pause ALL ads" (Requirement 2) */}
      {isPauseAllConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border border-red-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-2.5 text-red-600 font-bold text-base mb-2">
              <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <span>Pause ALL Active Ads?</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Are you sure you want to pause <strong>every active campaign and ad</strong> in this Meta ad account?
              This will send <code className="bg-slate-100 px-1 py-0.5 rounded text-red-700 font-mono text-[11px]">status=PAUSED</code> to Meta for each active campaign, ad set, and ad immediately, stopping all delivery and spending.
            </p>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-[11px] text-amber-900 mb-5">
              ✓ You can resume individual ads at any time with the Play button.
            </div>
            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                disabled={isPausingAll}
                onClick={() => setIsPauseAllConfirmOpen(false)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isPausingAll}
                onClick={handleExecutePauseAll}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                {isPausingAll ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>Pausing on Meta...</span>
                  </>
                ) : (
                  <>
                    <Pause className="w-3.5 h-3.5" />
                    <span>Yes, Pause ALL Ads</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Results Dialog for Pause ALL ads (Requirement 2) */}
      {pauseAllResults && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-2.5 font-bold text-base mb-2">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                pauseAllResults.failed.length === 0 ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
              }`}>
                {pauseAllResults.failed.length === 0 ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  <AlertCircle className="w-5 h-5" />
                )}
              </div>
              <span className="text-slate-900">Pause ALL Ads – Meta Response</span>
            </div>
            <p className="text-xs text-slate-600 mb-4">
              {pauseAllResults.message}
            </p>

            {/* List of Paused Campaigns */}
            <div className="mb-4">
              <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>Successfully Paused on Meta ({pauseAllResults.paused.length})</span>
                <span className="text-[10px] text-emerald-600 font-semibold">Confirmed</span>
              </div>
              {pauseAllResults.paused.length > 0 ? (
                <div className="max-h-44 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-lg bg-slate-50/50">
                  {pauseAllResults.paused.map((item) => (
                    <div key={item.id} className="p-2.5 text-xs flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <div className="font-semibold text-slate-800 truncate">{item.name}</div>
                        <div className="text-[10px] text-slate-500 font-mono">ID: {item.id}</div>
                      </div>
                      <span className="shrink-0 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                        Paused
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-slate-500 italic p-3 bg-slate-50 rounded-lg border border-slate-200">
                  No active campaigns were found running on Meta.
                </div>
              )}
            </div>

            {/* List of Failed Campaigns if any */}
            {pauseAllResults.failed.length > 0 && (
              <div className="mb-4">
                <div className="text-xs font-bold text-red-700 uppercase tracking-wider mb-2">
                  Failed to Pause ({pauseAllResults.failed.length})
                </div>
                <div className="max-h-36 overflow-y-auto divide-y divide-red-100 border border-red-200 rounded-lg bg-red-50/30">
                  {pauseAllResults.failed.map((item) => (
                    <div key={item.id} className="p-2.5 text-xs">
                      <div className="font-semibold text-red-900 truncate">{item.name}</div>
                      <div className="text-[11px] text-red-700 mt-0.5">{item.error}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setPauseAllResults(null);
                  onRefreshData?.();
                }}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 cursor-pointer transition-colors"
              >
                Close & Refresh
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
