import React, { useState, useRef } from 'react';
import { 
  Building2, 
  Plus, 
  Edit3, 
  Trash2, 
  MapPin, 
  Phone, 
  Mail, 
  ExternalLink, 
  DollarSign, 
  Target, 
  Send, 
  CheckCircle, 
  Layers, 
  ShieldCheck, 
  Facebook, 
  Instagram,
  FileText,
  Sparkles,
  AlertCircle,
  KeyRound,
  Copy,
  RotateCcw,
  Check,
  Download,
  Upload
} from 'lucide-react';
import { Client, NicheType } from '../types';
import { api } from '../services/api';
import { getNicheLabel, STANDARD_NICHES } from '../utils/niche';

interface ClientManagementProps {
  clients: Client[];
  onRefreshClients: () => void;
  onOpenWeeklyReport: (client: Client) => void;
  onSelectClientForAds: (clientId: string) => void;
  dbError?: string | null;
  isDbPermanent?: boolean;
}

export const ClientManagement: React.FC<ClientManagementProps> = ({
  clients,
  onRefreshClients,
  onOpenWeeklyReport,
  onSelectClientForAds,
  dbError,
  isDbPermanent,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [testLeadModalClient, setTestLeadModalClient] = useState<Client | null>(null);
  const [testLeadFeedback, setTestLeadFeedback] = useState<string | null>(null);
  const [isTestingLead, setIsTestingLead] = useState(false);
  const [copiedClientId, setCopiedClientId] = useState<string | null>(null);
  const [resettingClientId, setResettingClientId] = useState<string | null>(null);

  // Export / Import State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [backupNotice, setBackupNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleExportClients = async () => {
    setIsExporting(true);
    setBackupNotice(null);
    try {
      const data = await api.exportClients();
      const jsonStr = JSON.stringify(data.clients, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ecentra_clients_backup_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setBackupNotice({
        type: 'success',
        text: `Exported ${data.clients.length} client account(s) to JSON backup file successfully.`,
      });
      setTimeout(() => setBackupNotice(null), 5000);
    } catch (err: any) {
      setBackupNotice({
        type: 'error',
        text: 'Export failed: ' + (err.message || 'Unknown error'),
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setBackupNotice(null);
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const text = e.target?.result as string;
        const parsed = JSON.parse(text);
        const clientsToImport = Array.isArray(parsed) ? parsed : parsed.clients;
        if (!Array.isArray(clientsToImport) || clientsToImport.length === 0) {
          throw new Error('No valid client array found in JSON file.');
        }

        const res = await api.importClients(clientsToImport);
        setBackupNotice({
          type: 'success',
          text: res.message || `Restored ${res.count} clients without duplicates.`,
        });
        onRefreshClients();
        setTimeout(() => setBackupNotice(null), 6000);
      } catch (err: any) {
        setBackupNotice({
          type: 'error',
          text: 'Import failed: ' + (err.message || 'Invalid JSON file format'),
        });
      } finally {
        setIsImporting(false);
        if (event.target) event.target.value = '';
      }
    };
    reader.onerror = () => {
      setIsImporting(false);
      setBackupNotice({
        type: 'error',
        text: 'Failed to read the selected backup file.',
      });
      if (event.target) event.target.value = '';
    };
    reader.readAsText(file);
  };

  const handleCopyAccessCode = (client: Client) => {
    if (!client.clientAccessCode) return;
    navigator.clipboard.writeText(client.clientAccessCode);
    setCopiedClientId(client.id);
    setTimeout(() => setCopiedClientId(null), 2000);
  };

  const handleResetAccessCode = async (client: Client) => {
    if (!confirm(`Generate a new 8-character access code for ${client.businessName}? The old code will stop working immediately.`)) {
      return;
    }
    setResettingClientId(client.id);
    try {
      const res = await api.resetClientAccessCode(client.id);
      onRefreshClients();
      setTestLeadFeedback(`Generated new access code for ${client.businessName}: ${res.clientAccessCode}`);
    } catch (err: any) {
      alert(err.message || 'Failed to reset access code');
    } finally {
      setResettingClientId(null);
    }
  };

  // Form State
  const [businessName, setBusinessName] = useState('');
  const [selectedNiche, setSelectedNiche] = useState<string>('med_spa');
  const [customNiche, setCustomNiche] = useState<string>('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('AZ');
  const [radiusMiles, setRadiusMiles] = useState(15);
  const [phone, setPhone] = useState('');
  const [alertEmail, setAlertEmail] = useState('');
  const [alertPhone, setAlertPhone] = useState('');
  const [ghlLocationId, setGhlLocationId] = useState('');
  const [ghlApiKey, setGhlApiKey] = useState('');
  const [adAccountId, setAdAccountId] = useState('');
  const [adAccountName, setAdAccountName] = useState('');
  const [pageId, setPageId] = useState('');
  const [pageName, setPageName] = useState('');
  const [instagramUsername, setInstagramUsername] = useState('');
  const [monthlyBudget, setMonthlyBudget] = useState(2500);
  const [targetCpl, setTargetCpl] = useState(30.00);
  const [isOwnBusiness, setIsOwnBusiness] = useState(false);
  const [notes, setNotes] = useState('');

  const openAddModal = () => {
    setEditingClient(null);
    setBusinessName('');
    setSelectedNiche('med_spa');
    setCustomNiche('');
    setWebsiteUrl('');
    setCity('');
    setState('AZ');
    setRadiusMiles(20);
    setPhone('');
    setAlertEmail('');
    setAlertPhone('');
    setGhlLocationId('');
    setGhlApiKey('');
    setAdAccountId('');
    setAdAccountName('');
    setPageId('');
    setPageName('');
    setInstagramUsername('');
    setMonthlyBudget(2500);
    setTargetCpl(30.00);
    setIsOwnBusiness(false);
    setNotes('');
    setIsModalOpen(true);
  };

  const openEditModal = (c: Client) => {
    setEditingClient(c);
    setBusinessName(c.businessName);
    const standardOption = STANDARD_NICHES.find(opt => opt.value === c.niche && opt.value !== 'other');
    if (standardOption) {
      setSelectedNiche(c.niche);
      setCustomNiche('');
    } else {
      setSelectedNiche('other');
      setCustomNiche(c.niche || '');
    }
    setWebsiteUrl(c.websiteUrl);
    setCity(c.serviceArea.city);
    setState(c.serviceArea.state);
    setRadiusMiles(c.serviceArea.radiusMiles);
    setPhone(c.phone);
    setAlertEmail(c.alertEmail);
    setAlertPhone(c.alertPhone);
    setGhlLocationId(c.ghlConfig.locationId);
    setGhlApiKey('');
    setAdAccountId(c.linkedMeta.adAccountId || '');
    setAdAccountName(c.linkedMeta.adAccountName || '');
    setPageId(c.linkedMeta.pageId || '');
    setPageName(c.linkedMeta.pageName || '');
    setInstagramUsername(c.linkedMeta.instagramUsername || '');
    setMonthlyBudget(c.monthlyBudget);
    setTargetCpl(c.targetCpl || 0);
    setIsOwnBusiness(!!c.isOwnBusiness);
    setNotes(c.notes || '');
    setIsModalOpen(true);
  };

  const handleSaveClient = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const finalNiche = selectedNiche === 'other'
        ? (customNiche.trim() || 'Other')
        : selectedNiche;

      await api.saveClient({
        id: editingClient ? editingClient.id : undefined,
        businessName,
        niche: finalNiche as NicheType,
        isOwnBusiness,
        websiteUrl,
        serviceArea: {
          city,
          state,
          radiusMiles,
        },
        phone,
        alertEmail,
        alertPhone,
        monthlyBudget,
        targetCpl: isOwnBusiness ? (targetCpl || 0) : targetCpl,
        notes,
        ghlConfig: {
          locationId: ghlLocationId,
          apiKey: ghlApiKey,
          syncEnabled: true,
        } as any,
        linkedMeta: {
          adAccountId,
          adAccountName,
          pageId,
          pageName,
          instagramUsername,
        },
      });

      setIsModalOpen(false);
      onRefreshClients();
    } catch (err: any) {
      alert(err.message || 'Failed to save client');
    }
  };

  const handleDeleteClient = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete client ${name}?`)) {
      try {
        await api.deleteClient(id);
        onRefreshClients();
      } catch (err: any) {
        alert(err.message || 'Failed to delete client');
      }
    }
  };

  const handleSimulateLead = async (client: Client) => {
    setIsTestingLead(true);
    setTestLeadFeedback(null);
    try {
      const res = await api.simulateLead({
        clientId: client.id,
        adId: 'ad-1',
        fullName: 'Test Simulated Lead',
        phone: client.alertPhone || '(480) 555-0100',
        email: client.alertEmail || 'lead@example.com',
      });
      setTestLeadFeedback(`Lead created! Dispatched instant SMS to ${client.alertPhone} and tagged GHL contact with "${res.ghlTag}".`);
      onRefreshClients();
    } catch (err: any) {
      setTestLeadFeedback('Failed to simulate lead: ' + err.message);
    } finally {
      setIsTestingLead(false);
    }
  };

  return (
    <div className="space-y-6 mb-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            Client Accounts & Partner Meta Link
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            1–5 core clients. Meta Ad Account, GoHighLevel sub-account, budget & target CPL.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Hidden File Input for Client Backup JSON */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileImport}
            accept=".json,application/json"
            className="hidden"
          />

          <button
            onClick={handleExportClients}
            disabled={isExporting || clients.length === 0}
            className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer disabled:opacity-50"
            title="Download JSON backup file of all clients"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>{isExporting ? 'Exporting...' : 'Export Clients'}</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isImporting}
            className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer disabled:opacity-50"
            title="Restore clients from JSON backup file without creating duplicates"
          >
            <Upload className="w-3.5 h-3.5 text-slate-500" />
            <span>{isImporting ? 'Importing...' : 'Import Clients'}</span>
          </button>

          <button
            onClick={openAddModal}
            className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4 text-amber-400" />
            <span>Add New Client</span>
          </button>
        </div>
      </div>

      {/* Backup Import/Export Status Toast */}
      {backupNotice && (
        <div className={`p-3 rounded-lg text-xs flex items-center justify-between border ${
          backupNotice.type === 'success' 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
            : 'bg-red-50 border-red-200 text-red-900'
        }`}>
          <div className="flex items-center gap-2">
            {backupNotice.type === 'success' ? (
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span>{backupNotice.text}</span>
          </div>
          <button
            onClick={() => setBackupNotice(null)}
            className="text-xs font-bold hover:underline ml-3"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Requirement 5: Clear Red Error Message if Database Cannot Be Reached */}
      {(dbError || isDbPermanent === false) && (
        <div className="bg-red-50 border-2 border-red-300 rounded-xl p-4 text-red-900 shadow-xs flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-red-100 border border-red-200 flex items-center justify-center shrink-0 text-red-600 mt-0.5">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold text-red-950 uppercase tracking-wide">
                Database Connection Error
              </h3>
              <span className="text-[10px] bg-red-200 text-red-900 px-1.5 py-0.5 rounded font-mono font-semibold">
                Permanent Firestore Storage Unreachable
              </span>
            </div>
            <p className="text-xs text-red-800 mt-1 leading-relaxed">
              {dbError || 'Could not verify permanent Cloud Firestore storage. Client records could not be loaded from persistent storage. Never showing an empty client list.'}
            </p>
            <div className="mt-2.5 flex items-center gap-2">
              <button
                onClick={onRefreshClients}
                className="bg-red-600 hover:bg-red-700 text-white text-[11px] font-semibold px-2.5 py-1 rounded-md flex items-center gap-1 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Retry Database Connection</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clients Cards Grid */}
      {clients.length === 0 ? (
        (dbError || isDbPermanent === false) ? (
          <div className="bg-red-50/50 border-2 border-red-200 rounded-xl p-10 text-center space-y-3">
            <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
            <h3 className="text-sm font-bold text-red-900">
              Unable to reach persistent database
            </h3>
            <p className="text-xs text-red-700 max-w-md mx-auto leading-relaxed">
              Your saved client records could not be loaded from Cloud Firestore. We are not displaying an empty list as if you have no clients. Please retry the connection or restore from a JSON backup.
            </p>
            <div className="flex justify-center gap-2 pt-2">
              <button
                onClick={onRefreshClients}
                className="bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retry Connection</span>
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5 text-slate-500" />
                <span>Import Backup</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-xl p-10 text-center space-y-2">
            <Building2 className="w-8 h-8 text-slate-400 mx-auto" />
            <h3 className="text-sm font-bold text-slate-800">No client accounts configured yet</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Add your first client partner or restore from an existing JSON backup file.
            </p>
            <div className="flex justify-center gap-2 pt-2">
              <button
                onClick={openAddModal}
                className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-amber-400" />
                <span>Add Client</span>
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5 text-slate-500" />
                <span>Import Backup</span>
              </button>
            </div>
          </div>
        )
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {clients.map((client) => (
            <div
              key={client.id}
              className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 flex flex-col justify-between hover:shadow-sm transition-all"
            >
            <div>
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900 text-base leading-snug">
                      {client.businessName}
                    </h3>
                    {client.isOwnBusiness && (
                      <span className="text-[10px] font-bold text-amber-900 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-full">
                        ★ Own Business
                      </span>
                    )}
                  </div>
                  <span className="inline-block text-[11px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full mt-1">
                    {getNicheLabel(client.niche)}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(client)}
                    className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
                    title="Edit Client"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteClient(client.id, client.businessName)}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                    title="Delete Client"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Service Area & Phone */}
              <div className="space-y-1.5 text-xs text-slate-600 border-t border-slate-100 pt-3 mb-3">
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>
                    {client.serviceArea.city}, {client.serviceArea.state} ({client.serviceArea.radiusMiles} mi radius)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{client.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{client.alertEmail}</span>
                </div>
              </div>

              {/* Meta & GHL Integration Badges */}
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-[11px] space-y-1.5 mb-3">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 flex items-center gap-1">
                    <Facebook className="w-3 h-3 text-blue-600" />
                    Ad Account:
                  </span>
                  <span className="font-semibold text-slate-800 font-mono truncate max-w-[150px]" title={client.linkedMeta.adAccountId}>
                    {client.linkedMeta.adAccountId || client.linkedMeta.adAccountName || 'Missing ID'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500 flex items-center gap-1">
                    <Facebook className="w-3 h-3 text-blue-600" />
                    Page ID:
                  </span>
                  <span className={`font-semibold font-mono truncate max-w-[150px] ${client.linkedMeta.pageId ? 'text-slate-800' : 'text-amber-600'}`}>
                    {client.linkedMeta.pageId || '⚠ Missing Page ID'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500 flex items-center gap-1">
                    <Instagram className="w-3 h-3 text-pink-600" />
                    Instagram:
                  </span>
                  <span className="font-semibold text-slate-800">
                    {client.linkedMeta.instagramUsername || 'Linked Page'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-purple-600" />
                    GoHighLevel:
                  </span>
                  <span className="font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded">
                    {client.ghlConfig.hasApiKey ? 'Connected (Synced)' : 'Location Linked'}
                  </span>
                </div>
              </div>

              {/* Client Portal Access Code (Random 8-char code) */}
              {!client.isOwnBusiness ? (
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 mb-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider flex items-center gap-1">
                      <KeyRound className="w-3 h-3 text-amber-600" />
                      Client Portal Access Code
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">8-char PIN</span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono font-bold text-slate-900 tracking-wider text-xs bg-white px-2.5 py-1 rounded border border-slate-200 shadow-2xs">
                      {client.clientAccessCode || 'NOT SET'}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleCopyAccessCode(client)}
                        className="px-2 py-1 text-[11px] font-semibold text-slate-700 bg-white hover:bg-slate-100 rounded border border-slate-200 shadow-2xs flex items-center gap-1 transition-colors cursor-pointer"
                        title="Copy access code to clipboard"
                      >
                        {copiedClientId === client.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span className="text-emerald-700 text-[10px]">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3 text-slate-500" />
                            <span className="text-[10px]">Copy</span>
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => handleResetAccessCode(client)}
                        disabled={resettingClientId === client.id}
                        className="px-2 py-1 text-[11px] font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 rounded border border-amber-200 shadow-2xs flex items-center gap-1 transition-colors cursor-pointer"
                        title="Regenerate a new 8-character access code"
                      >
                        <RotateCcw className={`w-3 h-3 text-amber-700 ${resettingClientId === client.id ? 'animate-spin' : ''}`} />
                        <span className="text-[10px]">Reset</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-amber-50/70 border border-amber-200/80 rounded-lg p-2 text-center mb-3">
                  <span className="text-[11px] font-semibold text-amber-900">Internal Agency Business — No Client Portal</span>
                </div>
              )}

              {/* Budget & Target CPL Pill */}
              <div className="grid grid-cols-2 gap-2 text-center bg-slate-900 text-white p-2.5 rounded-lg">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Monthly Budget</span>
                  <span className="text-sm font-bold">${client.monthlyBudget.toLocaleString()}</span>
                </div>
                <div className="border-l border-slate-700">
                  <span className="text-[10px] text-amber-400 uppercase font-semibold block">Target CPL</span>
                  <span className="text-sm font-bold text-amber-400">
                    {client.isOwnBusiness ? 'N/A (Own)' : `$${(client.targetCpl ?? 0).toFixed(2)}`}
                  </span>
                </div>
              </div>
            </div>

            {/* Client Card Bottom Actions */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
              <button
                onClick={() => handleSimulateLead(client)}
                disabled={isTestingLead}
                className="flex-1 py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-semibold text-[11px] flex items-center justify-center gap-1 transition-colors cursor-pointer"
                title="Send test lead into GoHighLevel and verify SMS alert"
              >
                <Send className="w-3 h-3 text-slate-500" />
                <span>Test Lead & SMS</span>
              </button>

              <button
                onClick={() => onOpenWeeklyReport(client)}
                className="py-1.5 px-2.5 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded font-semibold text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
              >
                <FileText className="w-3 h-3" />
                <span>Monday Report</span>
              </button>
            </div>
          </div>
        ))}
      </div>
      )}

      {/* Feedback Toast if test lead run */}
      {testLeadFeedback && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 p-3 rounded-lg text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{testLeadFeedback}</span>
          </div>
          <button
            onClick={() => setTestLeadFeedback(null)}
            className="text-emerald-700 font-bold hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Add / Edit Client Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
              <h3 className="font-bold text-slate-900 text-base">
                {editingClient ? 'Edit Client Setup' : 'Add New Client Setup'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveClient} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Business Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="e.g. Lumina Aesthetics & Med Spa"
                    className="w-full border border-slate-300 rounded-lg p-2 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Service Niche *
                  </label>
                  <select
                    value={selectedNiche}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSelectedNiche(val);
                      if (val !== 'other') {
                        setCustomNiche('');
                      }
                    }}
                    className="w-full border border-slate-300 rounded-lg p-2 font-medium"
                  >
                    <option value="med_spa">Med Spa / Aesthetics</option>
                    <option value="water_mold">Water & Mold Remediation</option>
                    <option value="solar">Solar Energy</option>
                    <option value="remodeling">Home Remodeling</option>
                    <option value="home_services">Home Services</option>
                    <option value="appraisal_real_estate">Real Estate / Appraisal</option>
                    <option value="digital_product">Digital Product / Guide</option>
                    <option value="marketing_business">Marketing / Business Services</option>
                    <option value="other">Other (type your own)</option>
                  </select>

                  {selectedNiche === 'other' && (
                    <div className="mt-2 animate-fade-in">
                      <label className="block font-semibold text-slate-700 mb-1 text-[11px]">
                        Enter niche
                      </label>
                      <input
                        type="text"
                        required
                        value={customNiche}
                        onChange={(e) => setCustomNiche(e.target.value)}
                        placeholder="Type custom niche (e.g. Accounting, Personal Training, Roofing)"
                        className="w-full border border-slate-300 rounded-lg p-2 bg-slate-50 font-medium text-xs focus:bg-white focus:border-amber-500"
                        autoFocus
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Website URL
                  </label>
                  <input
                    type="url"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    placeholder="https://clientwebsite.com"
                    className="w-full border border-slate-300 rounded-lg p-2"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Business Phone
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(480) 555-0192"
                    className="w-full border border-slate-300 rounded-lg p-2"
                  />
                </div>
              </div>

              {/* Service Area */}
              <div className="grid grid-cols-3 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">City</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Scottsdale"
                    className="w-full border border-slate-300 rounded-lg p-2 bg-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">State</label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="AZ"
                    className="w-full border border-slate-300 rounded-lg p-2 bg-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Radius (Miles)</label>
                  <input
                    type="number"
                    value={radiusMiles}
                    onChange={(e) => setRadiusMiles(Number(e.target.value))}
                    className="w-full border border-slate-300 rounded-lg p-2 bg-white"
                  />
                </div>
              </div>

              {/* Business Ownership Type */}
              <div className="bg-amber-50/60 p-3 rounded-lg border border-amber-200">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isOwnBusiness}
                    onChange={(e) => setIsOwnBusiness(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-amber-300"
                  />
                  <span className="text-xs font-bold text-amber-950">
                    This is Harold's Own Business / Product (e.g. eCentury Appraisal Services)
                  </span>
                </label>
                <p className="text-[11px] text-amber-800 ml-6 mt-0.5">
                  Internal products don't require a client portal login or a target cost per lead.
                </p>
              </div>

              {/* Budget & Target CPL */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Monthly Ad Budget ($ USD)
                  </label>
                  <input
                    type="number"
                    value={monthlyBudget}
                    onChange={(e) => setMonthlyBudget(Number(e.target.value))}
                    className="w-full border border-slate-300 rounded-lg p-2 font-bold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    TARGET COST PER LEAD ($ USD) {isOwnBusiness ? '(Optional)' : '*'}
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    disabled={isOwnBusiness}
                    value={isOwnBusiness ? 0 : targetCpl}
                    onChange={(e) => setTargetCpl(Number(e.target.value))}
                    className={`w-full border rounded-lg p-2 font-bold ${
                      isOwnBusiness
                        ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                        : 'border-amber-300 bg-amber-50/50 text-amber-900'
                    }`}
                  />
                  <span className="text-[10px] text-slate-500">
                    {isOwnBusiness ? 'N/A for own business' : 'Flags ads in red if 7-day CPL exceeds this.'}
                  </span>
                </div>
              </div>

              {/* Alerts & GoHighLevel */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Lead Alert Email
                  </label>
                  <input
                    type="email"
                    value={alertEmail}
                    onChange={(e) => setAlertEmail(e.target.value)}
                    placeholder="leads@client.com"
                    className="w-full border border-slate-300 rounded-lg p-2"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Lead Alert Phone (SMS)
                  </label>
                  <input
                    type="text"
                    value={alertPhone}
                    onChange={(e) => setAlertPhone(e.target.value)}
                    placeholder="(480) 555-0199"
                    className="w-full border border-slate-300 rounded-lg p-2"
                  />
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2">
                <span className="font-bold text-slate-800 block text-[11px] uppercase">
                  GoHighLevel Sub-Account Setup (Server-Side Kept)
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-600 mb-1">Location ID</label>
                    <input
                      type="text"
                      value={ghlLocationId}
                      onChange={(e) => setGhlLocationId(e.target.value)}
                      placeholder="loc_xxxxxxxx"
                      className="w-full border border-slate-300 rounded-lg p-1.5 bg-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-600 mb-1">
                      API Key (Server Stored)
                    </label>
                    <input
                      type="password"
                      value={ghlApiKey}
                      onChange={(e) => setGhlApiKey(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full border border-slate-300 rounded-lg p-1.5 bg-white text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Linked Meta Business Manager Asset IDs */}
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-3">
                <span className="font-bold text-slate-800 block text-[11px] uppercase">
                  Linked Meta Business Manager Assets
                </span>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1 text-xs">
                      Meta Ad Account ID *
                    </label>
                    <input
                      type="text"
                      required
                      value={adAccountId}
                      onChange={(e) => {
                        const val = e.target.value;
                        setAdAccountId(val);
                        if (!adAccountName) setAdAccountName(val);
                      }}
                      placeholder="e.g. act_25581724204862372 or 25581724204862372"
                      className="w-full border border-slate-300 rounded-lg p-2 bg-white text-xs font-mono font-medium"
                    />
                    <span className="text-[10px] text-slate-500">
                      Ad account shared to your Business Manager
                    </span>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1 text-xs">
                      Facebook Page ID *
                    </label>
                    <input
                      type="text"
                      required
                      value={pageId}
                      onChange={(e) => setPageId(e.target.value)}
                      placeholder="e.g. 102948192039481"
                      className="w-full border border-slate-300 rounded-lg p-2 bg-white text-xs font-mono font-medium"
                    />
                    <span className="text-[10px] text-amber-800 font-medium">
                      The ad posts from this Page (Required)
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1 text-xs">
                      Ad Account Display Name
                    </label>
                    <input
                      type="text"
                      value={adAccountName}
                      onChange={(e) => setAdAccountName(e.target.value)}
                      placeholder="e.g. Client Ad Account Name"
                      className="w-full border border-slate-300 rounded-lg p-2 bg-white text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1 text-xs">
                      Instagram Handle
                    </label>
                    <input
                      type="text"
                      value={instagramUsername}
                      onChange={(e) => setInstagramUsername(e.target.value)}
                      placeholder="@client.business"
                      className="w-full border border-slate-300 rounded-lg p-2 bg-white text-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800"
                >
                  Save Client
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
