import React, { useState, useEffect } from 'react';
import { 
  Key, 
  ShieldCheck, 
  CheckCircle2, 
  RefreshCw, 
  Facebook, 
  Instagram, 
  Layers, 
  ExternalLink, 
  AlertTriangle,
  Lock,
  Info,
  Activity
} from 'lucide-react';
import { Client, MetaAdAccount, MetaPage } from '../types';
import { api } from '../services/api';
import { ConnectionCheckModal } from './ConnectionCheckModal';

interface MetaSettingsProps {
  clients: Client[];
  liveMode: boolean;
  onToggleLiveMode: (live: boolean) => void;
  onRefreshAll: () => void;
}

export const MetaSettings: React.FC<MetaSettingsProps> = ({
  clients,
  liveMode,
  onToggleLiveMode,
  onRefreshAll,
}) => {
  const [systemUserToken, setSystemUserToken] = useState('');
  const [hasToken, setHasToken] = useState(false);
  const [isTokenVerified, setIsTokenVerified] = useState(false);
  const [tokenVerificationLabel, setTokenVerificationLabel] = useState('');
  const [businessManagerName, setBusinessManagerName] = useState('');
  const [businessManagerId, setBusinessManagerId] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Connection Diagnostics Modal
  const [isConnectionModalOpen, setIsConnectionModalOpen] = useState(false);

  // Meta Resources
  const [adAccounts, setAdAccounts] = useState<MetaAdAccount[]>([]);
  const [pages, setPages] = useState<MetaPage[]>([]);
  const [isLoadingResources, setIsLoadingResources] = useState(false);

  useEffect(() => {
    loadStatus();
    loadResources();
  }, [liveMode]);

  const loadStatus = async () => {
    try {
      const status = await api.getStatus();
      setHasToken(status.hasToken);
      setIsTokenVerified(Boolean(status.isTokenVerified ?? status.hasToken));
      const formattedDate = new Date(status.connectedAt || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      setTokenVerificationLabel(
        status.tokenVerificationLabel || 
        (status.hasToken ? `Token saved - verified ${formattedDate}` : 'No token saved')
      );
      setBusinessManagerName(status.businessManagerName || 'Connected Business Manager');
      setBusinessManagerId(status.businessManagerId || 'Configured via Token');
    } catch (err) {
      console.error(err);
    }
  };

  const loadResources = async () => {
    setIsLoadingResources(true);
    try {
      const res = await api.getMetaResources();
      setAdAccounts(res.adAccounts);
      setPages(res.pages);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingResources(false);
    }
  };

  const handleSaveToken = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!systemUserToken.trim()) return;
    setIsSaving(true);
    setSaveMessage(null);
    try {
      const res = await api.updateMetaToken(systemUserToken, liveMode);
      setSaveMessage({ type: 'success', text: res.message || 'Token stored securely on the server.' });
      setSystemUserToken('');
      await loadStatus();
      await loadResources();
      onRefreshAll();
    } catch (err: any) {
      setSaveMessage({ type: 'error', text: err.message || 'Verification failed.' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto mb-10">
      {/* Title & Connection Check CTA */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            Meta Business Manager & Marketing API Connection
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Agency-level Meta System User authentication. All API calls and credentials stay strictly on the server backend.
          </p>
        </div>

        {/* Test Connection Button (Requirement 7) */}
        <button
          onClick={() => setIsConnectionModalOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
        >
          <Activity className="w-4 h-4" />
          <span>Test Connection</span>
        </button>
      </div>

      {/* Demo vs Live Mode Banner */}
      <div className={`p-4 rounded-xl border flex flex-wrap items-center justify-between gap-3 ${
        liveMode ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
            liveMode ? 'bg-emerald-600 text-white' : 'bg-amber-600 text-white'
          }`}>
            {liveMode ? 'LIVE' : 'DEMO'}
          </div>
          <div>
            <div className="font-bold text-xs text-slate-900">
              Current Mode: {liveMode ? 'Live Meta Production API' : 'Demo Mode (Simulated Data & Accounts)'}
            </div>
            <div className="text-[11px] text-slate-600 mt-0.5">
              {liveMode
                ? 'Connected directly to Meta Graph API v21.0 using your server-stored System User token.'
                : 'Using realistic simulated client data so you can test all features before connecting live credentials.'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsConnectionModalOpen(true)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Diagnostics
          </button>
          <button
            onClick={() => onToggleLiveMode(!liveMode)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-2xs transition-colors cursor-pointer ${
              liveMode
                ? 'bg-slate-900 text-white hover:bg-slate-800'
                : 'bg-amber-600 text-white hover:bg-amber-700'
            }`}
          >
            {liveMode ? 'Switch to Demo Mode' : 'Switch to Live Meta Mode'}
          </button>
        </div>
      </div>

      {/* Server Token Box */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-slate-700" />
            <h3 className="font-bold text-slate-900 text-sm">
              Meta System User Access Token
            </h3>
          </div>
          <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            Server-Side Kept • Never Exposed to Browser
          </span>
        </div>

        <form onSubmit={handleSaveToken} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Paste Meta System User Token
            </label>
            <div className="flex gap-2">
              <input
                type="password"
                value={systemUserToken}
                onChange={(e) => setSystemUserToken(e.target.value)}
                placeholder="EAAG... (paste permanent System User token from Meta Business Manager)"
                className="flex-1 text-xs border border-slate-300 rounded-lg p-2.5 font-mono text-slate-900 focus:ring-2 focus:ring-amber-500/20"
              />
              <button
                type="submit"
                disabled={isSaving || !systemUserToken.trim()}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              >
                {isSaving ? 'Verifying...' : 'Save & Verify Token'}
              </button>
            </div>
            <div className="text-[11px] text-slate-500 mt-1.5 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>
                Required permissions: <code>ads_management</code>, <code>ads_read</code>, <code>business_management</code>, <code>pages_show_list</code>, <code>pages_read_engagement</code>, <code>pages_manage_ads</code>, <code>leads_retrieval</code>, <code>instagram_basic</code>.
              </span>
            </div>
          </div>

          {saveMessage && (
            <div className={`p-3 rounded-lg text-xs font-medium ${
              saveMessage.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {saveMessage.text}
            </div>
          )}
        </form>

        {/* Current Active BM Info */}
        <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <span className="text-slate-500 text-[11px] block">Business Manager:</span>
            <span className="font-semibold text-slate-800">{businessManagerName}</span>
          </div>
          <div>
            <span className="text-slate-500 text-[11px] block">BM ID:</span>
            <span className="font-mono text-slate-700">{businessManagerId}</span>
          </div>
          <div>
            <span className="text-slate-500 text-[11px] block">Token Status:</span>
            {hasToken ? (
              <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-700">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>{tokenVerificationLabel}</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-slate-500 font-medium">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>No token saved</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Reachable Partner Resources */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">
              Reachable Partner Ad Accounts & Assets ({adAccounts.length})
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Client ad accounts and Pages shared to Harold's Business Manager
            </p>
          </div>

          <button
            onClick={loadResources}
            disabled={isLoadingResources}
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingResources ? 'animate-spin text-amber-600' : ''}`} />
            <span>Scan BM Assets</span>
          </button>
        </div>

        {/* Ad Accounts Grid */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wide block">
            Shared Ad Accounts (Client pays Meta with own card)
          </span>
          {adAccounts.length === 0 ? (
            <div className="p-4 text-center text-slate-400 text-xs bg-slate-50 rounded-lg border border-slate-100">
              No ad accounts discovered yet. Save a verified Meta System User token to discover accounts.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {adAccounts.map((acc) => (
                <div key={acc.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-900 truncate">{acc.name}</span>
                    <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded">
                      Active
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono">ID: {acc.id}</div>
                  <div className="text-[11px] text-slate-500">Currency: {acc.currency} (USD)</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Facebook Pages & Instagram Accounts Grid */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wide block">
            Partner Facebook Pages & Instagram Accounts
          </span>
          {pages.length === 0 ? (
            <div className="p-4 text-center text-slate-400 text-xs bg-slate-50 rounded-lg border border-slate-100">
              No Facebook Pages discovered yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {pages.map((p) => (
                <div key={p.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1.5">
                  <div className="flex items-center gap-2">
                    <Facebook className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span className="font-bold text-slate-900 truncate">{p.name}</span>
                  </div>
                  {p.instagramAccount && (
                    <div className="flex items-center gap-2 text-pink-600">
                      <Instagram className="w-3.5 h-3.5 shrink-0" />
                      <span className="font-semibold text-slate-800 truncate">
                        {p.instagramAccount.username}
                      </span>
                    </div>
                  )}
                  <div className="text-[10px] text-slate-400 font-mono">Page ID: {p.id}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Connection Check Modal */}
      <ConnectionCheckModal
        isOpen={isConnectionModalOpen}
        onClose={() => setIsConnectionModalOpen(false)}
        liveMode={liveMode}
      />
    </div>
  );
};
