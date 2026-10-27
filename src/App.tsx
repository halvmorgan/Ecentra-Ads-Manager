/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { AttentionPanel } from './components/AttentionPanel';
import { StatsOverview } from './components/StatsOverview';
import { ChartsSection } from './components/ChartsSection';
import { AdsTable } from './components/AdsTable';
import { AdBuilderWizard } from './components/AdBuilderWizard';
import { ClientManagement } from './components/ClientManagement';
import { LeadsList } from './components/LeadsList';
import { MetaSettings } from './components/MetaSettings';
import { WeeklyReportModal } from './components/WeeklyReportModal';
import { ClientPortalView } from './components/ClientPortalView';
import { BudgetModal } from './components/BudgetModal';
import { AdDetailModal } from './components/AdDetailModal';
import { AdEditWizard } from './components/AdEditWizard';
import { Client, InsightsData, LeadRecord, AdStatus, AdDetailData } from './types';
import { api } from './services/api';

export default function App() {
  // Navigation & Role State
  const [currentView, setCurrentView] = useState<'admin' | 'client'>('admin');
  const [activeTab, setActiveTab] = useState<'overview' | 'ads' | 'clients' | 'leads' | 'settings'>('overview');
  const [selectedClientId, setSelectedClientId] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('30d');

  // Data State
  const [clients, setClients] = useState<Client[]>([]);
  const [insights, setInsights] = useState<InsightsData | null>(null);
  const [adStats, setAdStats] = useState<any[]>([]);
  const [attentionItems, setAttentionItems] = useState<any[]>([]);
  const [leads, setLeads] = useState<LeadRecord[]>([]);
  const [liveMode, setLiveMode] = useState<boolean>(false);

  // UI State
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isAdBuilderOpen, setIsAdBuilderOpen] = useState<boolean>(false);
  const [selectedAdDetailId, setSelectedAdDetailId] = useState<string | null>(null);
  const [isAdDetailOpen, setIsAdDetailOpen] = useState<boolean>(false);
  const [adDetailToEdit, setAdDetailToEdit] = useState<AdDetailData | null>(null);
  const [isEditWizardOpen, setIsEditWizardOpen] = useState<boolean>(false);
  const [weeklyReportClient, setWeeklyReportClient] = useState<Client | null>(null);
  const [budgetModal, setBudgetModal] = useState<{ clientId: string; adId: string; currentBudget: number } | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Check URL pathname or search params on mount
  useEffect(() => {
    const path = window.location.pathname;
    const searchParams = new URLSearchParams(window.location.search);
    if (path.includes('/ads/client') || searchParams.get('view') === 'client') {
      setCurrentView('client');
    }
  }, []);

  // Initial Data Fetch
  useEffect(() => {
    loadAllData();
  }, [selectedClientId, dateRange, liveMode]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadAllData = async () => {
    setIsRefreshing(true);
    try {
      const [statusRes, clientsRes, insightsRes, leadsRes] = await Promise.all([
        api.getStatus(),
        api.getClients(),
        api.getInsights(selectedClientId, dateRange),
        api.getLeads(selectedClientId),
      ]);

      setLiveMode(statusRes.liveMode);
      setClients(clientsRes);
      setInsights(insightsRes.summary);
      setAdStats(insightsRes.adStats);
      setAttentionItems(insightsRes.attentionItems);
      setLeads(leadsRes);
    } catch (err) {
      console.error('Failed to load application data:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Toggle Live Meta vs Demo Mode
  const handleToggleLiveMode = async (nextLive: boolean) => {
    try {
      await api.toggleDemoMode(nextLive);
      setLiveMode(nextLive);
      showToast(nextLive ? 'Switched to Live Meta BM Connection' : 'Switched to Demo Mode (Simulated Data)');
      await loadAllData();
    } catch (err: any) {
      alert(err.message || 'Failed to switch mode');
    }
  };

  // Toggle Pause/Resume on Ad
  const handleToggleAdStatus = async (adId: string, currentStatus: AdStatus) => {
    try {
      const nextStatus = currentStatus === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
      await api.toggleItemStatus(adId, 'ad', nextStatus);
      showToast(`Ad status updated to ${nextStatus}`);
      await loadAllData();
    } catch (err: any) {
      alert(err.message || 'Failed to update ad status');
    }
  };

  // Duplicate Ad
  const handleDuplicateAd = async (adId: string) => {
    try {
      await api.duplicateItem(adId, 'ad');
      showToast('Ad duplicated with status PAUSED. Ready for copy/image test.');
      await loadAllData();
    } catch (err: any) {
      alert(err.message || 'Failed to duplicate ad');
    }
  };

  // Archive Ad
  const handleArchiveAd = async (adId: string) => {
    if (confirm('Are you sure you want to archive this ad creative?')) {
      try {
        await api.archiveItem(adId, 'ad');
        showToast('Ad archived');
        await loadAllData();
      } catch (err: any) {
        alert(err.message || 'Failed to archive ad');
      }
    }
  };

  // Open Budget Adjustment
  const handleOpenBudgetModal = (clientId: string, adId: string) => {
    const ad = adStats.find((a) => a.adId === adId);
    setBudgetModal({
      clientId,
      adId,
      currentBudget: ad?.spend ? Math.round(ad.spend / 10) : 50,
    });
  };

  // Open Ad Detail
  const handleSelectAdDetail = (adId: string) => {
    setSelectedAdDetailId(adId);
    setIsAdDetailOpen(true);
  };

  // Open Edit Wizard from Ad Detail
  const handleOpenEditWizard = (adDetail: AdDetailData) => {
    setIsAdDetailOpen(false);
    setAdDetailToEdit(adDetail);
    setIsEditWizardOpen(true);
  };

  // Activate Campaign on Meta (Go Live)
  const handleGoLiveCampaign = async (campaignId: string) => {
    try {
      await api.goLive(campaignId);
      showToast('Campaign, ad set, and ad are now ACTIVE on Meta!');
      await loadAllData();
    } catch (err: any) {
      alert(err.message || 'Failed to activate campaign on Meta');
    }
  };

  // Active Client for Client View
  const clientForPortal = (selectedClientId && selectedClientId !== 'all')
    ? clients.find((c) => c.id === selectedClientId) || clients[0]
    : clients[0];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-lg shadow-xl border border-slate-700 flex items-center gap-2 animate-fade-in">
          <span className="w-2 h-2 rounded-full bg-amber-400"></span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Global Navigation Bar */}
      <Navbar
        currentView={currentView}
        onViewChange={(v) => {
          setCurrentView(v);
          if (v === 'client' && selectedClientId === 'all' && clients.length > 0) {
            setSelectedClientId(clients[0].id);
          }
        }}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        clients={clients}
        selectedClientId={selectedClientId}
        onSelectClient={setSelectedClientId}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        onOpenAdBuilder={() => setIsAdBuilderOpen(true)}
        onRefresh={() => {
          showToast('Refreshing stats from Meta Insights API...');
          loadAllData();
        }}
        isRefreshing={isRefreshing}
        liveMode={liveMode}
        onToggleLiveMode={handleToggleLiveMode}
      />

      {/* Main Body */}
      {currentView === 'client' ? (
        /* READ-ONLY CLIENT VIEW */
        clientForPortal ? (
          <ClientPortalView
            client={clientForPortal}
            availableClients={clients}
            onSelectAnotherClient={setSelectedClientId}
          />
        ) : (
          <div className="p-12 text-center text-slate-500 text-sm">
            No client accounts configured yet.
          </div>
        )
      ) : (
        /* ADMIN VIEW (Harold) */
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Flag High CPL & Rejected Ads Panel (At the top of Main Screen) */}
          <AttentionPanel
            items={attentionItems}
            onPauseAd={(adId) => handleToggleAdStatus(adId, 'ACTIVE')}
            onAdjustBudget={(adId) => handleOpenBudgetModal(selectedClientId, adId)}
          />

          {/* TAB 1: OVERVIEW & STATS */}
          {activeTab === 'overview' && (
            <div>
              {insights && <StatsOverview insights={insights} />}
              {insights && <ChartsSection dailyData={insights.dailyBreakdown} />}
              <AdsTable
                adStats={adStats}
                clients={clients}
                onToggleStatus={handleToggleAdStatus}
                onDuplicate={handleDuplicateAd}
                onArchive={handleArchiveAd}
                onAdjustBudget={handleOpenBudgetModal}
                onSelectAdDetail={handleSelectAdDetail}
                onGoLive={handleGoLiveCampaign}
              />
            </div>
          )}

          {/* TAB 2: MANAGE ADS */}
          {activeTab === 'ads' && (
            <div>
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                    All Campaigns & Ad Creatives
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    One-click status toggle, budget adjustment, and creative duplication
                  </p>
                </div>
                <button
                  onClick={() => setIsAdBuilderOpen(true)}
                  className="bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-xs"
                >
                  + Create New Ad
                </button>
              </div>

              <AdsTable
                adStats={adStats}
                clients={clients}
                onToggleStatus={handleToggleAdStatus}
                onDuplicate={handleDuplicateAd}
                onArchive={handleArchiveAd}
                onAdjustBudget={handleOpenBudgetModal}
                onSelectAdDetail={handleSelectAdDetail}
                onGoLive={handleGoLiveCampaign}
              />
            </div>
          )}

          {/* TAB 3: CLIENTS SETUP */}
          {activeTab === 'clients' && (
            <ClientManagement
              clients={clients}
              onRefreshClients={loadAllData}
              onOpenWeeklyReport={(c) => setWeeklyReportClient(c)}
              onSelectClientForAds={(cId) => {
                setSelectedClientId(cId);
                setActiveTab('ads');
              }}
            />
          )}

          {/* TAB 4: LEADS & GHL */}
          {activeTab === 'leads' && (
            <LeadsList
              leads={leads}
              clients={clients}
              selectedClientId={selectedClientId}
              onRefreshLeads={loadAllData}
            />
          )}

          {/* TAB 5: META SETTINGS */}
          {activeTab === 'settings' && (
            <MetaSettings
              clients={clients}
              liveMode={liveMode}
              onToggleLiveMode={handleToggleLiveMode}
              onRefreshAll={loadAllData}
            />
          )}
        </main>
      )}

      {/* Ad Builder Wizard Modal */}
      {isAdBuilderOpen && (
        <AdBuilderWizard
          isOpen={isAdBuilderOpen}
          onClose={() => setIsAdBuilderOpen(false)}
          clients={clients}
          initialClientId={selectedClientId !== 'all' ? selectedClientId : undefined}
          onCampaignCreated={() => {
            showToast('Campaign staged as PAUSED! Available in Ads Manager.');
            loadAllData();
          }}
        />
      )}

      {/* Weekly Report Preview Modal */}
      {weeklyReportClient && (
        <WeeklyReportModal
          client={weeklyReportClient}
          onClose={() => setWeeklyReportClient(null)}
        />
      )}

      {/* One-Click Budget Modal */}
      {budgetModal && (
        <BudgetModal
          clientId={budgetModal.clientId}
          adId={budgetModal.adId}
          currentBudget={budgetModal.currentBudget}
          onClose={() => setBudgetModal(null)}
          onSuccess={() => {
            showToast('Daily budget updated successfully');
            loadAllData();
          }}
        />
      )}

      {/* Ad Detail Modal */}
      {isAdDetailOpen && selectedAdDetailId && (
        <AdDetailModal
          adId={selectedAdDetailId}
          isOpen={isAdDetailOpen}
          onClose={() => {
            setIsAdDetailOpen(false);
            setSelectedAdDetailId(null);
          }}
          onOpenEdit={handleOpenEditWizard}
          onToggleStatus={handleToggleAdStatus}
          onDuplicate={handleDuplicateAd}
          onArchive={handleArchiveAd}
          onDeleteSuccess={() => {
            setIsAdDetailOpen(false);
            setSelectedAdDetailId(null);
            showToast('Ad permanently deleted from Meta');
            loadAllData();
          }}
        />
      )}

      {/* Ad Edit Wizard Modal */}
      {isEditWizardOpen && adDetailToEdit && (
        <AdEditWizard
          isOpen={isEditWizardOpen}
          onClose={() => {
            setIsEditWizardOpen(false);
            setAdDetailToEdit(null);
          }}
          adDetail={adDetailToEdit}
          onSuccess={() => {
            setIsEditWizardOpen(false);
            setAdDetailToEdit(null);
            showToast('Ad configuration updated successfully on Meta');
            loadAllData();
          }}
        />
      )}

      {/* Footer Branding */}
      <footer className="border-t border-slate-200 bg-white py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900">Ecentra Concierge</span>
            <span>•</span>
            <a
              href="https://ecentraconcierge.com"
              target="_blank"
              rel="noreferrer"
              className="text-amber-700 hover:underline font-medium"
            >
              ecentraconcierge.com
            </a>
          </div>
          <div className="flex items-center gap-3">
            <span>Meta Marketing API v21.0</span>
            <span>•</span>
            <span>GoHighLevel Leads Sync</span>
            <span>•</span>
            <span className="font-semibold text-slate-700">Members-Only Portal</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
