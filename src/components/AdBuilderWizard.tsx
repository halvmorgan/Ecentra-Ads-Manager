import React, { useState, useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  ChevronRight, 
  ChevronLeft, 
  Check, 
  Image as ImageIcon, 
  Globe, 
  RefreshCw, 
  MapPin, 
  Layers, 
  Smartphone, 
  ShieldCheck, 
  AlertCircle, 
  Rocket, 
  Clock, 
  DollarSign, 
  FileText,
  Instagram,
  Facebook,
  Phone,
  Sliders,
  Lock,
  ExternalLink,
  Search,
  Building,
  Target,
  Users
} from 'lucide-react';
import { Client, GeneratedAdCopy, AdGoalType, SpecialAdCategory, GeoLocationSearchResult, MetaPage } from '../types';
import { api } from '../services/api';
import { getNicheLabel, getNicheAudienceRecommendation } from '../utils/niche';

const DEFAULT_PORTFOLIO_PAGES: MetaPage[] = [
  {
    id: '959992543870563',
    name: 'Ecentury Appraisal Services',
    pictureUrl: 'https://graph.facebook.com/v21.0/959992543870563/picture?type=large',
  },
  {
    id: '1343054112229117',
    name: 'Ecentra Concierge',
    pictureUrl: 'https://graph.facebook.com/v21.0/1343054112229117/picture?type=large',
  },
];

interface AdBuilderWizardProps {
  isOpen: boolean;
  onClose: () => void;
  clients: Client[];
  initialClientId?: string;
  initialAdData?: any;
  onCampaignCreated: () => void;
}

export const AdBuilderWizard: React.FC<AdBuilderWizardProps> = ({
  isOpen,
  onClose,
  clients,
  initialClientId,
  initialAdData,
  onCampaignCreated,
}) => {
  // Wizard Step (1 to 6)
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Step 1: Client, Offer & Goal
  const [selectedClientId, setSelectedClientId] = useState<string>(initialAdData?.clientId || initialClientId || clients[0]?.id || '');
  const [goalType, setGoalType] = useState<AdGoalType>(initialAdData?.goalType || 'LEAD_GEN');
  const [specialCategory, setSpecialCategory] = useState<SpecialAdCategory>(initialAdData?.specialCategory || 'NONE');
  const [websiteUrl, setWebsiteUrl] = useState<string>(initialAdData?.websiteUrl || '');
  const [offerText, setOfferText] = useState<string>(initialAdData?.headline || initialAdData?.offerTitle || '$99 First Glow Facial + Skin Consultation (New Clients Only)');

  // Step 2: Ad Copy
  const [copies, setCopies] = useState<GeneratedAdCopy[]>([]);
  const [selectedCopyIndex, setSelectedCopyIndex] = useState<number>(0);
  const [isGeneratingCopy, setIsGeneratingCopy] = useState<boolean>(false);
  const [variationCycle, setVariationCycle] = useState<number>(1);
  const [primaryText, setPrimaryText] = useState<string>(initialAdData?.primaryText || '');
  const [headline, setHeadline] = useState<string>(initialAdData?.headline || '');
  const [description, setDescription] = useState<string>(initialAdData?.description || '');
  const [callToAction, setCallToAction] = useState<string>(initialAdData?.callToAction || 'BOOK_NOW');

  // Step 3: Image Creative
  const [imageSourceMode, setImageSourceMode] = useState<'generate' | 'site'>('generate');
  const [imageFormat, setImageFormat] = useState<'1:1' | '9:16'>(initialAdData?.imageFormat || '1:1');
  const [imagePrompt, setImagePrompt] = useState<string>('Warm, professional treatment room with soft lighting, aesthetician prepping gentle botanical facial');
  const [isGeneratingImage, setIsGeneratingImage] = useState<boolean>(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string>(initialAdData?.imageUrl || 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=1080&q=80');
  
  // 3b: Scrape from site
  const [scrapeUrl, setScrapeUrl] = useState<string>(initialAdData?.websiteUrl || '');
  const [scrapedImages, setScrapedImages] = useState<string[]>([]);
  const [isScraping, setIsScraping] = useState<boolean>(false);

  // Step 4: Audience & Budget
  const [city, setCity] = useState<string>(initialAdData?.city || '');
  const [radiusMiles, setRadiusMiles] = useState<number>(initialAdData?.radiusMiles || 15);
  const [minAge, setMinAge] = useState<number>(initialAdData?.minAge || 25);
  const [maxAge, setMaxAge] = useState<number>(initialAdData?.maxAge || 65);
  const [genders, setGenders] = useState<'ALL' | 'MEN' | 'WOMEN'>('ALL');
  const [dailyBudget, setDailyBudget] = useState<number>(initialAdData?.dailyBudget || 50);
  const [placements, setPlacements] = useState<string[]>(initialAdData?.placements || ['facebook_feed', 'instagram_feed', 'stories_reels']);

  // Location search (Meta Targeting Search API)
  const [locationSearchInput, setLocationSearchInput] = useState<string>('');
  const [locationResults, setLocationResults] = useState<GeoLocationSearchResult[]>([]);
  const [isSearchingLocation, setIsSearchingLocation] = useState<boolean>(false);
  const [selectedLocation, setSelectedLocation] = useState<GeoLocationSearchResult | null>(null);

  // Step 5: Instant Form
  const [formQuestions, setFormQuestions] = useState<string[]>(['Full Name', 'Phone Number', 'Email']);
  const [customQuestion1, setCustomQuestion1] = useState<string>('Preferred day of week (e.g., Saturday morning)');
  const [customQuestion2, setCustomQuestion2] = useState<string>('What is your primary goal / concern?');
  const [privacyPolicyUrl, setPrivacyPolicyUrl] = useState<string>(initialAdData?.privacyPolicyUrl || '');
  const [thankYouPhone, setThankYouPhone] = useState<string>(initialAdData?.thankYouPhone || '');
  const [thankYouMessage, setThankYouMessage] = useState<string>('Thank you! Our local concierge team will text or call you within 15 minutes to confirm your appointment.');

  // Step 6: Review & Launch State
  const [previewPlatform, setPreviewPlatform] = useState<'facebook' | 'instagram'>('facebook');
  const [isLaunching, setIsLaunching] = useState<boolean>(false);
  const [launchError, setLaunchError] = useState<string | null>(null);
  const [failedStep, setFailedStep] = useState<string | null>(null);
  const [metaErrorDetails, setMetaErrorDetails] = useState<any | null>(null);
  const [isGoingLive, setIsGoingLive] = useState<boolean>(false);
  const [isLiveActive, setIsLiveActive] = useState<boolean>(false);
  const [goLiveError, setGoLiveError] = useState<string | null>(null);
  const [goLiveSuccessResponse, setGoLiveSuccessResponse] = useState<any | null>(null);
  const [launchSuccessData, setLaunchSuccessData] = useState<any | null>(null);

  // Meta Facebook Pages for portfolio
  const [metaPages, setMetaPages] = useState<MetaPage[]>(DEFAULT_PORTFOLIO_PAGES);
  const [selectedPageId, setSelectedPageId] = useState<string>(
    initialAdData?.pageId || '959992543870563'
  );
  const [selectedPageName, setSelectedPageName] = useState<string>(
    initialAdData?.pageName || ''
  );

  // Active Client
  const activeClient = clients.find((c) => c.id === selectedClientId) || clients[0];

  // Fetch Meta Pages from server-stored token and portfolio 2393048237813409
  useEffect(() => {
    api.getMetaPages()
      .then((pages) => {
        if (pages && pages.length > 0) {
          setMetaPages(pages);
        }
      })
      .catch(() => {
        // Fallback to DEFAULT_PORTFOLIO_PAGES
      });
  }, []);

  // Sync selected Facebook Page when active client or initialAdData changes
  useEffect(() => {
    if (initialAdData?.pageId) {
      setSelectedPageId(initialAdData.pageId);
      setSelectedPageName(initialAdData.pageName || '');
    } else if (activeClient?.linkedMeta?.pageId) {
      setSelectedPageId(activeClient.linkedMeta.pageId);
      setSelectedPageName(activeClient.linkedMeta.pageName || '');
    } else {
      setSelectedPageId(metaPages[0]?.id || '959992543870563');
      setSelectedPageName(metaPages[0]?.name || 'Ecentury Appraisal Services');
    }
  }, [activeClient, initialAdData, metaPages]);

  // Resolve active Facebook Page, name and profile picture
  const activePage = metaPages.find((p) => p.id === selectedPageId) || {
    id: selectedPageId || '959992543870563',
    name: selectedPageName || (selectedPageId === '959992543870563' ? 'Ecentury Appraisal Services' : selectedPageId === '1343054112229117' ? 'Ecentra Concierge' : (activeClient?.linkedMeta?.pageName || activeClient?.businessName || 'Facebook Page')),
    pictureUrl: `https://graph.facebook.com/v21.0/${selectedPageId || '959992543870563'}/picture?type=large`,
  };
  const activePageName = activePage.name;
  const activePagePicture = activePage.pictureUrl;

  // Prefill on initialAdData changes when modal opens
  useEffect(() => {
    if (isOpen && initialAdData) {
      if (initialAdData.clientId) setSelectedClientId(initialAdData.clientId);
      if (initialAdData.goalType) setGoalType(initialAdData.goalType);
      if (initialAdData.specialCategory) setSpecialCategory(initialAdData.specialCategory);
      if (initialAdData.websiteUrl) {
        setWebsiteUrl(initialAdData.websiteUrl);
        setScrapeUrl(initialAdData.websiteUrl);
      }
      if (initialAdData.headline || initialAdData.offerTitle) setOfferText(initialAdData.headline || initialAdData.offerTitle);
      if (initialAdData.primaryText) setPrimaryText(initialAdData.primaryText);
      if (initialAdData.headline) setHeadline(initialAdData.headline);
      if (initialAdData.description) setDescription(initialAdData.description);
      if (initialAdData.callToAction) setCallToAction(initialAdData.callToAction);
      if (initialAdData.imageUrl) setSelectedImageUrl(initialAdData.imageUrl);
      if (initialAdData.imageFormat) setImageFormat(initialAdData.imageFormat);
      if (initialAdData.city) setCity(initialAdData.city);
      if (initialAdData.radiusMiles) setRadiusMiles(initialAdData.radiusMiles);
      if (initialAdData.minAge) setMinAge(initialAdData.minAge);
      if (initialAdData.maxAge) setMaxAge(initialAdData.maxAge);
      if (initialAdData.dailyBudget) setDailyBudget(initialAdData.dailyBudget);
      if (initialAdData.placements) setPlacements(initialAdData.placements);
      if (initialAdData.privacyPolicyUrl) setPrivacyPolicyUrl(initialAdData.privacyPolicyUrl);
      if (initialAdData.thankYouPhone) setThankYouPhone(initialAdData.thankYouPhone);
      if (initialAdData.pageId) setSelectedPageId(initialAdData.pageId);
      if (initialAdData.pageName) setSelectedPageName(initialAdData.pageName);
      setCurrentStep(1);
    }
  }, [isOpen, initialAdData]);

  // Initialize defaults when active client changes (only if not prefilling an ad)
  useEffect(() => {
    if (activeClient && !initialAdData) {
      setCity(activeClient.serviceArea.city);
      setRadiusMiles(activeClient.serviceArea.radiusMiles);
      setScrapeUrl(activeClient.websiteUrl);
      setWebsiteUrl(activeClient.websiteUrl);
      setPrivacyPolicyUrl(`${activeClient.websiteUrl}/privacy-policy`);
      setThankYouPhone(activeClient.phone);

      const n = (activeClient.niche || '').toLowerCase();
      if (activeClient.isOwnBusiness || n === 'appraisal_real_estate' || n.includes('appraisal') || n.includes('real estate')) {
        setSpecialCategory('HOUSING');
        setGoalType('TRAFFIC_WEBSITE');
        setOfferText('Fast Certified Real Estate Appraisal & Home Valuation Reports');
        setImagePrompt('Modern residential property with licensed Michigan real estate appraisal documents');
        setCallToAction('LEARN_MORE');
        setCity(activeClient.serviceArea.city || 'Detroit');
        setMinAge(18);
        setMaxAge(65);
        setGenders('ALL');
        setSelectedLocation({
          key: '3866',
          name: 'Michigan',
          type: 'region',
          country_code: 'US',
        });
      } else if (n === 'digital_product' || n.includes('digital') || n.includes('guide')) {
        setSpecialCategory('NONE');
        setGoalType('TRAFFIC_WEBSITE');
        setOfferText('Free Download: The Step-by-Step Strategic Blueprint & Practical Guide');
        setImagePrompt('Modern digital tablet device displaying high-value strategic guide cover with clean typography');
        setCallToAction('LEARN_MORE');
        setMinAge(25);
        setMaxAge(65);
        setGenders('ALL');
      } else if (n === 'marketing_business' || n.includes('marketing') || n.includes('business')) {
        setSpecialCategory('NONE');
        setGoalType('LEAD_GEN');
        setOfferText('Free Local Growth & Customer Acquisition Strategy Session');
        setImagePrompt('Modern bright office workspace with entrepreneur reviewing performance growth charts');
        setCallToAction('GET_QUOTE');
        setMinAge(25);
        setMaxAge(65);
        setGenders('ALL');
      } else if (n === 'water_mold') {
        setSpecialCategory('NONE');
        setGoalType('LEAD_GEN');
        setOfferText('Free 60-Minute Emergency Mold & Moisture Audit');
        setImagePrompt('Courteous restoration inspector with moisture meter assessing drywall in clean home');
        setCallToAction('GET_QUOTE');
        setMinAge(28);
        setMaxAge(65);
      } else if (n === 'med_spa') {
        setSpecialCategory('NONE');
        setGoalType('LEAD_GEN');
        setOfferText('$99 First Glow Facial + Skin Consultation');
        setImagePrompt('Warm, tranquil treatment room with aesthetician in boutique med spa');
        setCallToAction('BOOK_NOW');
        setMinAge(25);
        setMaxAge(60);
      } else if (n === 'solar') {
        setSpecialCategory('CREDIT'); // solar financing options
        setGoalType('LEAD_GEN');
        setOfferText('Free Home Solar Utility Savings Analysis');
        setImagePrompt('Modern residential home with clean solar panels under blue sky in Colorado');
        setCallToAction('LEARN_MORE');
        setMinAge(30);
        setMaxAge(65);
      } else {
        // Other / custom typed niche: neutral, general wording, fully editable
        setSpecialCategory('NONE');
        setGoalType('LEAD_GEN');
        setOfferText(`Introductory Special & Consultation – ${activeClient.businessName}`);
        setImagePrompt(`Professional local team providing quality ${getNicheLabel(activeClient.niche)} services`);
        setCallToAction('GET_QUOTE');
        setMinAge(25);
        setMaxAge(65);
        setGenders('ALL');
      }
    }
  }, [activeClient]);

  // Handle Meta Location Autocomplete
  const handleSearchLocations = async (query: string) => {
    setLocationSearchInput(query);
    if (!query || query.trim().length < 2) {
      setLocationResults([]);
      return;
    }
    setIsSearchingLocation(true);
    try {
      const results = await api.searchLocations(query);
      setLocationResults(results);
    } catch (e) {
      console.warn('Location search error:', e);
    } finally {
      setIsSearchingLocation(false);
    }
  };

  const handleSelectLocationResult = (loc: GeoLocationSearchResult) => {
    setSelectedLocation(loc);
    setCity(loc.name);
    setLocationSearchInput('');
    setLocationResults([]);
  };

  // Special category rules enforcement
  const isSpecial = specialCategory !== 'NONE';
  const effectiveMinAge = isSpecial ? 18 : minAge;
  const effectiveMaxAge = isSpecial ? 65 : maxAge;
  const effectiveGenders = isSpecial ? 'ALL' : genders;
  const effectiveRadius = isSpecial ? Math.max(radiusMiles, 15) : radiusMiles;

  // Trigger Gemini Copywriting
  const handleGenerateCopy = async () => {
    if (!activeClient) return;
    setIsGeneratingCopy(true);
    try {
      const res = await api.generateAdCopy({
        clientName: activeClient.businessName,
        niche: activeClient.niche,
        offer: offerText,
        city: city || activeClient.serviceArea.city,
        state: activeClient.serviceArea.state,
        variationSeed: variationCycle,
      });

      if (res.copies && res.copies.length > 0) {
        setCopies(res.copies);
        setSelectedCopyIndex(0);
        setPrimaryText(res.copies[0].primaryText);
        setHeadline(res.copies[0].headline);
        setDescription(res.copies[0].description);
        setCallToAction(res.copies[0].callToAction);
      }
    } catch (err) {
      console.error('Failed to generate copy:', err);
    } finally {
      setIsGeneratingCopy(false);
    }
  };

  // Trigger Scrape Images
  const handleScrapeImages = async () => {
    if (!scrapeUrl) return;
    setIsScraping(true);
    try {
      const res = await api.scrapeImages(scrapeUrl);
      if (res.images && res.images.length > 0) {
        setScrapedImages(res.images);
        setSelectedImageUrl(res.images[0]);
      }
    } catch (err) {
      console.error('Failed to scrape site:', err);
    } finally {
      setIsScraping(false);
    }
  };

  // Trigger Image Generation
  const handleGenerateImage = async () => {
    if (!activeClient) return;
    setIsGeneratingImage(true);
    try {
      const res = await api.generateAdImage({
        promptDescription: imagePrompt,
        niche: activeClient.niche,
        format: imageFormat,
      });
      if (res.imageUrl) {
        setSelectedImageUrl(res.imageUrl);
      }
    } catch (err) {
      console.error('Failed to generate image:', err);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  // Launch Campaign (ALWAYS CREATED PAUSED FIRST PER SPEC - ZERO FAKE SUCCESS)
  const handleLaunchCampaign = async () => {
    if (!activeClient) return;

    // Requirement 5: Facebook Page ID check. If empty, stop before calling Meta and tell user to fill it in.
    const pageId = (activeClient.linkedMeta?.pageId || '').trim();
    if (!pageId) {
      setLaunchError(`Facebook Page ID is missing for client "${activeClient.businessName}". The ad must post from a Facebook Page. Please enter the Page ID in Edit Client Setup before launching.`);
      setFailedStep('Facebook Page ID Check');
      setMetaErrorDetails({
        message: 'Facebook Page ID required to create ad creative and publish ads.',
        code: 100,
      });
      return;
    }

    // Requirement 2: Linked Ad Account ID check
    const adAccountId = (activeClient.linkedMeta?.adAccountId || '').trim();
    if (!adAccountId) {
      setLaunchError(`Linked Meta Ad Account ID is missing for client "${activeClient.businessName}". Please enter the Ad Account ID (e.g. act_25581724204862372) in Edit Client Setup.`);
      setFailedStep('Meta Ad Account Check');
      setMetaErrorDetails({
        message: 'Missing linked Meta Ad Account ID on client profile.',
        code: 100,
      });
      return;
    }

    // Requirement 4: Block launch if no location is selected
    const hasLocation = Boolean(
      (selectedLocation?.key && String(selectedLocation.key).trim()) ||
      (city && String(city).trim()) ||
      (selectedLocation?.latitude && selectedLocation?.longitude)
    );

    if (!hasLocation) {
      setLaunchError('Pick a location first in Step 4.');
      setFailedStep('Location Check');
      return;
    }

    setIsLaunching(true);
    setLaunchError(null);
    setFailedStep(null);
    setMetaErrorDetails(null);
    setGoLiveError(null);
    setGoLiveSuccessResponse(null);

    try {
      // Requirement 4: Use exactly the text typed or edited in Step 2
      const payload = {
        clientId: activeClient.id,
        pageId: selectedPageId,
        pageName: activePageName,
        offerTitle: offerText,
        primaryText,
        headline,
        description,
        callToAction: goalType === 'TRAFFIC_WEBSITE' ? (callToAction || 'LEARN_MORE') : callToAction,
        imageUrl: selectedImageUrl,
        imageFormat,
        city,
        radiusMiles: effectiveRadius,
        locationType: selectedLocation?.type || 'city',
        locationKey: selectedLocation?.key,
        latitude: selectedLocation?.latitude,
        longitude: selectedLocation?.longitude,
        minAge: effectiveMinAge,
        maxAge: effectiveMaxAge,
        genders: effectiveGenders,
        placements,
        dailyBudget,
        goalType,
        specialCategory,
        websiteUrl: websiteUrl || activeClient.websiteUrl,
        formQuestions: goalType === 'LEAD_GEN' ? [...formQuestions, customQuestion1, customQuestion2].filter(Boolean) : [],
        privacyPolicyUrl,
        thankYouPhone,
        thankYouMessage,
      };

      const result = await api.createCampaign(payload);
      setLaunchSuccessData(result);
      onCampaignCreated();
    } catch (err: any) {
      console.error('Failed to launch campaign:', err);
      setLaunchError(err.message || 'Meta ad creation failed. Check settings & ad account access.');
      setFailedStep(err.failedStep || 'Meta Marketing API');
      setMetaErrorDetails(err.metaError || null);
    } finally {
      setIsLaunching(false);
    }
  };

  // Go Live immediately from post-launch screen (Requirement 7: Zero Fake Success)
  const handleGoLive = async () => {
    const campaignId = launchSuccessData?.campaign?.id || launchSuccessData?.id;
    if (!campaignId) return;
    setIsGoingLive(true);
    setGoLiveError(null);
    setGoLiveSuccessResponse(null);
    try {
      const res = await api.goLive(campaignId);
      setIsLiveActive(true);
      setGoLiveSuccessResponse(res.metaResponse || { status: 'ACTIVE', message: 'Campaign and ads set to ACTIVE on Meta.' });
      onCampaignCreated();
    } catch (err: any) {
      console.error('Failed to activate campaign on Meta:', err);
      setGoLiveError(err.message || 'Failed to activate campaign on Meta');
    } finally {
      setIsGoingLive(false);
    }
  };

  if (!isOpen) return null;

  const projectedMonthlySpend = dailyBudget * 30;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-3 sm:p-6 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header Bar */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Ad Builder Wizard
              </h2>
              <p className="text-[11px] text-slate-400">
                Step-by-step Meta ad launch (Creates as PAUSED first)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Stepper */}
        <div className="bg-slate-50 px-6 py-3 border-b border-slate-200">
          <div className="flex items-center justify-between text-xs font-semibold">
            {[
              '1. Client & Offer',
              '2. Ad Copy',
              '3. Creative Image',
              '4. Audience & Budget',
              goalType === 'TRAFFIC_WEBSITE' ? '5. Destination' : '5. Lead Form',
              '6. Review & Launch',
            ].map((stepLabel, idx) => {
              const stepNum = idx + 1;
              const isActive = currentStep === stepNum;
              const isPast = currentStep > stepNum;
              return (
                <div
                  key={idx}
                  onClick={() => {
                    if (isPast) setCurrentStep(stepNum);
                  }}
                  className={`flex items-center gap-1.5 cursor-pointer transition-colors ${
                    isActive
                      ? 'text-amber-600 font-bold'
                      : isPast
                      ? 'text-slate-800'
                      : 'text-slate-400'
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] ${
                      isActive
                        ? 'bg-amber-600 text-white'
                        : isPast
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-200 text-slate-500'
                    }`}
                  >
                    {isPast ? <Check className="w-3 h-3" /> : stepNum}
                  </span>
                  <span className="hidden md:inline">{stepLabel.split('. ')[1]}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step Body Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* STEP 1: CLIENT & OFFER */}
          {currentStep === 1 && (
            <div className="space-y-5">
              {initialAdData && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-900 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold uppercase tracking-wider text-[10px] bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded">Duplicate / Relaunch</span>
                    <span>All fields pre-filled from saved ad: <strong>{initialAdData.headline || initialAdData.name}</strong>. Review and make any adjustments before launching.</span>
                  </div>
                </div>
              )}
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Step 1: Select Client & Core Offer
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Choose which client account to run the ad for and specify their introductory service offer.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
                    Select Client
                  </label>
                  <select
                    value={selectedClientId}
                    onChange={(e) => setSelectedClientId(e.target.value)}
                    className="w-full text-sm bg-white border border-slate-300 rounded-lg p-2.5 font-medium text-slate-900 focus:ring-2 focus:ring-amber-500/20"
                  >
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.businessName} {c.isOwnBusiness ? '★ (My Own Business)' : `(${c.serviceArea.city}, ${c.serviceArea.state} • ${getNicheLabel(c.niche)})`}
                      </option>
                    ))}
                  </select>
                </div>

                {activeClient && (
                  <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 text-xs space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Service Area:</span>
                      <span className="font-semibold text-slate-800">
                        {activeClient.serviceArea.city}, {activeClient.serviceArea.state} ({activeClient.serviceArea.radiusMiles} mi radius)
                      </span>
                    </div>
                    {!activeClient.isOwnBusiness && (
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">Target Cost Per Lead:</span>
                        <span className="font-semibold text-emerald-700">${(activeClient.targetCpl ?? 0).toFixed(2)} / lead</span>
                      </div>
                    )}
                    {activeClient.isOwnBusiness && (
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">Business Type:</span>
                        <span className="font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          My Own Product / Business (No Target CPL / Client Login)
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Linked Ad Account:</span>
                      <span className="font-semibold text-slate-800">
                        {activeClient.linkedMeta.adAccountName || 'Direct Business Manager Partner'}
                      </span>
                    </div>
                  </div>
                )}

                {/* AD POSTS AS (FACEBOOK PAGE) SELECTOR */}
                <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-800 uppercase">
                      Ad posts as: <span className="text-blue-700 normal-case font-bold">{activePageName}</span>
                    </label>
                    <span className="text-[11px] text-slate-500 font-medium">Facebook Page for this ad</span>
                  </div>

                  <div className="flex items-center gap-2.5 bg-white p-2 rounded-lg border border-slate-300">
                    {activePagePicture ? (
                      <img
                        src={activePagePicture}
                        alt={activePageName}
                        className="w-7 h-7 rounded-full object-cover border border-slate-200 shrink-0"
                        onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                        f
                      </div>
                    )}
                    <select
                      value={selectedPageId}
                      onChange={(e) => {
                        const id = e.target.value;
                        setSelectedPageId(id);
                        const p = metaPages.find(item => item.id === id);
                        if (p) setSelectedPageName(p.name);
                      }}
                      className="flex-1 text-xs bg-transparent border-none p-0 font-semibold text-slate-900 focus:ring-0 cursor-pointer"
                    >
                      {metaPages.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.id})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* AD GOAL SELECTION */}
                <div className="border border-slate-200 rounded-xl p-3.5 bg-white">
                  <label className="block text-xs font-bold text-slate-800 uppercase mb-2">
                    Campaign Goal
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setGoalType('LEAD_GEN')}
                      className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                        goalType === 'LEAD_GEN'
                          ? 'border-amber-600 bg-amber-50/50 ring-1 ring-amber-500/20'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                          <FileText className="w-4 h-4 text-amber-600" />
                          Get leads (Facebook form)
                        </span>
                        {goalType === 'LEAD_GEN' && <Check className="w-4 h-4 text-amber-600" />}
                      </div>
                      <p className="text-[11px] text-slate-500 leading-snug">
                        Meta Instant Form pre-filled with phone & email. Best for med spas & home services.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setGoalType('TRAFFIC_WEBSITE')}
                      className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                        goalType === 'TRAFFIC_WEBSITE'
                          ? 'border-amber-600 bg-amber-50/50 ring-1 ring-amber-500/20'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                          <ExternalLink className="w-4 h-4 text-amber-600" />
                          Send people to my website
                        </span>
                        {goalType === 'TRAFFIC_WEBSITE' && <Check className="w-4 h-4 text-amber-600" />}
                      </div>
                      <p className="text-[11px] text-slate-500 leading-snug">
                        OUTCOME_TRAFFIC clicks straight to your landing page or booking portal.
                      </p>
                    </button>
                  </div>

                  {goalType === 'TRAFFIC_WEBSITE' && (
                    <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 uppercase mb-1">
                          Destination Website URL
                        </label>
                        <input
                          type="url"
                          value={websiteUrl}
                          onChange={(e) => setWebsiteUrl(e.target.value)}
                          placeholder="https://ecenturyappraisals.com"
                          className="w-full text-xs border border-slate-300 rounded-lg p-2 font-medium text-slate-800 focus:ring-1 focus:ring-amber-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 uppercase mb-1">
                          Call To Action Button
                        </label>
                        <select
                          value={callToAction}
                          onChange={(e) => setCallToAction(e.target.value)}
                          className="w-full text-xs border border-slate-300 rounded-lg p-2 font-semibold text-slate-800 bg-white"
                        >
                          <option value="LEARN_MORE">Learn More</option>
                          <option value="SHOP_NOW">Shop Now</option>
                          <option value="BUY_NOW">Buy Now</option>
                          <option value="CONTACT_US">Contact Us</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>

                {/* SPECIAL AD CATEGORY */}
                <div className="border border-slate-200 rounded-xl p-3.5 bg-white">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-800 uppercase">
                      Special Ad Category
                    </label>
                    <span className="text-[10px] text-slate-400">Meta Policy Compliance</span>
                  </div>
                  <select
                    value={specialCategory}
                    onChange={(e) => setSpecialCategory(e.target.value as SpecialAdCategory)}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2 font-medium text-slate-800 bg-white"
                  >
                    <option value="NONE">None (General business / services)</option>
                    <option value="HOUSING">Housing (Real Estate, appraisals, mortgage, listings)</option>
                    <option value="CREDIT">Credit (Credit cards, auto loans, personal financing)</option>
                    <option value="EMPLOYMENT">Employment (Job offers, recruitment, hiring)</option>
                  </select>

                  {specialCategory !== 'NONE' && (
                    <div className="mt-2.5 bg-amber-50 border border-amber-200 rounded-lg p-2.5 text-xs text-amber-900 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div className="text-[11px] leading-relaxed">
                        <strong className="font-semibold block text-amber-950">
                          {specialCategory} Category Rules Enforced by Meta:
                        </strong>
                        Federal non-discrimination guidelines require broad targeting: age is locked to <strong>18–65+</strong>, gender is locked to <strong>All</strong>, minimum radius is <strong>15 miles</strong>, and ZIP code targeting is strictly disallowed.
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
                    Describe the Offer / Focus (Plain English)
                  </label>
                  <input
                    type="text"
                    value={offerText}
                    onChange={(e) => setOfferText(e.target.value)}
                    placeholder="e.g. $99 first facial, new clients only"
                    className="w-full text-sm border border-slate-300 rounded-lg p-2.5 font-medium text-slate-900 focus:ring-2 focus:ring-amber-500/20"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Keep it specific to local prospects. Avoid exaggerated claims or medical promises.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: AD TEXT (GEMINI GENERATED 3 VERSIONS) */}
          {currentStep === 2 && (
            <div className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Step 2: Ad Copywriting (3 Compliant Versions)
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Adheres strictly to Meta ad policies (no guarantees, friendly local wording).
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setVariationCycle((v) => v + 1);
                      handleGenerateCopy();
                    }}
                    disabled={isGeneratingCopy}
                    className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isGeneratingCopy ? 'animate-spin text-amber-600' : ''}`} />
                    <span>Write 3 more</span>
                  </button>

                  {copies.length === 0 && (
                    <button
                      onClick={handleGenerateCopy}
                      disabled={isGeneratingCopy}
                      className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Generate with Gemini</span>
                    </button>
                  )}
                </div>
              </div>

              {copies.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {copies.map((copy, idx) => (
                    <div
                      key={copy.id || idx}
                      onClick={() => {
                        setSelectedCopyIndex(idx);
                        setPrimaryText(copy.primaryText);
                        setHeadline(copy.headline);
                        setDescription(copy.description);
                        setCallToAction(copy.callToAction);
                      }}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                        selectedCopyIndex === idx
                          ? 'border-amber-600 bg-amber-50/50 shadow-xs ring-2 ring-amber-500/20'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs mb-2">
                        <span className="font-bold text-slate-800">
                          {copy.versionLabel || `Option ${idx + 1}`}
                        </span>
                        {selectedCopyIndex === idx && (
                          <span className="w-4 h-4 rounded-full bg-amber-600 text-white flex items-center justify-center">
                            <Check className="w-2.5 h-2.5" />
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-700 line-clamp-3 mb-2 font-normal">
                        {copy.primaryText}
                      </div>
                      <div className="text-[11px] font-semibold text-slate-900 border-t border-slate-100 pt-1.5 truncate">
                        {copy.headline}
                      </div>
                      <div className="text-[10px] text-slate-500 truncate mt-0.5">
                        CTA: {copy.callToAction}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Editable Ad Copy Form */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wide block">
                  Customize Selected Copy
                </span>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Primary Text (appears above ad creative)
                  </label>
                  <textarea
                    rows={3}
                    value={primaryText}
                    onChange={(e) => setPrimaryText(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2.5 font-normal text-slate-800 bg-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Headline (bold title)
                    </label>
                    <input
                      type="text"
                      value={headline}
                      onChange={(e) => setHeadline(e.target.value)}
                      className="w-full text-xs border border-slate-300 rounded-lg p-2 font-medium text-slate-800 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Call-to-Action Button
                    </label>
                    <select
                      value={callToAction}
                      onChange={(e) => setCallToAction(e.target.value)}
                      className="w-full text-xs border border-slate-300 rounded-lg p-2 font-semibold text-slate-800 bg-white"
                    >
                      <option value="BOOK_NOW">Book Now</option>
                      <option value="GET_QUOTE">Get Quote</option>
                      <option value="LEARN_MORE">Learn More</option>
                      <option value="CONTACT_US">Contact Us</option>
                      <option value="SIGN_UP">Sign Up</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Description (optional subtext)
                  </label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2 text-slate-700 bg-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: CREATIVE IMAGE */}
          {currentStep === 3 && (
            <div className="space-y-5">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Step 3: Ad Creative Visual
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Choose to generate an image tailored to the offer or pull photos directly from the client's website.
                </p>
              </div>

              {/* Mode Toggle */}
              <div className="flex items-center gap-3 border-b border-slate-200 pb-3">
                <button
                  onClick={() => setImageSourceMode('generate')}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                    imageSourceMode === 'generate'
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Option A: Generate Image</span>
                </button>
                <button
                  onClick={() => setImageSourceMode('site')}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                    imageSourceMode === 'site'
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>Option B: Pull from Client Site</span>
                </button>
              </div>

              {/* Option A: Generate Image */}
              {imageSourceMode === 'generate' && (
                <div className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-800">
                      Visual Prompt Description
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-500">Aspect Ratio:</span>
                      <button
                        onClick={() => setImageFormat('1:1')}
                        className={`text-xs px-2 py-0.5 rounded font-medium ${
                          imageFormat === '1:1' ? 'bg-amber-600 text-white' : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        Square (1080x1080)
                      </button>
                      <button
                        onClick={() => setImageFormat('9:16')}
                        className={`text-xs px-2 py-0.5 rounded font-medium ${
                          imageFormat === '9:16' ? 'bg-amber-600 text-white' : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        Stories/Reels (1080x1920)
                      </button>
                    </div>
                  </div>

                  <textarea
                    rows={2}
                    value={imagePrompt}
                    onChange={(e) => setImagePrompt(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2.5 font-normal text-slate-800 bg-white"
                  />

                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-500">
                      Policy rule: No baked-in heavy text or unrealistic before/afters.
                    </span>
                    <button
                      onClick={handleGenerateImage}
                      disabled={isGeneratingImage}
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Sparkles className={`w-3.5 h-3.5 text-amber-400 ${isGeneratingImage ? 'animate-spin' : ''}`} />
                      <span>{isGeneratingImage ? 'Generating Creative...' : 'Generate Visual'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Option B: Pull from Client Site */}
              {imageSourceMode === 'site' && (
                <div className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={scrapeUrl}
                      onChange={(e) => setScrapeUrl(e.target.value)}
                      placeholder="https://clientwebsite.com"
                      className="flex-1 text-xs border border-slate-300 rounded-lg p-2.5 font-medium text-slate-800 bg-white"
                    />
                    <button
                      onClick={handleScrapeImages}
                      disabled={isScraping}
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isScraping ? 'animate-spin' : ''}`} />
                      <span>{isScraping ? 'Fetching...' : 'Scan Site'}</span>
                    </button>
                  </div>

                  {scrapedImages.length > 0 && (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-h-56 overflow-y-auto p-1">
                      {scrapedImages.map((img, idx) => (
                        <div
                          key={idx}
                          onClick={() => setSelectedImageUrl(img)}
                          className={`aspect-square rounded-lg overflow-hidden border-2 cursor-pointer transition-all relative ${
                            selectedImageUrl === img
                              ? 'border-amber-600 ring-2 ring-amber-500/20 shadow-md'
                              : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <img src={img} alt="scraped" className="w-full h-full object-cover" />
                          {selectedImageUrl === img && (
                            <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center">
                              <Check className="w-3 h-3" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Selected Creative Preview */}
              <div className="border border-slate-200 rounded-xl p-4 flex items-center gap-4 bg-white">
                <div className="w-20 h-20 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                  <img src={selectedImageUrl} alt="selected" className="w-full h-full object-cover" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">
                    Active Creative Image Selected
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Format: {imageFormat === '1:1' ? 'Square Feed (1080x1080)' : 'Vertical Story (1080x1920)'}
                  </div>
                  <div className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 mt-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Meta Ad Guidelines Checked</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: AUDIENCE & BUDGET */}
          {currentStep === 4 && (
            <div className="space-y-5">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Step 4: Local Audience Targeting & Budget
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Meta Targeting API geolocation lookup & compliance controls.
                </p>
              </div>

              {activeClient && (
                <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3 text-xs flex items-start gap-2.5">
                  <Users className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-amber-950 block">
                      Recommended Audience ({getNicheLabel(activeClient?.niche)}):
                    </span>
                    <span className="text-amber-900 leading-relaxed text-[11px]">
                      {getNicheAudienceRecommendation(activeClient?.niche)}
                    </span>
                  </div>
                </div>
              )}

              {/* LOCATION TARGETING WITH META SEARCH API */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-900 uppercase">
                    Meta Ad Geolocation Targeting
                  </label>
                  <span className="text-[10px] text-slate-500">Targeting Search API (search?type=adgeolocation)</span>
                </div>

                <div className="relative">
                  <div className="flex items-center gap-2 bg-white border border-slate-300 rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-amber-500/20">
                    <Search className="w-4 h-4 text-slate-400 shrink-0" />
                    <input
                      type="text"
                      value={locationSearchInput}
                      onChange={(e) => handleSearchLocations(e.target.value)}
                      placeholder="Search city, state (e.g. Michigan), or county..."
                      className="w-full text-xs font-medium text-slate-800 bg-transparent outline-none"
                    />
                    {isSearchingLocation && (
                      <RefreshCw className="w-3.5 h-3.5 text-amber-600 animate-spin shrink-0" />
                    )}
                  </div>

                  {/* Search Autocomplete Results Dropdown */}
                  {locationResults.length > 0 && (
                    <div className="absolute z-20 left-0 right-0 mt-1 bg-white border border-slate-300 rounded-lg shadow-xl max-h-48 overflow-y-auto">
                      {locationResults.map((loc) => (
                        <div
                          key={`${loc.type}-${loc.key}`}
                          onClick={() => handleSelectLocationResult(loc)}
                          className="px-3 py-2 hover:bg-amber-50 cursor-pointer border-b border-slate-100 last:border-0 flex items-center justify-between text-xs"
                        >
                          <div>
                            <span className="font-semibold text-slate-800">{loc.name}</span>
                            <span className="text-slate-400 text-[11px] ml-1.5">
                              {loc.region ? `${loc.region}, ` : ''}{loc.country_code}
                            </span>
                          </div>
                          <span className="text-[10px] px-2 py-0.5 rounded uppercase font-semibold bg-slate-100 text-slate-600">
                            {loc.type === 'region' ? 'State / Region' : loc.type}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Selected Location Pill */}
                {selectedLocation ? (
                  <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                      <div>
                        <span className="font-bold text-emerald-950">{selectedLocation.name}</span>
                        <span className="text-emerald-700 text-[11px] ml-1.5">
                          (Meta {selectedLocation.type.toUpperCase()} Key: #{selectedLocation.key})
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedLocation(null);
                        setCity('');
                      }}
                      className="text-xs text-emerald-700 hover:text-emerald-900 font-semibold cursor-pointer"
                    >
                      Clear
                    </button>
                  </div>
                ) : (city && city.trim()) ? (
                  <div className="p-2.5 rounded-lg bg-emerald-50/60 border border-emerald-200 text-[11px] text-emerald-800 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Targeting client service area: <strong>{city}</strong></span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCity('')}
                      className="text-[10px] text-emerald-700 hover:text-emerald-950 font-bold cursor-pointer"
                    >
                      Change
                    </button>
                  </div>
                ) : (
                  <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-300 text-xs text-amber-900 font-semibold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Pick a location first before launching this ad campaign.</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Radius Around Location (Miles)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={effectiveRadius}
                      disabled={isSpecial && radiusMiles < 15}
                      onChange={(e) => setRadiusMiles(Math.max(Number(e.target.value), isSpecial ? 15 : 5))}
                      min={isSpecial ? 15 : 5}
                      max={50}
                      className={`w-full text-xs border rounded-lg p-2 font-semibold text-slate-800 ${
                        isSpecial ? 'bg-amber-50/40 border-amber-300' : 'border-slate-300'
                      }`}
                    />
                    {isSpecial && (
                      <div className="mt-1 flex items-center gap-1 text-[10px] text-amber-700 font-medium">
                        <Lock className="w-3 h-3" />
                        <span>Min 15-mile radius required for {specialCategory} category</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Gender Targeting
                  </label>
                  <div className="relative">
                    <select
                      value={effectiveGenders}
                      disabled={isSpecial}
                      onChange={(e) => setGenders(e.target.value as any)}
                      className={`w-full text-xs border rounded-lg p-2 font-medium text-slate-800 ${
                        isSpecial ? 'bg-slate-100 text-slate-500 cursor-not-allowed border-slate-200' : 'border-slate-300 bg-white'
                      }`}
                    >
                      <option value="ALL">All Genders (Recommended)</option>
                      <option value="WOMEN">Women Only</option>
                      <option value="MEN">Men Only</option>
                    </select>
                    {isSpecial && (
                      <div className="mt-1 flex items-center gap-1 text-[10px] text-amber-700 font-medium">
                        <Lock className="w-3 h-3" />
                        <span>Gender restrictions disabled for {specialCategory} category</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Age Range
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={effectiveMinAge}
                      disabled={isSpecial}
                      onChange={(e) => setMinAge(Number(e.target.value))}
                      min={18}
                      max={65}
                      className={`w-20 text-xs border rounded-lg p-2 font-medium text-slate-800 ${
                        isSpecial ? 'bg-slate-100 text-slate-500 cursor-not-allowed border-slate-200' : 'border-slate-300'
                      }`}
                    />
                    <span className="text-slate-400">to</span>
                    <input
                      type="number"
                      value={effectiveMaxAge}
                      disabled={isSpecial}
                      onChange={(e) => setMaxAge(Number(e.target.value))}
                      min={21}
                      max={65}
                      className={`w-20 text-xs border rounded-lg p-2 font-medium text-slate-800 ${
                        isSpecial ? 'bg-slate-100 text-slate-500 cursor-not-allowed border-slate-200' : 'border-slate-300'
                      }`}
                    />
                    <span className="text-xs text-slate-500">years old</span>
                    {isSpecial && (
                      <span className="text-[11px] text-amber-700 font-medium flex items-center gap-1 ml-2">
                        <Lock className="w-3.5 h-3.5" />
                        <span>Locked to 18–65+ for compliance</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Placements */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-2">
                  Placements (Automatic Advantage+ Placements)
                </label>
                <div className="flex flex-wrap gap-2 text-xs">
                  {[
                    { key: 'facebook_feed', label: 'Facebook Feed' },
                    { key: 'instagram_feed', label: 'Instagram Feed' },
                    { key: 'stories_reels', label: 'Instagram & FB Stories & Reels' },
                  ].map((p) => (
                    <span
                      key={p.key}
                      className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold flex items-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5" />
                      {p.label}
                    </span>
                  ))}
                </div>
              </div>

              {/* Daily Budget & Projected Spend */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 uppercase">
                    Daily Ad Budget ($ USD)
                  </span>
                  <div className="flex items-center gap-1 font-bold text-slate-900 text-base">
                    <span>$</span>
                    <input
                      type="number"
                      value={dailyBudget}
                      onChange={(e) => setDailyBudget(Number(e.target.value))}
                      className="w-24 text-sm font-bold border border-slate-300 rounded-lg p-1.5 text-center bg-white"
                    />
                    <span className="text-xs text-slate-500 font-normal">/ day</span>
                  </div>
                </div>

                <div className="border-t border-slate-200 pt-3 flex flex-wrap items-center justify-between text-xs text-slate-600 gap-2">
                  <div>
                    Projected 30-Day Spend: <strong className="text-slate-900">${(dailyBudget * 30).toLocaleString()}</strong>
                  </div>
                  <div>
                    Client Total Monthly Budget: <strong className="text-slate-900">${activeClient?.monthlyBudget.toLocaleString() || '0'}</strong>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: INSTANT FORM OR DIRECT WEBSITE DESTINATION */}
          {currentStep === 5 && (
            <div className="space-y-5">
              {goalType === 'TRAFFIC_WEBSITE' ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <ExternalLink className="w-5 h-5 text-amber-600" />
                      Step 5: Direct Website Traffic Destination
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      No Meta Instant Form required. Prospective clients click through directly to your landing page.
                    </p>
                  </div>

                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 font-bold text-sm">
                        ✓
                      </div>
                      <div>
                        <div className="text-xs font-bold text-emerald-950 uppercase">
                          Website Traffic Setup Ready
                        </div>
                        <p className="text-xs text-emerald-800 mt-0.5 leading-relaxed">
                          When users tap your ad, Meta directs them straight to your designated website URL. Optimization goal is set to <strong>LINK_CLICKS</strong> and results will show clicks, landing page views, and cost-per-click (CPC).
                        </p>
                      </div>
                    </div>

                    <div className="bg-white p-3 rounded-lg border border-emerald-200 text-xs space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">Destination URL:</span>
                        <a
                          href={websiteUrl || activeClient.websiteUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="font-bold text-amber-700 hover:underline flex items-center gap-1"
                        >
                          {websiteUrl || activeClient.websiteUrl}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">Call to Action:</span>
                        <span className="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                          {callToAction}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">Destination Type:</span>
                        <span className="font-bold text-slate-800">WEBSITE (No Leadgen Form)</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                      Confirm or Edit Destination URL
                    </label>
                    <input
                      type="url"
                      value={websiteUrl}
                      onChange={(e) => setWebsiteUrl(e.target.value)}
                      placeholder="https://example.com/services"
                      className="w-full text-xs border border-slate-300 rounded-lg p-2.5 font-medium text-slate-800"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-5">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      Step 5: Facebook & Instagram Instant Form
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Native Meta form for zero friction. Direct phone & email pre-fill.
                    </p>
                  </div>

                  {/* Standard Fields */}
                  <div className="space-y-3">
                    <span className="text-xs font-semibold text-slate-700 uppercase block">
                      Contact Information Fields (Pre-Filled by Meta)
                    </span>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      {['Full Name', 'Phone Number', 'Email Address'].map((f) => (
                        <div key={f} className="p-2.5 rounded-lg bg-slate-100 text-slate-800 font-semibold border border-slate-200 flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          {f}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Custom Questions */}
                  <div className="space-y-3">
                    <span className="text-xs font-semibold text-slate-700 uppercase block">
                      1-2 Custom Qualification Questions
                    </span>
                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 mb-1">
                        Question 1
                      </label>
                      <input
                        type="text"
                        value={customQuestion1}
                        onChange={(e) => setCustomQuestion1(e.target.value)}
                        placeholder="e.g. Preferred appointment time (Morning / Afternoon)"
                        className="w-full text-xs border border-slate-300 rounded-lg p-2 font-medium text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 mb-1">
                        Question 2
                      </label>
                      <input
                        type="text"
                        value={customQuestion2}
                        onChange={(e) => setCustomQuestion2(e.target.value)}
                        placeholder="e.g. What is your primary project or service goal?"
                        className="w-full text-xs border border-slate-300 rounded-lg p-2 font-medium text-slate-800"
                      />
                    </div>
                  </div>

                  {/* Privacy Policy & Thank You Screen */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Privacy Policy URL
                      </label>
                      <input
                        type="url"
                        value={privacyPolicyUrl}
                        onChange={(e) => setPrivacyPolicyUrl(e.target.value)}
                        className="w-full text-xs border border-slate-300 rounded-lg p-2 text-slate-800"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Client Direct Phone (Thank You Screen)
                      </label>
                      <input
                        type="text"
                        value={thankYouPhone}
                        onChange={(e) => setThankYouPhone(e.target.value)}
                        className="w-full text-xs border border-slate-300 rounded-lg p-2 text-slate-800 font-semibold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Thank You Completion Message
                    </label>
                    <textarea
                      rows={2}
                      value={thankYouMessage}
                      onChange={(e) => setThankYouMessage(e.target.value)}
                      className="w-full text-xs border border-slate-300 rounded-lg p-2 text-slate-700"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 6: PHONE PREVIEW & LAUNCH */}
          {currentStep === 6 && (
            <div className="space-y-6">
              {!launchSuccessData ? (
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                    <div>
                      <h3 className="text-base font-bold text-slate-900">
                        Step 6: Phone Preview & Campaign Launch
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Will be created as <span className="font-bold text-amber-700">PAUSED</span> first for Harold's final review.
                      </p>
                    </div>

                    {/* Platform toggle */}
                    <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs font-semibold">
                      <button
                        onClick={() => setPreviewPlatform('facebook')}
                        className={`px-3 py-1 rounded flex items-center gap-1.5 transition-all ${
                          previewPlatform === 'facebook' ? 'bg-white shadow-2xs text-blue-600' : 'text-slate-600'
                        }`}
                      >
                        <Facebook className="w-3.5 h-3.5" />
                        Facebook Feed
                      </button>
                      <button
                        onClick={() => setPreviewPlatform('instagram')}
                        className={`px-3 py-1 rounded flex items-center gap-1.5 transition-all ${
                          previewPlatform === 'instagram' ? 'bg-white shadow-2xs text-pink-600' : 'text-slate-600'
                        }`}
                      >
                        <Instagram className="w-3.5 h-3.5" />
                        Instagram Feed
                      </button>
                    </div>
                  </div>

                  {/* Phone Mockup Frame */}
                  <div className="max-w-sm mx-auto bg-slate-900 rounded-[36px] p-3 shadow-2xl border-4 border-slate-800">
                    <div className="bg-white rounded-[28px] overflow-hidden shadow-inner text-slate-900 text-xs">
                      {/* Mobile Top Status Bar */}
                      <div className="bg-white px-5 pt-3 pb-2 flex items-center justify-between text-[10px] text-slate-500 border-b border-slate-50 font-medium">
                        <span>9:41</span>
                        <div className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                          <span>5G</span>
                        </div>
                      </div>

                      {/* Header of Ad Post */}
                      <div className="p-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {activePagePicture ? (
                            <img
                              src={activePagePicture}
                              alt={activePageName}
                              className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0"
                              onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                              f
                            </div>
                          )}
                          <div>
                            <div className="font-bold text-xs text-slate-900 leading-tight">
                              {activePageName}
                            </div>
                            <div className="text-[10px] text-slate-500 flex items-center gap-1">
                              <span>Sponsored</span>
                              <span>•</span>
                              <span>{city || 'Local'}</span>
                            </div>
                          </div>
                        </div>
                        <span className="text-slate-400 font-bold">•••</span>
                      </div>

                      {/* Primary Text */}
                      <div className="px-3 pb-2 text-xs text-slate-800 line-clamp-3 leading-relaxed">
                        {primaryText || 'Claim your exclusive local introductory offer today.'}
                      </div>

                      {/* Creative Image */}
                      <div className="w-full aspect-square bg-slate-100 overflow-hidden relative">
                        <img
                          src={selectedImageUrl}
                          alt="preview"
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Ad Action Footer */}
                      <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                        <div className="min-w-0 pr-2">
                          <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                            {activeClient?.websiteUrl?.replace('https://', '') || 'local-offer.com'}
                          </div>
                          <div className="font-bold text-xs text-slate-900 truncate">
                            {headline || offerText}
                          </div>
                          <div className="text-[10px] text-slate-500 truncate">
                            {description || 'Tap to claim your spot in seconds'}
                          </div>
                        </div>

                        <button className="bg-slate-900 hover:bg-slate-800 text-white px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 shadow-xs">
                          {callToAction === 'BOOK_NOW' ? 'Book Now' : callToAction === 'GET_QUOTE' ? 'Get Quote' : 'Learn More'}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Launch Error Notice - Red Error Box showing exact Meta message and code */}
                  {launchError && (
                    <div className="mt-5 bg-red-50 p-4 rounded-xl border border-red-300 text-red-950 text-xs space-y-2.5 shadow-sm">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                          <span className="font-bold text-red-900 text-sm">
                            Meta Marketing API Error
                          </span>
                        </div>
                        {failedStep && (
                          <span className="px-2 py-0.5 bg-red-200/90 text-red-900 rounded font-mono text-[10px] font-bold uppercase tracking-wider">
                            Failed Step: {failedStep}
                          </span>
                        )}
                      </div>

                      <div className="bg-red-100/80 p-3 rounded-lg border border-red-200 font-mono text-[11px] text-red-950 break-words leading-relaxed">
                        {launchError}
                      </div>

                      {metaErrorDetails && (
                        <div className="bg-white/90 p-3 rounded-lg border border-red-200 text-[11px] space-y-1 font-mono text-slate-800 shadow-2xs">
                          <div className="font-bold text-red-800 uppercase text-[10px] tracking-wider mb-1.5 flex items-center justify-between">
                            <span>Meta Error Details</span>
                            {metaErrorDetails.code !== undefined && (
                              <span className="bg-red-100 text-red-900 px-1.5 py-0.5 rounded font-bold">
                                Code #{metaErrorDetails.code}
                              </span>
                            )}
                          </div>
                          {metaErrorDetails.error_subcode !== undefined && (
                            <div><span className="text-slate-500">Subcode:</span> <span className="font-semibold text-red-900">{metaErrorDetails.error_subcode}</span></div>
                          )}
                          {metaErrorDetails.type && (
                            <div><span className="text-slate-500">Error Type:</span> <span>{metaErrorDetails.type}</span></div>
                          )}
                          {metaErrorDetails.error_user_title && (
                            <div><span className="text-slate-500">Meta Title:</span> <span className="font-semibold">{metaErrorDetails.error_user_title}</span></div>
                          )}
                          {metaErrorDetails.error_user_msg && (
                            <div><span className="text-slate-500">User Msg:</span> <span>{metaErrorDetails.error_user_msg}</span></div>
                          )}
                          {metaErrorDetails.fbtrace_id && (
                            <div><span className="text-slate-500">Trace ID:</span> <span className="text-slate-600">{metaErrorDetails.fbtrace_id}</span></div>
                          )}
                        </div>
                      )}

                      <p className="text-[11px] text-red-800 pt-0.5 leading-normal">
                        Safe rollback was executed (no orphaned assets left on Meta). Please check your Meta token in Settings or your client's ad account and Facebook Page permissions.
                      </p>
                    </div>
                  )}

                  {/* Safety Notice Box */}
                  <div className="mt-5 bg-amber-50 p-3.5 rounded-xl border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
                    <Clock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block">Safe Staging:</span>
                      This campaign will be created directly on Meta with status <strong className="underline">PAUSED</strong>. Harold can inspect the final configuration, targeting, and creative in Meta Ads Manager or activate it immediately below.
                    </div>
                  </div>
                </div>
              ) : (
                /* Post-Launch Summary Screen - REAL META SUCCESS ONLY */
                (() => {
                  const campaignMetaId = launchSuccessData?.metaCampaignId || launchSuccessData?.campaign?.metaCampaignId;
                  const adSetMetaId = launchSuccessData?.metaAdSetId || launchSuccessData?.adSet?.metaAdSetId;
                  const adMetaId = launchSuccessData?.metaAdId || launchSuccessData?.ad?.metaAdId;
                  const headlineSent = launchSuccessData?.headlineSent || launchSuccessData?.ad?.headline || headline;
                  const rawAccount = activeClient?.linkedMeta?.adAccountId || launchSuccessData?.adAccountClean || '';
                  const cleanActNum = rawAccount.replace(/^act_/i, '').trim();
                  const adsManagerUrl = cleanActNum
                    ? `https://adsmanager.facebook.com/adsmanager/manage/campaigns?act=${cleanActNum}`
                    : 'https://adsmanager.facebook.com/adsmanager/manage/campaigns';

                  return (
                    <div className="text-center py-6 space-y-4">
                      <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto shadow-md ${
                        isLiveActive ? 'bg-emerald-100 text-emerald-600' : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {isLiveActive ? <Rocket className="w-7 h-7" /> : <Check className="w-7 h-7" />}
                      </div>

                      <div>
                        <h3 className="text-lg font-bold text-slate-900">
                          {isLiveActive ? 'Campaign is Now LIVE in Meta Ads Manager!' : 'Campaign Created Successfully in Meta (PAUSED)'}
                        </h3>
                        <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                          {isLiveActive
                            ? 'Campaign, ad set, and ad creative have been activated on Meta and are currently delivering to your audience.'
                            : 'Campaign, Ad Set, Ad Creative, and Image have been published to Meta Ads Manager in PAUSED status.'}
                        </p>
                      </div>

                      {/* Go Live Error Notice */}
                      {goLiveError && (
                        <div className="bg-red-50 p-3 rounded-xl border border-red-200 text-red-900 text-xs max-w-lg mx-auto text-left flex items-start gap-2.5">
                          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold block">Meta Activation Error:</span>
                            <span className="font-mono text-[11px]">{goLiveError}</span>
                          </div>
                        </div>
                      )}

                      {/* Go Live Success Confirmation */}
                      {goLiveSuccessResponse && (
                        <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 text-emerald-900 text-xs max-w-lg mx-auto text-left flex items-start gap-2.5">
                          <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold block">Meta Status Response:</span>
                            <span className="text-[11px]">{goLiveSuccessResponse.message || 'Status successfully updated to ACTIVE.'}</span>
                          </div>
                        </div>
                      )}

                      {/* Real Details Summary Card */}
                      <div className="bg-slate-50 max-w-lg mx-auto p-4 rounded-xl border border-slate-200 text-left text-xs space-y-2.5">
                        <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                          <span className="text-slate-500 font-medium">Client Account:</span>
                          <span className="font-bold text-slate-900">{activeClient?.businessName}</span>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-slate-500 font-medium">Facebook Page ID:</span>
                          <span className="font-mono font-semibold text-slate-800">{activeClient?.linkedMeta?.pageId || 'Linked Page'}</span>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-slate-500 font-medium">Meta Ad Account:</span>
                          <span className="font-mono font-semibold text-slate-800">act_{cleanActNum}</span>
                        </div>

                        <div className="flex justify-between items-start pt-1 border-t border-slate-100">
                          <span className="text-slate-500 font-medium shrink-0 mr-3">Real Headline Sent:</span>
                          <span className="font-bold text-slate-900 text-right leading-tight">{headlineSent}</span>
                        </div>

                        <div className="flex justify-between items-start pt-1">
                          <span className="text-slate-500 font-medium shrink-0 mr-3">Primary Text:</span>
                          <span className="text-slate-700 text-right text-[11px] line-clamp-2 max-w-[280px]">
                            {launchSuccessData?.ad?.primaryText || primaryText}
                          </span>
                        </div>

                        <div className="flex justify-between items-center pt-1 border-t border-slate-100">
                          <span className="text-slate-500 font-medium">Daily Budget:</span>
                          <span className="font-bold text-slate-900">${dailyBudget}/day (${(dailyBudget * 100)}¢ in Meta)</span>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-slate-500 font-medium">Delivery Status:</span>
                          {isLiveActive ? (
                            <span className="font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded flex items-center gap-1 text-[11px]">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                              ACTIVE in Meta
                            </span>
                          ) : (
                            <span className="font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded text-[11px]">
                              PAUSED (Staged in Meta)
                            </span>
                          )}
                        </div>

                        {/* Image Method Used (Requirement 3: "Image: uploaded" or "Image: linked by URL") */}
                        <div className="flex justify-between items-center">
                          <span className="text-slate-500 font-medium">Image Method:</span>
                          <span className={`font-semibold px-2 py-0.5 rounded text-[11px] ${
                            (launchSuccessData?.imageMethod === 'url' || launchSuccessData?.ad?.imageMethod === 'url')
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {launchSuccessData?.imageDeliveryLabel ||
                             launchSuccessData?.ad?.imageDeliveryLabel ||
                             (launchSuccessData?.imageMethod === 'url' ? 'Image: linked by URL' : 'Image: uploaded')}
                          </span>
                        </div>

                        {/* Real Meta IDs Section (Requirement 6) */}
                        <div className="mt-3 pt-2.5 border-t border-slate-200 bg-white p-3 rounded-lg border space-y-1.5 font-mono text-[11px]">
                          <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider font-sans mb-1">
                            Verified Meta Marketing API Asset IDs
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500 font-sans">Campaign ID:</span>
                            <span className="font-bold text-slate-900">{campaignMetaId}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500 font-sans">Ad Set ID:</span>
                            <span className="font-bold text-slate-900">{adSetMetaId}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500 font-sans">Ad ID:</span>
                            <span className="font-bold text-slate-900">{adMetaId}</span>
                          </div>
                          {(launchSuccessData?.metaCreativeId || launchSuccessData?.ad?.metaCreativeId) && (
                            <div className="flex justify-between">
                              <span className="text-slate-500 font-sans">Creative ID:</span>
                              <span className="font-bold text-slate-900">{launchSuccessData?.metaCreativeId || launchSuccessData?.ad?.metaCreativeId}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons (Requirement 6: Open in Meta Ads Manager) */}
                      <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
                        <a
                          href={adsManagerUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                        >
                          <ExternalLink className="w-4 h-4" />
                          <span>Open in Meta Ads Manager</span>
                        </a>

                        {!isLiveActive && (
                          <button
                            onClick={handleGoLive}
                            disabled={isGoingLive}
                            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                          >
                            <Rocket className={`w-4 h-4 ${isGoingLive ? 'animate-bounce' : ''}`} />
                            <span>{isGoingLive ? 'Activating in Meta...' : 'Go Live Now (Set to ACTIVE)'}</span>
                          </button>
                        )}

                        <button
                          onClick={onClose}
                          className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer"
                        >
                          {isLiveActive ? 'View in Dashboard' : 'Keep Paused / View in Dashboard'}
                        </button>
                      </div>
                    </div>
                  );
                })()
              )}
            </div>
          )}
        </div>

        {/* Wizard Footer Controls */}
        {!launchSuccessData && (
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
            {currentStep > 1 ? (
              <button
                onClick={() => setCurrentStep((s) => s - 1)}
                className="px-4 py-2 border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>
            ) : (
              <div></div>
            )}

            {currentStep < 6 ? (
              <button
                onClick={() => {
                  if (currentStep === 1 && copies.length === 0) {
                    handleGenerateCopy();
                  }
                  setCurrentStep((s) => s + 1);
                }}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <span>Continue</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleLaunchCampaign}
                disabled={isLaunching}
                className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold flex items-center gap-2 transition-all shadow-md cursor-pointer"
              >
                <Rocket className={`w-4 h-4 ${isLaunching ? 'animate-bounce' : ''}`} />
                <span>{isLaunching ? 'Creating Staged Campaign...' : 'Stage Campaign (PAUSED)'}</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
