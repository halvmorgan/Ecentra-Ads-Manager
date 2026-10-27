import React from 'react';
import { 
  Building2, 
  Layers, 
  PlusCircle, 
  RefreshCw, 
  Settings, 
  Users, 
  Calendar, 
  ShieldCheck, 
  ExternalLink,
  ChevronDown,
  LayoutDashboard,
  Eye,
  FileText
} from 'lucide-react';
import { Client, UserSession } from '../types';

interface NavbarProps {
  currentView: 'admin' | 'client';
  onViewChange: (view: 'admin' | 'client') => void;
  activeTab: 'overview' | 'ads' | 'clients' | 'leads' | 'settings';
  onTabChange: (tab: 'overview' | 'ads' | 'clients' | 'leads' | 'settings') => void;
  clients: Client[];
  selectedClientId: string;
  onSelectClient: (id: string) => void;
  dateRange: string;
  onDateRangeChange: (range: string) => void;
  onOpenAdBuilder: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  liveMode: boolean;
  onToggleLiveMode: (live: boolean) => void;
  session: UserSession | null;
  onOpenLogin: () => void;
  onLogout: () => void;
  isDbPermanent?: boolean;
  lastSaveError?: string | null;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onViewChange,
  activeTab,
  onTabChange,
  clients,
  selectedClientId,
  onSelectClient,
  dateRange,
  onDateRangeChange,
  onOpenAdBuilder,
  onRefresh,
  isRefreshing,
  liveMode,
  onToggleLiveMode,
  session,
  onOpenLogin,
  onLogout,
  isDbPermanent = true,
  lastSaveError,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      {/* Top Banner / Utility Bar */}
      <div className="bg-slate-900 text-slate-300 px-4 sm:px-6 py-1.5 text-xs flex flex-wrap items-center justify-between border-b border-slate-800 gap-2">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-medium text-amber-400">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
            <span>Ecentra Concierge Ad Engine</span>
          </div>
          <span className="text-slate-600 hidden sm:inline">|</span>
          <span className="text-slate-400 hidden lg:inline">Meta Marketing API v21.0 & GHL Integration</span>
          
          {/* Database Connectivity Badge in Admin Header */}
          <div className="flex items-center">
            {isDbPermanent ? (
              <span
                className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                title="Cloud Firestore real-time storage is active and verified saving."
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span>Database: connected</span>
              </span>
            ) : (
              <span
                className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/40"
                title={lastSaveError || 'Database writes are currently not persisting to Cloud Firestore.'}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping"></span>
                <span>Database: NOT saving</span>
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Demo Mode Toggle */}
          <div className="flex items-center gap-2 bg-slate-800/80 px-2.5 py-0.5 rounded-full border border-slate-700">
            <span className="text-[11px] text-slate-300 font-medium">Mode:</span>
            <button
              onClick={() => onToggleLiveMode(!liveMode)}
              className={`text-[11px] px-2 py-0.5 rounded-full font-semibold transition-all cursor-pointer ${
                !liveMode 
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Demo Mode
            </button>
            <button
              onClick={() => onToggleLiveMode(true)}
              className={`text-[11px] px-2 py-0.5 rounded-full font-semibold transition-all cursor-pointer ${
                liveMode 
                  ? 'bg-emerald-500 text-white' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Live Meta BM
            </button>
          </div>

          {/* User Session Info / Login Button */}
          {session ? (
            <div className="flex items-center gap-2 bg-slate-800/90 pl-2.5 pr-1.5 py-0.5 rounded-lg border border-slate-700 text-[11px]">
              {session.isAdmin ? (
                <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Admin:</span>
                  <span className="text-white font-mono text-[10px]">halvmorgan@gmail.com</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-amber-300 font-medium">
                  <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                  <span className="truncate max-w-[120px]">{session.clientBusinessName}</span>
                  <span className="text-[10px] text-slate-400 font-normal">(Client Portal)</span>
                </div>
              )}
              <button
                onClick={onLogout}
                className="text-[10px] text-slate-400 hover:text-red-400 ml-1 px-1.5 py-0.5 rounded hover:bg-slate-700/60 transition-colors"
                title="Sign Out"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenLogin}
              className="px-2.5 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded text-[11px] font-semibold transition-colors cursor-pointer"
            >
              Sign In
            </button>
          )}

          {/* Role Mode Switcher (Admin vs Client Portal) */}
          {(!session || session.isAdmin) && (
            <div className="flex items-center bg-slate-800 rounded p-0.5 border border-slate-700">
              <button
                onClick={() => onViewChange('admin')}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all ${
                  currentView === 'admin'
                    ? 'bg-slate-700 text-white shadow-xs font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Admin (Harold)
              </button>
              <button
                onClick={() => onViewChange('client')}
                className={`px-2 py-0.5 rounded text-[11px] font-medium flex items-center gap-1 transition-all ${
                  currentView === 'client'
                    ? 'bg-amber-600 text-white shadow-xs font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Eye className="w-3 h-3" />
                Client View
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Navigation Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center text-amber-400 font-bold tracking-wider shadow-md border border-slate-700/60">
                <span className="text-xl font-serif">E</span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-slate-900 tracking-tight text-base sm:text-lg">
                    ECENTRA
                  </span>
                  <span className="text-amber-600 font-semibold text-xs uppercase tracking-widest bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                    Ads
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 font-medium">
                  {currentView === 'admin' ? 'Agency Control Room' : 'Client Performance Portal'}
                </div>
              </div>
            </div>

            {/* Admin Tabs */}
            {currentView === 'admin' && (
              <nav className="hidden md:flex items-center space-x-1 pl-4 border-l border-slate-200">
                <button
                  onClick={() => onTabChange('overview')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5 ${
                    activeTab === 'overview'
                      ? 'text-slate-900 bg-slate-100 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4 text-slate-500" />
                  Overview & Stats
                </button>
                <button
                  onClick={() => onTabChange('ads')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5 ${
                    activeTab === 'ads'
                      ? 'text-slate-900 bg-slate-100 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Layers className="w-4 h-4 text-slate-500" />
                  Manage Ads
                </button>
                <button
                  onClick={() => onTabChange('clients')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5 ${
                    activeTab === 'clients'
                      ? 'text-slate-900 bg-slate-100 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Building2 className="w-4 h-4 text-slate-500" />
                  Clients Setup
                </button>
                <button
                  onClick={() => onTabChange('leads')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5 ${
                    activeTab === 'leads'
                      ? 'text-slate-900 bg-slate-100 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Users className="w-4 h-4 text-slate-500" />
                  Leads & GHL
                </button>
                <button
                  onClick={() => onTabChange('settings')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5 ${
                    activeTab === 'settings'
                      ? 'text-slate-900 bg-slate-100 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Settings className="w-4 h-4 text-slate-500" />
                  Meta Settings
                </button>
              </nav>
            )}
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Client Filter (Admin) or Client Selector (Client Portal) */}
            <div className="relative">
              <select
                value={selectedClientId}
                onChange={(e) => onSelectClient(e.target.value)}
                className="text-xs sm:text-sm bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 pr-7 font-medium text-slate-700 shadow-2xs hover:border-slate-400 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20"
              >
                {currentView === 'admin' && (
                  <option value="all">All Clients Combined</option>
                )}
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.businessName}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Range Picker */}
            <div className="hidden lg:flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
              {['today', '7d', '30d', 'this_month', 'lifetime'].map((rangeKey) => {
                const labels: Record<string, string> = {
                  today: 'Today',
                  '7d': '7D',
                  '30d': '30D',
                  this_month: 'This Month',
                  lifetime: 'All-Time',
                };
                return (
                  <button
                    key={rangeKey}
                    onClick={() => onDateRangeChange(rangeKey)}
                    className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                      dateRange === rangeKey
                        ? 'bg-white text-slate-900 shadow-xs font-semibold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {labels[rangeKey]}
                  </button>
                );
              })}
            </div>

            {/* Refresh Button */}
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              title="Refresh Insights API Cache"
              className="p-1.5 text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg shadow-2xs flex items-center gap-1.5 text-xs font-medium"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-amber-600' : ''}`} />
              <span className="hidden sm:inline">Refresh now</span>
            </button>

            {/* Launch / Create Ad CTA (Admin only) */}
            {currentView === 'admin' && (
              <button
                onClick={onOpenAdBuilder}
                className="bg-slate-900 hover:bg-slate-800 text-white px-3 sm:px-4 py-1.5 rounded-lg text-xs sm:text-sm font-semibold shadow-xs flex items-center gap-1.5 transition-all hover:shadow-md cursor-pointer"
              >
                <PlusCircle className="w-4 h-4 text-amber-400" />
                <span>Create Ad</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation Tabs for Admin */}
        {currentView === 'admin' && (
          <div className="flex md:hidden overflow-x-auto py-2 border-t border-slate-100 space-x-1 no-scrollbar text-xs">
            <button
              onClick={() => onTabChange('overview')}
              className={`px-3 py-1.5 rounded-md whitespace-nowrap font-medium ${
                activeTab === 'overview' ? 'bg-slate-900 text-white' : 'text-slate-600'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => onTabChange('ads')}
              className={`px-3 py-1.5 rounded-md whitespace-nowrap font-medium ${
                activeTab === 'ads' ? 'bg-slate-900 text-white' : 'text-slate-600'
              }`}
            >
              Ads Manager
            </button>
            <button
              onClick={() => onTabChange('clients')}
              className={`px-3 py-1.5 rounded-md whitespace-nowrap font-medium ${
                activeTab === 'clients' ? 'bg-slate-900 text-white' : 'text-slate-600'
              }`}
            >
              Clients
            </button>
            <button
              onClick={() => onTabChange('leads')}
              className={`px-3 py-1.5 rounded-md whitespace-nowrap font-medium ${
                activeTab === 'leads' ? 'bg-slate-900 text-white' : 'text-slate-600'
              }`}
            >
              Leads
            </button>
            <button
              onClick={() => onTabChange('settings')}
              className={`px-3 py-1.5 rounded-md whitespace-nowrap font-medium ${
                activeTab === 'settings' ? 'bg-slate-900 text-white' : 'text-slate-600'
              }`}
            >
              Meta Settings
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
