import React, { useState } from 'react';
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
  AlertCircle
} from 'lucide-react';
import { Client, NicheType } from '../types';
import { api } from '../services/api';

interface ClientManagementProps {
  clients: Client[];
  onRefreshClients: () => void;
  onOpenWeeklyReport: (client: Client) => void;
  onSelectClientForAds: (clientId: string) => void;
}

export const ClientManagement: React.FC<ClientManagementProps> = ({
  clients,
  onRefreshClients,
  onOpenWeeklyReport,
  onSelectClientForAds,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [testLeadModalClient, setTestLeadModalClient] = useState<Client | null>(null);
  const [testLeadFeedback, setTestLeadFeedback] = useState<string | null>(null);
  const [isTestingLead, setIsTestingLead] = useState(false);

  // Form State
  const [businessName, setBusinessName] = useState('');
  const [niche, setNiche] = useState<NicheType>('med_spa');
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
  const [notes, setNotes] = useState('');

  const openAddModal = () => {
    setEditingClient(null);
    setBusinessName('');
    setNiche('med_spa');
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
    setNotes('');
    setIsModalOpen(true);
  };

  const openEditModal = (c: Client) => {
    setEditingClient(c);
    setBusinessName(c.businessName);
    setNiche(c.niche);
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
    setTargetCpl(c.targetCpl);
    setNotes(c.notes || '');
    setIsModalOpen(true);
  };

  const handleSaveClient = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.saveClient({
        id: editingClient ? editingClient.id : undefined,
        businessName,
        niche,
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
        targetCpl,
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

  const getNicheLabel = (n: NicheType) => {
    switch (n) {
      case 'med_spa': return 'Med Spa / Aesthetics';
      case 'water_mold': return 'Water & Mold Remediation';
      case 'solar': return 'Solar Energy';
      case 'remodeling': return 'Home Remodeling';
      case 'home_services': return 'Home Services';
      default: return 'Local Service';
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

        <button
          onClick={openAddModal}
          className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4 text-amber-400" />
          <span>Add New Client</span>
        </button>
      </div>

      {/* Clients Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {clients.map((client) => (
          <div
            key={client.id}
            className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 flex flex-col justify-between hover:shadow-sm transition-all"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <h3 className="font-bold text-slate-900 text-base leading-snug">
                    {client.businessName}
                  </h3>
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
                  <span className="font-semibold text-slate-800 truncate max-w-[140px]">
                    {client.linkedMeta.adAccountName || 'Direct BM Partner'}
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

              {/* Budget & Target CPL Pill */}
              <div className="grid grid-cols-2 gap-2 text-center bg-slate-900 text-white p-2.5 rounded-lg">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Monthly Budget</span>
                  <span className="text-sm font-bold">${client.monthlyBudget.toLocaleString()}</span>
                </div>
                <div className="border-l border-slate-700">
                  <span className="text-[10px] text-amber-400 uppercase font-semibold block">Target CPL</span>
                  <span className="text-sm font-bold text-amber-400">${client.targetCpl.toFixed(2)}</span>
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
                    value={niche}
                    onChange={(e) => setNiche(e.target.value as NicheType)}
                    className="w-full border border-slate-300 rounded-lg p-2 font-medium"
                  >
                    <option value="med_spa">Med Spa / Aesthetics</option>
                    <option value="water_mold">Water & Mold Remediation</option>
                    <option value="solar">Solar Energy</option>
                    <option value="remodeling">Home Remodeling</option>
                    <option value="home_services">Home Services</option>
                  </select>
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
                    TARGET COST PER LEAD ($ USD) *
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={targetCpl}
                    onChange={(e) => setTargetCpl(Number(e.target.value))}
                    className="w-full border border-amber-300 bg-amber-50/50 rounded-lg p-2 font-bold text-amber-900"
                  />
                  <span className="text-[10px] text-slate-500">Flags ads in red if 7-day CPL exceeds this.</span>
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
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Linked Meta Ad Account Name / ID
                  </label>
                  <input
                    type="text"
                    value={adAccountName}
                    onChange={(e) => setAdAccountName(e.target.value)}
                    placeholder="Client Ad Account (act_...)"
                    className="w-full border border-slate-300 rounded-lg p-2"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Instagram Handle
                  </label>
                  <input
                    type="text"
                    value={instagramUsername}
                    onChange={(e) => setInstagramUsername(e.target.value)}
                    placeholder="@client.business"
                    className="w-full border border-slate-300 rounded-lg p-2"
                  />
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
