import { 
  Client, 
  Campaign, 
  AdSet, 
  AdCreative, 
  LeadRecord, 
  InsightsData, 
  MetaConnectionState, 
  MetaAdAccount, 
  MetaPage, 
  GeneratedAdCopy,
  ConnectionCheckStep,
  AdDetailData
} from '../types';

export const api = {
  // System Status & Meta Config
  async getStatus() {
    const res = await fetch('/api/status');
    if (!res.ok) throw new Error('Failed to fetch status');
    return res.json() as Promise<{
      hasToken: boolean;
      tokenMasked: string;
      liveMode: boolean;
      businessManagerId: string;
      businessManagerName: string;
      connectedAt: string;
      clientCount: number;
      activeCampaignsCount: number;
      activeAdsCount: number;
      hasGeminiKey: boolean;
      isDbPermanent: boolean;
      lastCacheRefresh?: string;
    }>;
  },

  async updateMetaToken(token: string, liveMode: boolean) {
    const res = await fetch('/api/meta/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, liveMode }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update token');
    return data;
  },

  async toggleDemoMode(liveMode: boolean) {
    const res = await fetch('/api/settings/toggle-demo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ liveMode }),
    });
    return res.json();
  },

  async testConnection(): Promise<{ success: boolean; mode: string; steps: ConnectionCheckStep[] }> {
    const res = await fetch('/api/meta/test-connection', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    const data = await res.json();
    if (!res.ok && !data.steps) throw new Error(data.error || 'Connection check failed');
    return data;
  },

  async getMetaResources() {
    const res = await fetch('/api/meta/resources');
    if (!res.ok) throw new Error('Failed to fetch Meta resources');
    return res.json() as Promise<{
      adAccounts: MetaAdAccount[];
      pages: MetaPage[];
      isLive: boolean;
    }>;
  },

  // Clients
  async getClients(): Promise<Client[]> {
    const res = await fetch('/api/clients');
    if (!res.ok) throw new Error('Failed to fetch clients');
    return res.json();
  },

  async saveClient(client: Partial<Client>): Promise<Client> {
    const res = await fetch('/api/clients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(client),
    });
    if (!res.ok) throw new Error('Failed to save client');
    return res.json();
  },

  async deleteClient(id: string): Promise<void> {
    const res = await fetch(`/api/clients/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete client');
  },

  // Campaigns & Ads
  async getCampaigns(clientId?: string): Promise<{
    campaigns: Campaign[];
    adSets: AdSet[];
    ads: AdCreative[];
  }> {
    const url = clientId && clientId !== 'all' ? `/api/campaigns?clientId=${clientId}` : '/api/campaigns';
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch campaigns');
    return res.json();
  },

  async createCampaign(payload: any) {
    const res = await fetch('/api/campaigns/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to create campaign');
    return data;
  },

  async goLive(campaignId: string) {
    const res = await fetch(`/api/campaigns/${campaignId}/golive`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to activate campaign on Meta');
    return data;
  },

  async toggleItemStatus(id: string, type: 'campaign' | 'ad' | 'adset', newStatus?: string) {
    const res = await fetch(`/api/campaigns/${id}/toggle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, newStatus }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update status');
    return data;
  },

  async updateBudget(id: string, dailyBudget: number) {
    const res = await fetch(`/api/campaigns/${id}/budget`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dailyBudget }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update budget');
    return data;
  },

  async duplicateItem(id: string, type: 'campaign' | 'ad') {
    const res = await fetch(`/api/campaigns/${id}/duplicate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to duplicate item');
    return data;
  },

  async archiveItem(id: string, type: 'campaign' | 'ad') {
    const res = await fetch(`/api/campaigns/${id}/archive`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type }),
    });
    return res.json();
  },

  // Ad Detail, Edit & Delete
  async getAdDetail(id: string): Promise<AdDetailData> {
    const res = await fetch(`/api/ads/${id}`);
    if (!res.ok) throw new Error('Failed to fetch ad details');
    return res.json();
  },

  async editAd(id: string, payload: any) {
    const res = await fetch(`/api/ads/${id}/edit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to edit ad');
    return data;
  },

  async deleteAd(id: string) {
    const res = await fetch(`/api/ads/${id}`, {
      method: 'DELETE',
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to delete ad');
    return data;
  },

  // Insights
  async getInsights(clientId?: string, range: string = '30d'): Promise<{
    summary: InsightsData;
    adStats: any[];
    attentionItems: any[];
    cachedAt?: string;
  }> {
    const url = `/api/insights?clientId=${clientId || 'all'}&range=${range}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch insights');
    return res.json();
  },

  // Leads
  async getLeads(clientId?: string, adId?: string): Promise<LeadRecord[]> {
    let url = clientId && clientId !== 'all' ? `/api/leads?clientId=${clientId}` : '/api/leads';
    if (adId) {
      url += (url.includes('?') ? '&' : '?') + `adId=${adId}`;
    }
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch leads');
    return res.json();
  },

  async syncLiveLeads() {
    const res = await fetch('/api/leads/sync', { method: 'POST' });
    return res.json();
  },

  async simulateLead(payload: {
    clientId: string;
    adId: string;
    fullName?: string;
    phone?: string;
    email?: string;
    customAnswers?: Record<string, string>;
  }) {
    const res = await fetch('/api/leads/simulate-lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  // Scrape images from website
  async scrapeImages(url: string) {
    const res = await fetch('/api/scrape-images', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to scrape images');
    return data as { success: boolean; url: string; images: string[]; notice?: string };
  },

  // Generate Ad Copy
  async generateAdCopy(params: {
    clientName: string;
    niche: string;
    offer: string;
    city: string;
    state?: string;
    variationSeed?: number;
  }): Promise<{ success: boolean; copies: GeneratedAdCopy[] }> {
    const res = await fetch('/api/gemini/copy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to generate ad copy');
    return data;
  },

  // Generate Ad Image
  async generateAdImage(params: {
    promptDescription: string;
    niche: string;
    format: '1:1' | '9:16';
  }) {
    const res = await fetch('/api/gemini/image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    return res.json() as Promise<{
      success: boolean;
      imageUrl: string;
      format: string;
      description: string;
      isGenerated?: boolean;
    }>;
  },

  // Weekly Report
  async getWeeklyReport(clientId: string) {
    const res = await fetch(`/api/weekly-report/${clientId}`);
    if (!res.ok) throw new Error('Failed to fetch report');
    return res.json();
  },

  async toggleWeeklyReport(clientId: string, enabled: boolean) {
    const res = await fetch(`/api/weekly-report/${clientId}/toggle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enabled }),
    });
    return res.json();
  }
};
