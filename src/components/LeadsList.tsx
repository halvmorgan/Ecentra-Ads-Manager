import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Send, 
  CheckCircle2, 
  Clock, 
  Phone, 
  Mail, 
  Tag, 
  ChevronDown, 
  ChevronUp, 
  ExternalLink,
  ShieldCheck,
  Sparkles,
  RefreshCw,
  AlertCircle,
  FileSpreadsheet
} from 'lucide-react';
import { LeadRecord, Client, LeadDispatchLog } from '../types';
import { api } from '../services/api';

interface LeadsListProps {
  leads: LeadRecord[];
  clients: Client[];
  selectedClientId: string;
  onRefreshLeads: () => void;
}

export const LeadsList: React.FC<LeadsListProps> = ({
  leads,
  clients,
  selectedClientId,
  onRefreshLeads,
}) => {
  const [expandedLeadId, setExpandedLeadId] = useState<string | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [isSyncingLeads, setIsSyncingLeads] = useState(false);
  const [simulationToast, setSimulationToast] = useState<string | null>(null);
  const [leadLogs, setLeadLogs] = useState<LeadDispatchLog[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);

  const filteredLeads = selectedClientId && selectedClientId !== 'all'
    ? leads.filter((l) => l.clientId === selectedClientId)
    : leads;

  const loadLeadLogs = async () => {
    setIsLoadingLogs(true);
    try {
      const logs = await api.getLeadLogs();
      setLeadLogs(logs);
    } catch (e) {
      console.warn('Failed to load lead logs:', e);
    } finally {
      setIsLoadingLogs(false);
    }
  };

  useEffect(() => {
    loadLeadLogs();
  }, [selectedClientId]);

  // PROBLEM 3: "Sync leads now" button that pulls all leads from the last 30 days from each form
  // and creates any that are missing in GoHighLevel, without making duplicates (match on email).
  const handleSyncLeadsNow = async () => {
    setIsSyncingLeads(true);
    setSimulationToast(null);
    try {
      const res = await api.syncLeadsNow();
      setSimulationToast(res.message || `Sync completed. ${res.syncedCount} new lead(s) dispatched to GoHighLevel.`);
      onRefreshLeads();
      await loadLeadLogs();
    } catch (err: any) {
      alert(`Sync failed: ${err.message}`);
    } finally {
      setIsSyncingLeads(false);
    }
  };

  const handleSimulateNewLead = async () => {
    setIsSimulating(true);
    setSimulationToast(null);
    try {
      const targetClient = (selectedClientId && selectedClientId !== 'all')
        ? clients.find(c => c.id === selectedClientId)
        : clients[0];

      if (!targetClient) {
        setSimulationToast('Please add or select a client before testing leads.');
        return;
      }

      const res = await api.simulateLead({
        clientId: targetClient.id,
        adId: '',
        fullName: 'Ashley Robinson',
        phone: targetClient.alertPhone || targetClient.contactPhone || '(810) 510-3406',
        email: 'lead.test@gmail.com',
        customAnswers: {
          'Preferred Appointment Time': 'Tuesday morning 10am',
          'Service Interest': 'First-time introductory session',
          'Heard About Us': 'Instagram Reels Ad'
        }
      });

      setSimulationToast(`New lead arrived! Tagged: "${res.ghlTag}" and sent SMS alert to ${targetClient.alertPhone || targetClient.contactPhone || '(810) 510-3406'}`);
      onRefreshLeads();
      await loadLeadLogs();
    } catch (err: any) {
      alert('Simulation error: ' + err.message);
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 mb-8">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-slate-900 text-base">
              Recent Verified Leads & GoHighLevel Sync
            </h3>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              {filteredLeads.length} Total
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Auto-tagged with <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700 font-mono text-[11px]">FB Ad – [ad name]</code> and instant SMS/Email alerts
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* PROBLEM 3: "Sync leads now" button that pulls all leads from the last 30 days from each form */}
          <button
            onClick={handleSyncLeadsNow}
            disabled={isSyncingLeads}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer disabled:opacity-50"
            title="Pull all leads from the last 30 days from each Meta lead form and create missing contacts in GoHighLevel"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncingLeads ? 'animate-spin' : ''}`} />
            <span>{isSyncingLeads ? 'Syncing from Meta...' : 'Sync leads now'}</span>
          </button>

          <button
            onClick={handleSimulateNewLead}
            disabled={isSimulating}
            className="bg-amber-600 hover:bg-amber-700 text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
          >
            <Send className={`w-3.5 h-3.5 ${isSimulating ? 'animate-spin' : ''}`} />
            <span>{isSimulating ? 'Simulating Lead...' : 'Trigger Test Lead'}</span>
          </button>
        </div>
      </div>

      {simulationToast && (
        <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-900 px-3.5 py-2.5 rounded-lg text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{simulationToast}</span>
          </div>
          <button
            onClick={() => setSimulationToast(null)}
            className="text-emerald-700 font-bold hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Leads Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-600">
          <thead className="bg-slate-50 text-slate-500 font-semibold uppercase text-[11px] tracking-wider border-b border-slate-200">
            <tr>
              <th className="py-3 px-3">Lead Contact</th>
              <th className="py-3 px-3">Client</th>
              <th className="py-3 px-3">Campaign & Ad Tag</th>
              <th className="py-3 px-3">Submitted</th>
              <th className="py-3 px-3">GoHighLevel</th>
              <th className="py-3 px-3 text-center">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredLeads.map((lead) => {
              const client = clients.find((c) => c.id === lead.clientId);
              const isExpanded = expandedLeadId === lead.id;

              return (
                <React.Fragment key={lead.id}>
                  <tr className="hover:bg-slate-50/70 transition-colors">
                    {/* Lead Contact */}
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900 text-xs">
                        {lead.fullName}
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-0.5">
                        <span className="flex items-center gap-1 font-medium text-slate-700">
                          <Phone className="w-3 h-3 text-slate-400" />
                          {lead.phone}
                        </span>
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3 text-slate-400" />
                          {lead.email}
                        </span>
                      </div>
                    </td>

                    {/* Client */}
                    <td className="py-3 px-3 font-semibold text-slate-800">
                      {client?.businessName || 'Client'}
                    </td>

                    {/* Campaign & Ad Tag */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5 font-medium text-slate-800 truncate max-w-xs">
                        <Tag className="w-3 h-3 text-amber-600 shrink-0" />
                        <span className="bg-amber-50 text-amber-900 px-1.5 py-0.5 rounded font-mono text-[10px] border border-amber-200 truncate">
                          FB Ad – {lead.adName}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 truncate mt-0.5">
                        {lead.campaignName}
                      </div>
                    </td>

                    {/* Submitted Timestamp */}
                    <td className="py-3 px-3 whitespace-nowrap text-slate-600">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{new Date(lead.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {new Date(lead.submittedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </div>
                    </td>

                    {/* GHL Sync Status */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <ShieldCheck className="w-3 h-3" />
                        Synced ({lead.ghlContactId || 'GHL'})
                      </span>
                      {lead.alertSent && (
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          ✓ SMS & Email alert sent
                        </div>
                      )}
                    </td>

                    {/* Details toggle */}
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => setExpandedLeadId(isExpanded ? null : lead.id)}
                        className="p-1 rounded text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </td>
                  </tr>

                  {/* Expanded Custom Form Answers Row */}
                  {isExpanded && lead.customAnswers && (
                    <tr className="bg-slate-50/80">
                      <td colSpan={6} className="p-4 border-t border-slate-100">
                        <div className="text-xs font-bold text-slate-700 uppercase mb-2">
                          Instant Form Custom Questions & Customer Responses:
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                          {Object.entries(lead.customAnswers).map(([q, a]) => (
                            <div key={q} className="bg-white p-2.5 rounded border border-slate-200">
                              <span className="text-[11px] text-slate-500 font-medium block">{q}</span>
                              <span className="font-semibold text-slate-900 mt-0.5 block">{a}</span>
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>

        {filteredLeads.length === 0 && (
          <div className="p-8 text-center text-slate-500 text-xs">
            No leads recorded yet for this client filter. Click "Trigger Test Lead" above to simulate an incoming inquiry.
          </div>
        )}
      </div>

      {/* PROBLEM 3: Small Log on the Leads & GHL Page (lead name, form, time received from Meta, and whether it was sent to GHL successfully or the error message if not) */}
      <div className="mt-8 pt-6 border-t border-slate-200">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div>
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Meta Lead Forms & GoHighLevel Sync Log</span>
            </h4>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Live status of leads retrieved from Meta lead forms and dispatched to GoHighLevel sub-accounts with assigned tags.
            </p>
          </div>
          <button
            onClick={loadLeadLogs}
            disabled={isLoadingLogs}
            className="text-slate-600 hover:text-slate-900 text-xs font-medium flex items-center gap-1 cursor-pointer px-2 py-1 rounded hover:bg-slate-100 transition-colors"
          >
            <RefreshCw className={`w-3 h-3 ${isLoadingLogs ? 'animate-spin' : ''}`} />
            <span>Refresh Log</span>
          </button>
        </div>

        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-slate-50/50">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-100 text-slate-500 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Lead Name</th>
                <th className="py-2.5 px-3">Form</th>
                <th className="py-2.5 px-3">Time Received (Meta)</th>
                <th className="py-2.5 px-3">Sub-Account & Tag</th>
                <th className="py-2.5 px-3">GoHighLevel Delivery Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {leadLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                  {/* Lead Name */}
                  <td className="py-2.5 px-3">
                    <div className="font-semibold text-slate-900">
                      {log.leadName}
                    </div>
                    {log.email && (
                      <div className="text-[10px] text-slate-400 font-mono">
                        {log.email}
                      </div>
                    )}
                  </td>

                  {/* Form Name */}
                  <td className="py-2.5 px-3">
                    <span className="font-medium text-slate-800">
                      {log.formName}
                    </span>
                    {log.formId && (
                      <div className="text-[10px] text-slate-400 font-mono">
                        ID: {log.formId}
                      </div>
                    )}
                  </td>

                  {/* Time Received from Meta */}
                  <td className="py-2.5 px-3 whitespace-nowrap text-slate-600">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{log.receivedAt ? new Date(log.receivedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}</span>
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {log.receivedAt ? new Date(log.receivedAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) : ''}
                    </div>
                  </td>

                  {/* Sub-Account & Tag */}
                  <td className="py-2.5 px-3">
                    <div className="font-medium text-slate-800">
                      {log.ghlSubAccountName || 'Default Sub-Account'}
                    </div>
                    {log.tag && (
                      <span className="inline-block mt-0.5 bg-amber-50 text-amber-900 border border-amber-200 px-1.5 py-0.2 rounded font-mono text-[10px]">
                        {log.tag}
                      </span>
                    )}
                  </td>

                  {/* GHL Status or Plain Error */}
                  <td className="py-2.5 px-3">
                    {log.status === 'success' ? (
                      <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                        <span>Sent to GoHighLevel</span>
                      </div>
                    ) : (
                      <div className="inline-flex items-start gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium bg-red-50 text-red-800 border border-red-200 max-w-sm">
                        <AlertCircle className="w-3.5 h-3.5 text-red-600 shrink-0 mt-0.5" />
                        <div>
                          <div className="font-bold text-red-900">Delivery Error</div>
                          <div className="text-[10px] text-red-700 leading-tight">
                            {log.errorMessage || 'Failed to dispatch to GoHighLevel'}
                          </div>
                        </div>
                      </div>
                    )}
                  </td>
                </tr>
              ))}

              {leadLogs.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-slate-400 text-xs">
                    No lead sync actions recorded yet. Click "Sync leads now" above to query Meta lead forms.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
