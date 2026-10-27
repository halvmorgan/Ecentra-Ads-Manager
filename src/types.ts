export type NicheType = 
  | 'med_spa' 
  | 'water_mold' 
  | 'solar' 
  | 'remodeling' 
  | 'home_services' 
  | 'other';

export interface Client {
  id: string;
  businessName: string;
  niche: NicheType;
  websiteUrl: string;
  serviceArea: {
    city: string;
    state: string;
    radiusMiles: number;
  };
  phone: string;
  ghlConfig: {
    locationId: string;
    apiKeyMasked?: string;
    apiKey?: string;
    hasApiKey: boolean;
    syncEnabled: boolean;
  };
  alertEmail: string;
  alertPhone: string;
  linkedMeta: {
    adAccountId?: string;
    adAccountName?: string;
    pageId?: string;
    pageName?: string;
    instagramId?: string;
    instagramUsername?: string;
  };
  monthlyBudget: number;
  targetCpl: number; // Target Cost Per Lead in USD
  weeklyReportEnabled: boolean;
  createdAt: string;
  notes?: string;
}

export type AdStatus = 
  | 'ACTIVE' 
  | 'PAUSED' 
  | 'IN_REVIEW' 
  | 'REJECTED' 
  | 'ARCHIVED' 
  | 'LEARNING' 
  | 'LIMITED' 
  | 'WITH_ISSUES';

export interface Campaign {
  id: string;
  clientId: string;
  name: string;
  objective: 'OUTCOME_LEADS';
  status: 'ACTIVE' | 'PAUSED' | 'ARCHIVED';
  dailyBudget: number;
  createdAt: string;
  metaCampaignId?: string;
}

export interface AdSet {
  id: string;
  campaignId: string;
  clientId: string;
  name: string;
  status: 'ACTIVE' | 'PAUSED' | 'ARCHIVED';
  dailyBudget: number;
  startDate?: string;
  endDate?: string;
  targeting: {
    city: string;
    radiusMiles: number;
    minAge: number;
    maxAge: number;
    genders: 'ALL' | 'MEN' | 'WOMEN';
    placements: string[]; // ['facebook_feed', 'instagram_feed', 'stories_reels']
  };
  metaAdSetId?: string;
}

export interface AdCreative {
  id: string;
  adSetId: string;
  campaignId: string;
  clientId: string;
  name: string;
  status: AdStatus;
  rejectionReason?: string;
  primaryText: string;
  headline: string;
  description: string;
  callToAction: 'GET_QUOTE' | 'LEARN_MORE' | 'BOOK_NOW' | 'SIGN_UP' | 'CONTACT_US';
  imageUrl: string;
  imageFormat: '1:1' | '9:16';
  imageHash?: string;
  formId?: string;
  formName?: string;
  metaCreativeId?: string;
  metaAdId?: string;
  createdAt: string;
  effectiveStatus?: string;
}

export interface InstantForm {
  id: string;
  clientId: string;
  name: string;
  introText?: string;
  questions: string[]; // ['Full Name', 'Phone Number', 'Email', custom questions]
  privacyPolicyUrl: string;
  thankYouPhone: string;
  thankYouMessage: string;
  metaFormId?: string;
}

export interface LeadRecord {
  id: string;
  clientId: string;
  adId: string;
  adName: string;
  campaignName: string;
  fullName: string;
  phone: string;
  email: string;
  submittedAt: string;
  ghlContactId?: string;
  ghlSyncStatus: 'synced' | 'pending' | 'failed';
  customAnswers?: Record<string, string>;
  alertSent: boolean;
  metaLeadId?: string;
}

export interface DailyInsight {
  date: string;
  spend: number;
  leads: number;
  clicks: number;
  impressions: number;
  bookings: number;
}

export interface InsightsData {
  dateRange: string;
  spend: number;
  monthlyBudget: number;
  totalSpentToDate: number;
  budgetRemaining: number;
  leads: number;
  costPerLead: number;
  targetCpl: number;
  isCplOverTarget: boolean;
  bookings: number; // GoHighLevel appointments
  costPerBooking: number;
  clicks: number;
  ctr: number; // percentage
  impressions: number;
  reach: number;
  frequency: number;
  cpc: number;
  dailyBreakdown: DailyInsight[];
}

export interface MetaConnectionState {
  tokenMasked: string;
  hasToken: boolean;
  isValid: boolean;
  liveMode: boolean; // false = Demo Mode
  connectedAt?: string;
  businessManagerId?: string;
  businessManagerName?: string;
}

export interface MetaAdAccount {
  id: string;
  name: string;
  account_id: string;
  currency: string;
  account_status: number | string;
  has_payment_method?: boolean;
}

export interface MetaPage {
  id: string;
  name: string;
  pictureUrl?: string;
  leadgen_tos_accepted?: boolean;
  instagramAccount?: {
    id: string;
    username: string;
    name: string;
    profilePictureUrl?: string;
  };
}

export interface GeneratedAdCopy {
  id: string;
  versionLabel: string;
  primaryText: string;
  headline: string;
  description: string;
  callToAction: 'GET_QUOTE' | 'LEARN_MORE' | 'BOOK_NOW' | 'SIGN_UP' | 'CONTACT_US';
}

export interface ConnectionCheckStep {
  id: string;
  title: string;
  status: 'pending' | 'success' | 'failed' | 'warning';
  message: string;
  fix?: string;
  fixUrl?: string;
  details?: any;
}

export interface AdStatItem {
  adId: string;
  adName: string;
  clientName: string;
  clientId: string;
  status: AdStatus;
  rejectionReason?: string;
  spend: number;
  leads: number;
  cpl: number;
  last7DayCpl: number;
  targetCpl: number;
  isOverTarget: boolean;
  clicks: number;
  ctr: number;
  imageUrl: string;
  headline: string;
  effectiveStatus?: string;
  metaAdId?: string;
  campaignId?: string;
  adSetId?: string;
}

export interface AdDetailData {
  ad: AdCreative;
  campaign?: Campaign;
  adSet?: AdSet;
  client?: Client;
  stats: AdStatItem;
  dailyInsights: DailyInsight[];
  leads: LeadRecord[];
  previewHtml?: string;
}
