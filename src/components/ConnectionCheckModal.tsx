import React, { useState, useEffect } from 'react';
import { 
  X, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  RefreshCw, 
  ExternalLink, 
  ShieldCheck, 
  Info,
  Layers
} from 'lucide-react';
import { ConnectionCheckStep } from '../types';
import { api } from '../services/api';

interface ConnectionCheckModalProps {
  isOpen: boolean;
  onClose: () => void;
  liveMode: boolean;
}

export const ConnectionCheckModal: React.FC<ConnectionCheckModalProps> = ({
  isOpen,
  onClose,
  liveMode,
}) => {
  const [steps, setSteps] = useState<ConnectionCheckStep[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [overallSuccess, setOverallSuccess] = useState<boolean | null>(null);

  useEffect(() => {
    if (isOpen) {
      runCheck();
    }
  }, [isOpen]);

  const runCheck = async () => {
    setIsRunning(true);
    setOverallSuccess(null);
    try {
      const res = await api.testConnection();
      setSteps(res.steps || []);
      setOverallSuccess(res.success);
    } catch (err: any) {
      setSteps([
        {
          id: 'error',
          title: 'Connection Diagnostics Error',
          status: 'failed',
          message: err.message || 'Unable to execute Meta API tests',
          fix: 'Please verify server network connection and Meta token syntax.',
        }
      ]);
      setOverallSuccess(false);
    } finally {
      setIsRunning(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Meta Marketing API Connection Test
              </h3>
              <p className="text-[11px] text-slate-500">
                End-to-end verification of permissions, ad accounts, payment cards & Lead Ads TOS
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 font-bold text-sm cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Diagnostic Steps List */}
        <div className="py-4 overflow-y-auto space-y-3 flex-1">
          {isRunning ? (
            <div className="py-12 text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-amber-600 animate-spin mx-auto" />
              <div className="text-sm font-semibold text-slate-900">
                Testing Meta Graph API connection...
              </div>
              <p className="text-xs text-slate-500">
                Checking token permissions, client ad accounts, cards on file, and Page terms.
              </p>
            </div>
          ) : (
            steps.map((step, idx) => (
              <div
                key={step.id || idx}
                className={`p-3.5 rounded-xl border transition-all ${
                  step.status === 'success'
                    ? 'bg-emerald-50/50 border-emerald-200'
                    : step.status === 'warning'
                    ? 'bg-amber-50/60 border-amber-200'
                    : 'bg-red-50/60 border-red-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="shrink-0 mt-0.5">
                    {step.status === 'success' && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    )}
                    {step.status === 'warning' && (
                      <AlertTriangle className="w-5 h-5 text-amber-600" />
                    )}
                    {step.status === 'failed' && (
                      <XCircle className="w-5 h-5 text-red-600" />
                    )}
                  </div>

                  <div className="flex-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-sm">
                        {idx + 1}. {step.title}
                      </span>
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                          step.status === 'success'
                            ? 'bg-emerald-100 text-emerald-800'
                            : step.status === 'warning'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {step.status}
                      </span>
                    </div>

                    <p className="text-slate-700 mt-1 font-medium leading-relaxed">
                      {step.message}
                    </p>

                    {step.details && (
                      <div className="mt-1.5 text-[11px] text-slate-500 font-mono bg-white/70 p-2 rounded border border-slate-200">
                        {step.details}
                      </div>
                    )}

                    {step.fix && (
                      <div className="mt-2.5 bg-white p-2.5 rounded-lg border border-slate-200 text-slate-800 space-y-1">
                        <div className="font-bold text-slate-900 flex items-center gap-1 text-[11px]">
                          <span>Fix Required:</span>
                        </div>
                        <p className="text-slate-600 text-[11px]">{step.fix}</p>
                        {step.fixUrl && (
                          <a
                            href={step.fixUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-amber-700 hover:text-amber-800 font-bold text-[11px] underline mt-1"
                          >
                            <span>Open in Meta Business Manager</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={runCheck}
            disabled={isRunning}
            className="px-3.5 py-1.5 border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold rounded-lg text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin' : ''}`} />
            <span>Re-Test Connection</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg text-xs transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
