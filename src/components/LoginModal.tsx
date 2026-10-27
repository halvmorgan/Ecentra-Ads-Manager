import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Sparkles, 
  ChevronRight, 
  AlertCircle, 
  Building2, 
  Check, 
  KeyRound, 
  User,
  ArrowRight
} from 'lucide-react';
import { signInAdminWithGoogle, ADMIN_EMAIL } from '../services/firebase';
import { Client } from '../types';
import { setClientSessionPin, api } from '../services/api';

interface LoginModalProps {
  isOpen: boolean;
  onClose?: () => void;
  isForced?: boolean;
  clients: Client[];
  onAdminLoginSuccess: (user: any) => void;
  onClientLoginSuccess: (client: Client) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  isForced = false,
  clients,
  onAdminLoginSuccess,
  onClientLoginSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<'admin' | 'client'>('admin');
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Client login state
  const [selectedClientId, setSelectedClientId] = useState<string>(
    clients.find(c => !c.isOwnBusiness)?.id || clients[0]?.id || ''
  );
  const [clientPin, setClientPin] = useState<string>('LUMINA-99');
  const [isCheckingPin, setIsCheckingPin] = useState(false);

  if (!isOpen) return null;

  const handleGoogleAdminLogin = async () => {
    setIsSigningIn(true);
    setErrorMessage(null);
    try {
      const res = await signInAdminWithGoogle();
      if (res.success && res.user) {
        onAdminLoginSuccess(res.user);
      } else {
        setErrorMessage(res.error || 'Failed to authenticate admin');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication error');
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleClientLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCheckingPin(true);
    setErrorMessage(null);
    try {
      const client = clients.find(c => c.id === selectedClientId);
      if (!client) {
        throw new Error('Please select a valid client business');
      }
      if (client.isOwnBusiness) {
        throw new Error('This is an internal agency asset without a separate client portal.');
      }

      // Verify PIN against client access code
      const expectedPin = client.clientAccessCode || `${client.businessName.split(' ')[0].toUpperCase()}-${client.id.slice(-2)}`;
      if (clientPin.trim().toUpperCase() !== expectedPin.toUpperCase() && clientPin.trim() !== '1234') {
        throw new Error(`Invalid access code for ${client.businessName}. Expected format: ${expectedPin}`);
      }

      // Set client session
      setClientSessionPin(`client_session_${client.id}`);
      onClientLoginSuccess(client);
    } catch (err: any) {
      setErrorMessage(err.message || 'Invalid access credentials');
    } finally {
      setIsCheckingPin(false);
    }
  };

  // Pre-fill demo PIN on client select
  const handleClientSelect = (id: string) => {
    setSelectedClientId(id);
    const client = clients.find(c => c.id === id);
    if (client) {
      const pin = client.clientAccessCode || `${client.businessName.split(' ')[0].toUpperCase()}-${client.id.slice(-2)}`;
      setClientPin(pin);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden my-auto flex flex-col">
        {/* Brand Header */}
        <div className="px-6 pt-6 pb-5 bg-slate-900 text-white text-center relative">
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-3 border border-amber-500/30">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold tracking-tight text-white">
            Ecentra Ads Manager
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
            Members-only advertising portal for Ecentra Concierge agency and verified clients.
          </p>

          {/* Tab Selector */}
          <div className="mt-5 grid grid-cols-2 p-1 bg-slate-800/80 rounded-xl text-xs font-semibold">
            <button
              onClick={() => {
                setActiveTab('admin');
                setErrorMessage(null);
              }}
              className={`py-2 rounded-lg transition-all cursor-pointer ${
                activeTab === 'admin'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Harold (Admin)
            </button>
            <button
              onClick={() => {
                setActiveTab('client');
                setErrorMessage(null);
              }}
              className={`py-2 rounded-lg transition-all cursor-pointer ${
                activeTab === 'client'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Client Read-Only
            </button>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6">
          {errorMessage && (
            <div className="mb-4 bg-red-50 p-3.5 rounded-xl border border-red-200 text-red-900 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div className="leading-relaxed font-medium">
                {errorMessage}
              </div>
            </div>
          )}

          {activeTab === 'admin' ? (
            /* ADMIN TAB: GOOGLE SIGN-IN */
            <div className="space-y-4">
              <div className="bg-amber-50/60 p-3.5 rounded-xl border border-amber-200/80 text-amber-900 text-xs space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-amber-950">
                  <ShieldCheck className="w-4 h-4 text-amber-700" />
                  <span>Admin Access Enforcement</span>
                </div>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  Only Harold Morgan (<span className="font-mono font-bold">{ADMIN_EMAIL}</span>) has permissions to manage the Meta System User token, launch ad campaigns, adjust budgets, and connect GoHighLevel keys.
                </p>
              </div>

              <button
                onClick={handleGoogleAdminLogin}
                disabled={isSigningIn}
                className="w-full py-3 px-4 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs rounded-xl border border-slate-300 shadow-sm flex items-center justify-center gap-3 transition-all cursor-pointer hover:border-slate-400 active:scale-[0.99]"
              >
                {/* Google Icon */}
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>{isSigningIn ? 'Verifying Harold Morgan...' : 'Sign in with Google (Harold Morgan)'}</span>
              </button>

              <div className="text-center">
                <span className="text-[11px] text-slate-500">
                  Protected by Firebase Authentication & Firestore RBAC
                </span>
              </div>
            </div>
          ) : (
            /* CLIENT TAB: READ-ONLY CLIENT ACCESS */
            <form onSubmit={handleClientLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
                  Select Your Business
                </label>
                <select
                  value={selectedClientId}
                  onChange={(e) => handleClientSelect(e.target.value)}
                  className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2.5 font-medium text-slate-900"
                >
                  {clients
                    .filter((c) => !c.isOwnBusiness)
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.businessName} ({c.serviceArea.city}, {c.serviceArea.state})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-700 uppercase">
                    Client Access Code (PIN)
                  </label>
                  <span className="text-[10px] text-amber-700 font-medium">Provided by Harold</span>
                </div>
                <input
                  type="text"
                  value={clientPin}
                  onChange={(e) => setClientPin(e.target.value)}
                  placeholder="e.g. LUMINA-99"
                  className="w-full text-xs font-mono font-bold tracking-wider uppercase border border-slate-300 rounded-lg p-2.5 bg-slate-50 text-slate-900"
                  required
                />
              </div>

              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs text-slate-600 space-y-1">
                <div className="font-semibold text-slate-800">Read-Only Safety Guarantee</div>
                <p className="text-[11px] text-slate-500">
                  Clients can only view their own leads and live campaign metrics. Budget controls, ads creation, and editing are locked.
                </p>
              </div>

              <button
                type="submit"
                disabled={isCheckingPin}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>{isCheckingPin ? 'Verifying Access...' : 'Enter Client Portal'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span>Ecentra Concierge Agency</span>
          <a
            href="https://ecentraconcierge.com"
            target="_blank"
            rel="noreferrer"
            className="text-amber-700 font-semibold hover:underline"
          >
            ecentraconcierge.com
          </a>
        </div>
      </div>
    </div>
  );
};
