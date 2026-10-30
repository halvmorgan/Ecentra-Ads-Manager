import React, { useState, useEffect } from 'react';
import { 
  X, 
  Play, 
  Pause, 
  Copy, 
  Archive, 
  Trash2, 
  Edit3, 
  AlertTriangle, 
  ExternalLink, 
  Calendar, 
  DollarSign, 
  Users, 
  Target, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  Smartphone, 
  ShieldCheck,
  FileText,
  Phone,
  Mail,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { AdDetailData, AdStatus, Client } from '../types';
import { api } from '../services/api';

interface AdDetailModalProps {
  adId: string;
  isOpen: boolean;
  onClose: () => void;
  onOpenEdit: (adDetail: AdDetailData) => void;
  onToggleStatus: (adId: string, currentStatus: AdStatus) => void;
  onDuplicate: (adId: string) => void;
  onArchive: (adId: string) => void;
  onDeleteSuccess: () => void;
}

export const AdDetailModal: React.FC<AdDetailModalProps> = ({
  adId,
  isOpen,
  onClose,
  onOpenEdit,
  onToggleStatus,
  onDuplicate,
  onArchive,
  onDeleteSuccess,
}) => {
  const [data, setData] = useState<AdDetailData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [activePlatformPreview, setActivePlatformPreview] = useState<'phone' | 'meta_html'>('phone');

  useEffect(() => {
    if (isOpen && adId) {
      loadAdDetail();
    }
  }, [isOpen, adId]);

  const loadAdDetail = async () => {
    setIsLoading(true);
    try {
      const res = await api.getAdDetail(adId);
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await api.deleteAd(adId);
      onDeleteSuccess();
      onClose();
    } catch (err: any) {
      alert(err.message || 'Failed to delete ad');
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  if (!isOpen) return null;

  const ad = data?.ad;
  const stats = data?.stats;
  const client = data?.client;
  const adSet = data?.adSet;
  const campaign = data?.campaign;

  const isCplGood = stats ? stats.cpl <= stats.targetCpl : true;

  const getStatusBadge = (status?: string, effectiveStatus?: string) => {
    const st = effectiveStatus || status || 'PAUSED';
    switch (st) {
      case 'ACTIVE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Active Delivering
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
            Meta Reviewing
          </span>
        );
      case 'LEARNING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">
            <Sparkles className="w-3 h-3 text-purple-600" />
            Learning Phase
          </span>
        );
      case 'LIMITED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
            <AlertTriangle className="w-3 h-3 text-amber-600" />
            Learning Limited
          </span>
        );
      case 'REJECTED':
      case 'DISAPPROVED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800">
            Policy Disapproved
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-3 sm:p-6 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-5xl w-full shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[94vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">
                  {ad?.name || 'Ad Details'}
                </h2>
                {getStatusBadge(ad?.status, ad?.effectiveStatus)}
              </div>
              <p className="text-[11px] text-slate-400">
                {client?.businessName} • Ad Account: <span className="font-mono text-slate-300">{client?.linkedMeta.adAccountId || 'Meta BM'}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Edit Button */}
            {data && (
              <button
                onClick={() => onOpenEdit(data)}
                className="bg-amber-600 hover:bg-amber-700 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Ad</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1.5 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Action Controls Toolbar */}
        {data && (
          <div className="bg-slate-50 px-6 py-2.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <button
                onClick={() => onToggleStatus(ad!.id, ad!.status)}
                className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 border transition-colors cursor-pointer ${
                  ad?.status === 'ACTIVE'
                    ? 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                    : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                }`}
              >
                {ad?.status === 'ACTIVE' ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{ad?.status === 'ACTIVE' ? 'Pause Ad' : 'Resume Ad'}</span>
              </button>

              <button
                onClick={() => onDuplicate(ad!.id)}
                className="px-3 py-1.5 rounded-lg font-semibold bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Duplicate to Test</span>
              </button>

              <button
                onClick={() => onArchive(ad!.id)}
                className="px-3 py-1.5 rounded-lg font-semibold bg-white border border-slate-300 text-slate-600 hover:bg-slate-50 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Archive className="w-3.5 h-3.5" />
                <span>Archive</span>
              </button>
            </div>

            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="px-3 py-1.5 rounded-lg font-semibold text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Ad</span>
            </button>
          </div>
        )}

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {isLoading ? (
            <div className="py-16 text-center space-y-2">
              <RefreshCw className="w-8 h-8 text-amber-600 animate-spin mx-auto" />
              <div className="text-xs text-slate-500 font-semibold">Loading real Meta insights & creative...</div>
            </div>
          ) : data ? (
            <>
              {/* Meta Policy Alert if Rejected */}
              {ad?.rejectionReason && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl text-xs space-y-1">
                  <div className="font-bold text-red-900 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    <span>Meta Advertising Policy Notice</span>
                  </div>
                  <p className="text-red-700 leading-relaxed">
                    {ad.rejectionReason}
                  </p>
                  <div className="text-[11px] text-red-600 pt-1">
                    Click "Edit Ad" above to replace the image or revise copy wording.
                  </div>
                </div>
              )}

              {/* Top Hero Performance Cards for this Ad */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">
                    {ad?.goalType === 'TRAFFIC_WEBSITE' ? 'Cost Per Click (CPC)' : 'Cost Per Lead'}
                  </span>
                  <div className="text-xl font-extrabold text-slate-900 mt-0.5">
                    ${ad?.goalType === 'TRAFFIC_WEBSITE'
                      ? (stats?.cpc || (stats?.clicks ? stats.spend / stats.clicks : 0)).toFixed(2)
                      : stats?.cpl.toFixed(2)}
                  </div>
                  <span className={`text-[10px] font-semibold mt-1 inline-block ${
                    client?.isOwnBusiness || ad?.goalType === 'TRAFFIC_WEBSITE'
                      ? 'text-blue-700'
                      : isCplGood ? 'text-emerald-700' : 'text-red-600'
                  }`}>
                    {ad?.goalType === 'TRAFFIC_WEBSITE'
                      ? 'Website Traffic Optimization'
                      : client?.isOwnBusiness
                      ? 'Internal Agency Asset'
                      : `Target: $${stats?.targetCpl.toFixed(2)}`}
                  </span>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">
                    {ad?.goalType === 'TRAFFIC_WEBSITE' ? 'Link Clicks / Views' : 'Total Leads'}
                  </span>
                  <div className="text-xl font-extrabold text-slate-900 mt-0.5">
                    {ad?.goalType === 'TRAFFIC_WEBSITE'
                      ? `${stats?.clicks.toLocaleString()}`
                      : stats?.leads}
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1 inline-block">
                    {ad?.goalType === 'TRAFFIC_WEBSITE'
                      ? `${(stats?.impressions ?? 0).toLocaleString()} views (impressions)`
                      : 'Verified Form Submissions'}
                  </span>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Ad Spend</span>
                  <div className="text-xl font-extrabold text-slate-900 mt-0.5">
                    ${stats?.spend.toLocaleString()}
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1 inline-block">
                    Daily Budget: ${adSet?.dailyBudget}/day
                  </span>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Click-Through (CTR)</span>
                  <div className="text-xl font-extrabold text-slate-900 mt-0.5">
                    {stats?.ctr.toFixed(2)}%
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1 inline-block">
                    {stats?.clicks.toLocaleString()} link clicks
                  </span>
                </div>
              </div>

              {/* Two Column Layout: Creative Preview + Details */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Column: Phone Style Ad Preview */}
                <div className="lg:col-span-5 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800">Ad Creative Preview</span>
                    {data.previewHtml && (
                      <div className="flex gap-1 text-[11px]">
                        <button
                          onClick={() => setActivePlatformPreview('phone')}
                          className={`px-2 py-0.5 rounded font-semibold ${
                            activePlatformPreview === 'phone' ? 'bg-slate-900 text-white' : 'text-slate-600'
                          }`}
                        >
                          Mockup
                        </button>
                        <button
                          onClick={() => setActivePlatformPreview('meta_html')}
                          className={`px-2 py-0.5 rounded font-semibold ${
                            activePlatformPreview === 'meta_html' ? 'bg-slate-900 text-white' : 'text-slate-600'
                          }`}
                        >
                          Meta Render
                        </button>
                      </div>
                    )}
                  </div>

                  {activePlatformPreview === 'meta_html' && data.previewHtml ? (
                    <div
                      className="border border-slate-200 rounded-xl overflow-hidden p-2 bg-white"
                      dangerouslySetInnerHTML={{ __html: data.previewHtml }}
                    />
                  ) : (
                    <div className="bg-slate-900 rounded-[30px] p-2.5 shadow-xl border-4 border-slate-800 text-slate-900 text-xs">
                      <div className="bg-white rounded-[22px] overflow-hidden">
                        {/* Header */}
                        <div className="p-3 flex items-center justify-between border-b border-slate-50">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-slate-900 text-amber-400 flex items-center justify-center font-bold text-xs">
                              {client?.businessName.charAt(0) || 'E'}
                            </div>
                            <div>
                              <div className="font-bold text-xs leading-tight">{client?.businessName}</div>
                              <div className="text-[10px] text-slate-500">Sponsored • Local</div>
                            </div>
                          </div>
                          <span className="text-slate-400 text-xs font-bold">•••</span>
                        </div>

                        {/* Primary Text */}
                        <div className="px-3 py-2 text-xs text-slate-800 leading-relaxed font-normal">
                          {ad?.primaryText}
                        </div>

                        {/* Image */}
                        <div className="w-full aspect-square bg-slate-100 overflow-hidden">
                          <img
                            src={ad?.imageUrl}
                            alt="creative"
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Footer CTA */}
                        <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                          <div className="min-w-0 pr-2">
                            <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider truncate">
                              {client?.websiteUrl?.replace('https://', '') || 'local-offer.com'}
                            </div>
                            <div className="font-bold text-xs text-slate-900 truncate">
                              {ad?.headline}
                            </div>
                            <div className="text-[10px] text-slate-500 truncate">
                              {ad?.description}
                            </div>
                          </div>
                          <button className="bg-slate-900 text-white px-3 py-1.5 rounded-lg text-xs font-bold shrink-0">
                            {ad?.callToAction.replace('_', ' ')}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Column: Settings & Targeting Specs */}
                <div className="lg:col-span-7 space-y-4">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 text-xs">
                    <span className="font-bold text-slate-900 text-xs uppercase tracking-wide block">
                      Targeting & Placement Specifications
                    </span>

                    <div className="grid grid-cols-2 gap-3 text-slate-700">
                      <div>
                        <span className="text-[11px] text-slate-500 block">Service Area Radius:</span>
                        <span className="font-semibold">{adSet?.targeting.city} ({adSet?.targeting.radiusMiles} miles)</span>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-500 block">Age Demographic:</span>
                        <span className="font-semibold">{adSet?.targeting.minAge} – {adSet?.targeting.maxAge} years old</span>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-500 block">Daily Budget:</span>
                        <span className="font-bold text-slate-900">${adSet?.dailyBudget} / day (${(adSet ? adSet.dailyBudget * 30 : 0).toLocaleString()} / mo)</span>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-500 block">Placements:</span>
                        <span className="font-semibold text-emerald-700">Facebook & Instagram (Feeds + Reels)</span>
                      </div>
                    </div>

                    <div className="border-t border-slate-200 pt-2 text-[11px] text-slate-500 space-y-1">
                      <div className="flex justify-between">
                        <span>Meta Ad ID:</span>
                        <span className="font-mono text-slate-700">{ad?.metaAdId || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Creative ID:</span>
                        <span className="font-mono text-slate-700">{ad?.metaCreativeId || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Instant Form ID:</span>
                        <span className="font-mono text-slate-700">{ad?.formId || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Daily Trend for this specific ad */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-slate-900 text-xs">7-Day Trajectory for this Ad</span>
                      <span className="text-[11px] text-slate-500">Spend vs Leads</span>
                    </div>

                    <div className="h-28 flex items-end gap-2 pt-2 px-1">
                      {data.dailyInsights.map((day, idx) => (
                        <div key={idx} className="flex-1 flex flex-col items-center justify-end h-full group relative">
                          <div className="w-full max-w-[16px] bg-slate-800 rounded-t h-full max-h-[85%]" style={{ height: `${Math.min(100, (day.spend / 100) * 100)}%` }}></div>
                          <span className="text-[9px] text-slate-400 mt-1">{day.date.split(' ')[1] || day.date}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Leads specifically generated by this ad */}
              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">
                      Leads Generated by this Creative ({data.leads.length})
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Dispatched instantly to {client?.businessName}'s GoHighLevel sub-account
                    </p>
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Auto-Tagged in GHL
                  </span>
                </div>

                <div className="overflow-x-auto text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase font-semibold">
                      <tr>
                        <th className="p-2">Name</th>
                        <th className="p-2">Phone</th>
                        <th className="p-2">Email</th>
                        <th className="p-2">Submitted</th>
                        <th className="p-2">GHL Tag</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {data.leads.map((l) => (
                        <tr key={l.id} className="hover:bg-slate-50">
                          <td className="p-2 font-bold text-slate-900">{l.fullName}</td>
                          <td className="p-2 text-slate-700">{l.phone}</td>
                          <td className="p-2 text-slate-600">{l.email}</td>
                          <td className="p-2 text-slate-500">{new Date(l.submittedAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                          <td className="p-2">
                            <span className="bg-amber-50 text-amber-900 px-1.5 py-0.5 rounded text-[10px] font-mono border border-amber-200">
                              FB Ad – {ad?.name}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {data.leads.length === 0 && (
                        <tr>
                          <td colSpan={5} className="p-4 text-center text-slate-400 text-xs">
                            No verified leads recorded for this specific ad yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : null}
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 p-4">
            <div className="bg-white rounded-xl max-w-sm w-full p-5 shadow-2xl border border-red-200 text-xs space-y-3">
              <div className="font-bold text-red-600 text-sm flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" />
                <span>Confirm Permanent Deletion</span>
              </div>
              <p className="text-slate-700 leading-relaxed">
                Are you sure you want to permanently delete <strong>"{ad?.name}"</strong>? If active, it will also be deleted from Meta.
              </p>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-3 py-1.5 border border-slate-300 rounded-lg text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold"
                >
                  {isDeleting ? 'Deleting...' : 'Yes, Delete Ad'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
