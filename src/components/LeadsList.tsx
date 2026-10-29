import React, { useState } from 'react';
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
  Sparkles
} from 'lucide-react';
import { LeadRecord, Client } from '../types';
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
  const [simulationToast, setSimulationToast] = useState<string | null>(null);

  const filteredLeads = selectedClientId && selectedClientId !== 'all'
    ? leads.filter((l) => l.clientId === selectedClientId)
    : leads;

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
        phone: targetClient.alertPhone || targetClient.contactPhone || '(480) 250-1234',
        email: 'ashley.r.az@gmail.com',
        customAnswers: {
          'Preferred Appointment Time': 'Tuesday morning 10am',
          'Service Interest': 'First-time introductory session',
          'Heard About Us': 'Instagram Reels Ad'
        }
      });

      setSimulationToast(`New lead arrived! Tagged: "${res.ghlTag}" and sent SMS alert to ${targetClient.alertPhone || targetClient.contactPhone || '(480) 250-1234'}`);
      onRefreshLeads();
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

        <button
          onClick={handleSimulateNewLead}
          disabled={isSimulating}
          className="bg-amber-600 hover:bg-amber-700 text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
        >
          <Send className={`w-3.5 h-3.5 ${isSimulating ? 'animate-spin' : ''}`} />
          <span>{isSimulating ? 'Simulating Lead...' : 'Trigger Test Lead'}</span>
        </button>
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
    </div>
  );
};
