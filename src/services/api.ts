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
  AdDetailData,
  GeoLocationSearchResult,
  SpecialAdCategory,
  AdGoalType
} from '../types';
import { getCurrentIdToken } from './firebase';

let cachedClientPinToken: string | null = null;
export function setClientSessionPin(token: string | null) {
  cachedClientPinToken = token;
}

async function getHeaders(customHeaders: Record<string, string> = {}): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...customHeaders,
  };

  const idToken = await getCurrentIdToken();
  if (idToken) {
    headers['Authorization'] = `Bearer ${idToken}`;
  } else if (cachedClientPinToken) {
    headers['X-Client-Access-Token'] = cachedClientPinToken;
  }

  return headers;
}

export const api = {
  // System Status & Meta Config
  async getStatus() {
    const headers = await getHeaders();
    const res = await fetch('/api/status', { headers });
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
      isFirestoreActive: boolean;
      lastCacheRefresh?: string;
    }>;
  },

  async updateMetaToken(token: string, liveMode: boolean) {
    const headers = await getHeaders();
    const res = await fetch('/api/meta/token', {
      method: 'POST',
      headers,
      body: JSON.stringify({ token, liveMode }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update token');
    return data;
  },

  async toggleDemoMode(liveMode: boolean) {
    const headers = await getHeaders();
    const res = await fetch('/api/settings/toggle-demo', {
      method: 'POST',
      headers,
      body: JSON.stringify({ liveMode }),
    });
    return res.json();
  },

  async testConnection(): Promise<{ success: boolean; mode: string; steps: ConnectionCheckStep[] }> {
    const headers = await getHeaders();
    const res = await fetch('/api/meta/test-connection', {
      method: 'POST',
      headers,
    });
    const data = await res.json();
    if (!res.ok && !data.steps) throw new Error(data.error || 'Connection check failed');
    return data;
  },

  async getMetaResources() {
    const headers = await getHeaders();
    const res = await fetch('/api/meta/resources', { headers });
    if (!res.ok) throw new Error('Failed to fetch Meta resources');
    return res.json() as Promise<{
      adAccounts: MetaAdAccount[];
      pages: MetaPage[];
    }>;
  },

  // Location Search (Meta Targeting Search API)
  async searchLocations(q: string): Promise<GeoLocationSearchResult[]> {
    if (!q || q.trim().length < 2) return [];
    const headers = await getHeaders();
    const res = await fetch(`/api/meta/search-locations?q=${encodeURIComponent(q.trim())}`, { headers });
    if (!res.ok) return [];
    const data = await res.json();
    return data.locations || [];
  },

  // Clients
  async getClients() {
    const headers = await getHeaders();
    const res = await fetch('/api/clients', { headers });
    if (!res.ok) throw new Error('Failed to fetch clients');
    return res.json() as Promise<Client[]>;
  },

  async createClient(clientData: Partial<Client>) {
    const headers = await getHeaders();
    const res = await fetch('/api/clients', {
      method: 'POST',
      headers,
      body: JSON.stringify(clientData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to save client');
    return data as Client;
  },

  async updateClient(id: string, clientData: Partial<Client>) {
    const headers = await getHeaders();
    const res = await fetch(`/api/clients/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(clientData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update client');
    return data as Client;
  },

  async saveClient(clientData: Partial<Client>) {
    const headers = await getHeaders();
    const res = await fetch('/api/clients', {
      method: 'POST',
      headers,
      body: JSON.stringify(clientData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to save client');
    return data as Client;
  },

  async deleteClient(id: string) {
    const headers = await getHeaders();
    const res = await fetch(`/api/clients/${id}`, {
      method: 'DELETE',
      headers,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to delete client');
    return data;
  },

  async exportClients() {
    const headers = await getHeaders();
    const res = await fetch('/api/clients/export', { headers });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to export clients');
    }
    return res.json() as Promise<{ version: string; exportedAt: string; clientCount: number; clients: Client[] }>;
  },

  async importClients(clients: Partial<Client>[]) {
    const headers = await getHeaders();
    const res = await fetch('/api/clients/import', {
      method: 'POST',
      headers,
      body: JSON.stringify({ clients }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to import clients');
    return data as { success: boolean; message: string; count: number; added: number; updated: number; clients: Client[] };
  },

  async simulateLead(payload: { 
    clientId: string; 
    adId?: string; 
    fullName?: string; 
    phone?: string; 
    email?: string; 
    customAnswers?: Record<string, string>;
  }) {
    const headers = await getHeaders();
    const res = await fetch('/api/leads/simulate-lead', {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to simulate lead');
    return data;
  },

  async getCampaigns(clientId?: string) {
    const headers = await getHeaders();
    const query = clientId && clientId !== 'all' ? `?clientId=${clientId}` : '';
    const res = await fetch(`/api/campaigns${query}`, { headers });
    if (!res.ok) throw new Error('Failed to fetch campaigns');
    return res.json();
  },

  async verifyClientPortalPin(clientId: string, pin: string) {
    const res = await fetch('/api/clients/portal-auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientId, pin }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Invalid client access code');
    return data as { success: boolean; token: string; client: Client };
  },

  async resetClientAccessCode(clientId: string) {
    const headers = await getHeaders();
    const res = await fetch(`/api/clients/${clientId}/reset-code`, {
      method: 'POST',
      headers,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to reset client access code');
    return data as { success: boolean; clientAccessCode: string; client: Client };
  },

  // Insights / Performance Stats
  async getInsights(clientId: string = 'all', dateRange: string = '30d') {
    const headers = await getHeaders();
    const res = await fetch(`/api/insights?clientId=${clientId}&dateRange=${dateRange}`, { headers });
    if (!res.ok) throw new Error('Failed to fetch insights');
    return res.json() as Promise<{
      summary: InsightsData;
      adStats: any[];
      attentionItems: any[];
    }>;
  },

  // Ad Detail
  async getAdDetail(adId: string): Promise<AdDetailData> {
    const headers = await getHeaders();
    const res = await fetch(`/api/ads/${adId}`, { headers });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to load ad detail');
    return data;
  },

  // Edit Ad
  async editAd(adId: string, payload: {
    dailyBudget?: number;
    startDate?: string;
    endDate?: string;
    city?: string;
    radiusMiles?: number;
    locationType?: string;
    locationKey?: string;
    latitude?: number;
    longitude?: number;
    stateKey?: string;
    minAge?: number;
    maxAge?: number;
    genders?: 'ALL' | 'MEN' | 'WOMEN';
    placements?: string[];
    primaryText?: string;
    headline?: string;
    description?: string;
    callToAction?: string;
    imageUrl?: string;
    imageFormat?: '1:1' | '9:16';
    goalType?: AdGoalType;
    specialCategory?: SpecialAdCategory;
    websiteUrl?: string;
    formQuestions?: string[];
    privacyPolicyUrl?: string;
    thankYouPhone?: string;
    thankYouMessage?: string;
  }) {
    const headers = await getHeaders();
    const res = await fetch(`/api/ads/${adId}/edit`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update ad');
    return data;
  },

  // Delete Ad
  async deleteAd(adId: string) {
    const headers = await getHeaders();
    const res = await fetch(`/api/ads/${adId}`, {
      method: 'DELETE',
      headers,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to delete ad');
    return data;
  },

  // Leads
  async getLeads(clientId: string = 'all') {
    const headers = await getHeaders();
    const res = await fetch(`/api/leads?clientId=${clientId}`, { headers });
    if (!res.ok) throw new Error('Failed to fetch leads');
    return res.json() as Promise<LeadRecord[]>;
  },

  async syncLiveLeads() {
    const headers = await getHeaders();
    const res = await fetch('/api/leads/sync-now', {
      method: 'POST',
      headers,
    });
    return res.json();
  },

  // Launch Staged Campaign
  async createCampaign(payload: {
    clientId: string;
    offerTitle: string;
    primaryText: string;
    headline: string;
    description: string;
    callToAction: string;
    imageUrl: string;
    imageFormat: '1:1' | '9:16';
    city: string;
    state?: string;
    radiusMiles: number;
    locationType?: string;
    locationKey?: string;
    latitude?: number;
    longitude?: number;
    stateKey?: string;
    minAge: number;
    maxAge: number;
    genders: 'ALL' | 'MEN' | 'WOMEN';
    placements: string[];
    dailyBudget: number;
    goalType?: AdGoalType;
    specialCategory?: SpecialAdCategory;
    websiteUrl?: string;
    formQuestions?: string[];
    privacyPolicyUrl?: string;
    thankYouPhone?: string;
    thankYouMessage?: string;
  }) {
    const headers = await getHeaders();
    const res = await fetch('/api/campaigns/create', {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      const err: any = new Error(data.error || 'Campaign staging failed');
      err.failedStep = data.failedStep;
      err.metaError = data.metaError;
      err.details = data;
      throw err;
    }
    return data;
  },

  // Activate Campaign (Go Live)
  async goLive(campaignId: string) {
    const headers = await getHeaders();
    const res = await fetch(`/api/campaigns/${campaignId}/golive`, {
      method: 'POST',
      headers,
    });
    const data = await res.json();
    if (!res.ok) {
      const err: any = new Error(data.error || 'Failed to set campaign live on Meta');
      err.metaError = data.metaError;
      err.details = data;
      throw err;
    }
    return data;
  },

  // Toggle item status
  async toggleItemStatus(id: string, type: 'campaign' | 'adSet' | 'ad', status: 'ACTIVE' | 'PAUSED') {
    const headers = await getHeaders();
    const res = await fetch('/api/actions/status', {
      method: 'POST',
      headers,
      body: JSON.stringify({ id, type, status }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update status');
    return data;
  },

  // Duplicate item
  async duplicateItem(id: string, type: 'ad' | 'campaign') {
    const headers = await getHeaders();
    const res = await fetch('/api/actions/duplicate', {
      method: 'POST',
      headers,
      body: JSON.stringify({ id, type }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to duplicate item');
    return data;
  },

  // Archive item
  async archiveItem(id: string, type: 'ad' | 'campaign') {
    const headers = await getHeaders();
    const res = await fetch('/api/actions/archive', {
      method: 'POST',
      headers,
      body: JSON.stringify({ id, type }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to archive item');
    return data;
  },

  // Update budget
  async updateBudget(adSetId: string, dailyBudget: number) {
    const headers = await getHeaders();
    const res = await fetch('/api/actions/budget', {
      method: 'POST',
      headers,
      body: JSON.stringify({ adSetId, dailyBudget }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update budget');
    return data;
  },

  // Scrape images from client website
  async scrapeImages(url: string) {
    const headers = await getHeaders();
    const res = await fetch('/api/tools/scrape-images', {
      method: 'POST',
      headers,
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
    const headers = await getHeaders();
    const res = await fetch('/api/gemini/copy', {
      method: 'POST',
      headers,
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
    const headers = await getHeaders();
    const res = await fetch('/api/gemini/image', {
      method: 'POST',
      headers,
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
    const headers = await getHeaders();
    const res = await fetch(`/api/weekly-report/${clientId}`, { headers });
    if (!res.ok) throw new Error('Failed to fetch report');
    return res.json();
  },

  async toggleWeeklyReport(clientId: string, enabled: boolean) {
    const headers = await getHeaders();
    const res = await fetch(`/api/weekly-report/${clientId}/toggle`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ enabled }),
    });
    return res.json();
  }
};
