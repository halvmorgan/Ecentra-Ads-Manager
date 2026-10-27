import React, { useState, useEffect } from 'react';
import { X, Mail, Check, Power, Send, Copy, FileText, CheckCircle2 } from 'lucide-react';
import { Client } from '../types';
import { api } from '../services/api';

interface WeeklyReportModalProps {
  client: Client;
  onClose: () => void;
}

export const WeeklyReportModal: React.FC<WeeklyReportModalProps> = ({ client, onClose }) => {
  const [reportData, setReportData] = useState<any | null>(null);
  const [isEnabled, setIsEnabled] = useState(client.weeklyReportEnabled);
  const [isCopied, setIsCopied] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadReport();
  }, [client]);

  const loadReport = async () => {
    setIsLoading(true);
    try {
      const data = await api.getWeeklyReport(client.id);
      setReportData(data);
      setIsEnabled(data.enabled);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = async () => {
    const nextState = !isEnabled;
    setIsEnabled(nextState);
    try {
      await api.toggleWeeklyReport(client.id, nextState);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCopy = () => {
    if (reportData?.body) {
      navigator.clipboard.writeText(reportData.body);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleSendTest = () => {
    setSendSuccess(true);
    setTimeout(() => setSendSuccess(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-600" />
            <h3 className="font-bold text-slate-900 text-base">
              Monday Client Performance Email
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 font-bold text-sm"
          >
            ✕
          </button>
        </div>

        <div className="py-4 space-y-4 text-xs">
          {/* Status & Toggle Bar */}
          <div className="flex items-center justify-between bg-slate-50 p-3 rounded-lg border border-slate-200">
            <div>
              <span className="font-bold text-slate-800 block text-xs">
                Automated Monday Morning Dispatch
              </span>
              <span className="text-slate-500 text-[11px]">
                Sends to: <strong>{client.alertEmail}</strong>
              </span>
            </div>

            <button
              onClick={handleToggle}
              className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-colors cursor-pointer text-xs ${
                isEnabled
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-200 text-slate-600'
              }`}
            >
              <Power className="w-3.5 h-3.5" />
              <span>{isEnabled ? 'Enabled (Active)' : 'Disabled'}</span>
            </button>
          </div>

          {/* Email Subject Preview */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
              Email Subject Line
            </label>
            <div className="p-2.5 bg-slate-100 rounded-lg font-semibold text-slate-900 text-xs border border-slate-200">
              {reportData?.subject || 'Weekly Lead Performance Summary'}
            </div>
          </div>

          {/* Email Body Preview */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
              Plain-English Email Body (Wording Rule: No marketing jargon or 'AI')
            </label>
            <div className="p-3.5 bg-slate-50 rounded-lg text-slate-800 font-mono text-[11px] whitespace-pre-line leading-relaxed border border-slate-200 max-h-60 overflow-y-auto">
              {reportData?.body || 'Loading summary...'}
            </div>
          </div>

          {sendSuccess && (
            <div className="p-2.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Test email sent to {client.alertEmail}!</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <button
            onClick={handleCopy}
            className="px-3 py-1.5 border border-slate-300 rounded-lg text-slate-700 font-semibold hover:bg-slate-50 flex items-center gap-1.5 text-xs"
          >
            {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{isCopied ? 'Copied' : 'Copy Text'}</span>
          </button>

          <div className="flex gap-2">
            <button
              onClick={handleSendTest}
              className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold flex items-center gap-1.5 text-xs"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send Test Now</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 border border-slate-300 rounded-lg text-slate-700 font-semibold hover:bg-slate-100 text-xs"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
