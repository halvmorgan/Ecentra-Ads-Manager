import React from 'react';
import { AlertTriangle, AlertCircle, ArrowRight, Pause, DollarSign, X } from 'lucide-react';

interface AttentionItem {
  type: string;
  title: string;
  clientName: string;
  clientId: string;
  adId?: string;
  currentCpl: number;
  targetCpl: number;
  diff: number;
  actionNeeded: string;
}

interface AttentionPanelProps {
  items: AttentionItem[];
  onPauseAd?: (adId: string) => void;
  onEditAd?: (adId: string) => void;
  onAdjustBudget?: (adId: string) => void;
}

export const AttentionPanel: React.FC<AttentionPanelProps> = ({
  items,
  onPauseAd,
  onEditAd,
  onAdjustBudget,
}) => {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div className="bg-red-50/80 border-l-4 border-red-500 rounded-r-xl p-4 mb-6 shadow-xs">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600 shrink-0">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-red-950 text-sm">
                Needs Attention ({items.length})
              </h3>
              <span className="text-[11px] font-medium bg-red-200/80 text-red-800 px-2 py-0.5 rounded-full">
                7-Day Threshold & Policy Check
              </span>
            </div>
            <p className="text-xs text-red-700 mt-0.5">
              Ads exceeding target Cost Per Lead or flagged by Meta policies require Harold's review.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {items.map((item, idx) => {
          const isRejected = item.type === 'REJECTED_AD';
          return (
            <div
              key={idx}
              className="bg-white rounded-lg p-3 border border-red-200 shadow-2xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-800 truncate">
                    {item.clientName}
                  </span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${
                    isRejected ? 'bg-red-600 text-white' : 'bg-red-100 text-red-700'
                  }`}>
                    {isRejected ? 'Meta Rejected' : 'CPL Above Target'}
                  </span>
                </div>

                <div className="text-xs font-medium text-slate-900 line-clamp-1 mb-1">
                  {item.title}
                </div>

                {!isRejected ? (
                  <div className="flex items-center gap-2 text-xs text-slate-600 my-1.5 bg-slate-50 p-2 rounded border border-slate-100">
                    <div>
                      <span className="text-[10px] text-slate-500 block">Current CPL</span>
                      <span className="font-bold text-red-600 text-sm">
                        ${item.currentCpl.toFixed(2)}
                      </span>
                    </div>
                    <span className="text-slate-300 font-light">vs</span>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Target CPL</span>
                      <span className="font-semibold text-slate-700 text-sm">
                        ${item.targetCpl.toFixed(2)}
                      </span>
                    </div>
                    <div className="ml-auto text-right">
                      <span className="text-[10px] text-red-500 font-bold block">
                        +${item.diff.toFixed(2)} over
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="text-[11px] text-red-700 bg-red-50/50 p-2 rounded border border-red-100 my-1.5 line-clamp-2">
                    {item.actionNeeded}
                  </div>
                )}
              </div>

              {/* Quick Action Buttons */}
              <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-100 text-xs">
                {item.adId && onPauseAd && (
                  <button
                    onClick={() => onPauseAd(item.adId!)}
                    className="flex-1 py-1 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded text-[11px] flex items-center justify-center gap-1 transition-colors"
                  >
                    <Pause className="w-3 h-3" />
                    Pause Ad
                  </button>
                )}
                {item.adId && onAdjustBudget && (
                  <button
                    onClick={() => onAdjustBudget(item.adId!)}
                    className="flex-1 py-1 px-2 bg-amber-50 hover:bg-amber-100 text-amber-800 font-medium rounded text-[11px] flex items-center justify-center gap-1 transition-colors"
                  >
                    <DollarSign className="w-3 h-3" />
                    Adjust Budget
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
