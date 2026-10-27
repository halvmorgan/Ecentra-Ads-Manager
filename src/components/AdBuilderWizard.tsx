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
  Sliders
} from 'lucide-react';
import { Client, GeneratedAdCopy } from '../types';
import { api } from '../services/api';

interface AdBuilderWizardProps {
  isOpen: boolean;
  onClose: () => void;
  clients: Client[];
  initialClientId?: string;
  onCampaignCreated: () => void;
}

export const AdBuilderWizard: React.FC<AdBuilderWizardProps> = ({
  isOpen,
  onClose,
  clients,
  initialClientId,
  onCampaignCreated,
}) => {
  // Wizard Step (1 to 6)
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Step 1: Client & Offer
  const [selectedClientId, setSelectedClientId] = useState<string>(initialClientId || clients[0]?.id || '');
  const [offerText, setOfferText] = useState<string>('$99 First Glow Facial + Skin Consultation (New Clients Only)');

  // Step 2: Ad Copy
  const [copies, setCopies] = useState<GeneratedAdCopy[]>([]);
  const [selectedCopyIndex, setSelectedCopyIndex] = useState<number>(0);
  const [isGeneratingCopy, setIsGeneratingCopy] = useState<boolean>(false);
  const [variationCycle, setVariationCycle] = useState<number>(1);
  const [primaryText, setPrimaryText] = useState<string>('');
  const [headline, setHeadline] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [callToAction, setCallToAction] = useState<string>('BOOK_NOW');

  // Step 3: Image Creative
  const [imageSourceMode, setImageSourceMode] = useState<'generate' | 'site'>('generate');
  const [imageFormat, setImageFormat] = useState<'1:1' | '9:16'>('1:1');
  const [imagePrompt, setImagePrompt] = useState<string>('Warm, professional treatment room with soft lighting, aesthetician prepping gentle botanical facial');
  const [isGeneratingImage, setIsGeneratingImage] = useState<boolean>(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string>('https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=1080&q=80');
  
  // 3b: Scrape from site
  const [scrapeUrl, setScrapeUrl] = useState<string>('');
  const [scrapedImages, setScrapedImages] = useState<string[]>([]);
  const [isScraping, setIsScraping] = useState<boolean>(false);

  // Step 4: Audience & Budget
  const [city, setCity] = useState<string>('');
  const [radiusMiles, setRadiusMiles] = useState<number>(15);
  const [minAge, setMinAge] = useState<number>(25);
  const [maxAge, setMaxAge] = useState<number>(65);
  const [genders, setGenders] = useState<'ALL' | 'MEN' | 'WOMEN'>('ALL');
  const [dailyBudget, setDailyBudget] = useState<number>(50);
  const [placements, setPlacements] = useState<string[]>(['facebook_feed', 'instagram_feed', 'stories_reels']);

  // Step 5: Instant Form
  const [formQuestions, setFormQuestions] = useState<string[]>(['Full Name', 'Phone Number', 'Email']);
  const [customQuestion1, setCustomQuestion1] = useState<string>('Preferred day of week (e.g., Saturday morning)');
  const [customQuestion2, setCustomQuestion2] = useState<string>('What is your primary goal / concern?');
  const [privacyPolicyUrl, setPrivacyPolicyUrl] = useState<string>('');
  const [thankYouPhone, setThankYouPhone] = useState<string>('');
  const [thankYouMessage, setThankYouMessage] = useState<string>('Thank you! Our local concierge team will text or call you within 15 minutes to confirm your appointment.');

  // Step 6: Review & Launch State
  const [previewPlatform, setPreviewPlatform] = useState<'facebook' | 'instagram'>('facebook');
  const [isLaunching, setIsLaunching] = useState<boolean>(false);
  const [launchError, setLaunchError] = useState<string | null>(null);
  const [isGoingLive, setIsGoingLive] = useState<boolean>(false);
  const [isLiveActive, setIsLiveActive] = useState<boolean>(false);
  const [launchSuccessData, setLaunchSuccessData] = useState<any | null>(null);

  // Active Client
  const activeClient = clients.find((c) => c.id === selectedClientId) || clients[0];

  // Initialize defaults when active client changes
  useEffect(() => {
    if (activeClient) {
      setCity(activeClient.serviceArea.city);
      setRadiusMiles(activeClient.serviceArea.radiusMiles);
      setScrapeUrl(activeClient.websiteUrl);
      setPrivacyPolicyUrl(`${activeClient.websiteUrl}/privacy-policy`);
      setThankYouPhone(activeClient.phone);

      if (activeClient.niche === 'water_mold') {
        setOfferText('Free 60-Minute Emergency Mold & Moisture Audit');
        setImagePrompt('Courteous restoration inspector with moisture meter assessing drywall in clean home');
        setCallToAction('GET_QUOTE');
      } else if (activeClient.niche === 'med_spa') {
        setOfferText('$99 First Glow Facial + Skin Consultation');
        setImagePrompt('Warm, tranquil treatment room with aesthetician in Scottsdale boutique med spa');
        setCallToAction('BOOK_NOW');
      } else if (activeClient.niche === 'solar') {
        setOfferText('Free Home Solar Utility Savings Analysis');
        setImagePrompt('Modern residential home with clean solar panels under blue sky in Colorado');
        setCallToAction('LEARN_MORE');
      }
    }
  }, [activeClient]);

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

  // Launch Campaign (ALWAYS CREATED PAUSED FIRST PER SPEC)
  const handleLaunchCampaign = async () => {
    if (!activeClient) return;
    setIsLaunching(true);
    setLaunchError(null);
    try {
      const payload = {
        clientId: activeClient.id,
        offerTitle: offerText,
        primaryText,
        headline,
        description,
        callToAction,
        imageUrl: selectedImageUrl,
        imageFormat,
        city,
        radiusMiles,
        minAge,
        maxAge,
        genders,
        placements,
        dailyBudget,
        formQuestions: [...formQuestions, customQuestion1, customQuestion2].filter(Boolean),
        privacyPolicyUrl,
        thankYouPhone,
        thankYouMessage,
      };

      const result = await api.createCampaign(payload);
      setLaunchSuccessData(result);
      onCampaignCreated();
    } catch (err: any) {
      console.error('Failed to launch campaign:', err);
      setLaunchError(err.message || 'Failed to stage Meta campaign. Check settings & ad account access.');
    } finally {
      setIsLaunching(false);
    }
  };

  // Go Live immediately from post-launch screen
  const handleGoLive = async () => {
    const campaignId = launchSuccessData?.campaign?.id || launchSuccessData?.id;
    if (!campaignId) return;
    setIsGoingLive(true);
    try {
      await api.goLive(campaignId);
      setIsLiveActive(true);
      onCampaignCreated();
    } catch (err: any) {
      alert(err.message || 'Failed to activate campaign on Meta');
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
              '5. Lead Form',
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
                        {c.businessName} ({c.serviceArea.city}, {c.serviceArea.state} • Niche: {c.niche})
                      </option>
                    ))}
                  </select>
                </div>

                {activeClient && (
                  <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 text-xs space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Service Area:</span>
                      <span className="font-semibold text-slate-800">
                        {activeClient.serviceArea.city}, {activeClient.serviceArea.state} ({activeClient.serviceArea.radiusMiles} mi radius)
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Target CPL:</span>
                      <span className="font-semibold text-emerald-700">${activeClient.targetCpl.toFixed(2)} / lead</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Linked Ad Account:</span>
                      <span className="font-semibold text-slate-800">
                        {activeClient.linkedMeta.adAccountName || 'Direct Business Manager Partner'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Card on File:</span>
                      <span className="font-semibold text-slate-800">Client pays Meta directly (Amex/Visa)</span>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
                    Describe the Offer (Plain English)
                  </label>
                  <input
                    type="text"
                    value={offerText}
                    onChange={(e) => setOfferText(e.target.value)}
                    placeholder="e.g. $99 first facial, new clients only"
                    className="w-full text-sm border border-slate-300 rounded-lg p-2.5 font-medium text-slate-900 focus:ring-2 focus:ring-amber-500/20"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Keep it specific to local newcomers. Avoid exaggerated claims or medical promises.
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
                  Broad local radius targeting around client's physical location.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Target City / Metro
                  </label>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full text-xs border border-slate-300 rounded-lg p-2 font-medium text-slate-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Radius (Miles)
                  </label>
                  <input
                    type="number"
                    value={radiusMiles}
                    onChange={(e) => setRadiusMiles(Number(e.target.value))}
                    min={5}
                    max={50}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2 font-semibold text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Age Range
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={minAge}
                      onChange={(e) => setMinAge(Number(e.target.value))}
                      min={18}
                      max={65}
                      className="w-20 text-xs border border-slate-300 rounded-lg p-2 font-medium text-slate-800"
                    />
                    <span className="text-slate-400">to</span>
                    <input
                      type="number"
                      value={maxAge}
                      onChange={(e) => setMaxAge(Number(e.target.value))}
                      min={21}
                      max={65}
                      className="w-20 text-xs border border-slate-300 rounded-lg p-2 font-medium text-slate-800"
                    />
                    <span className="text-xs text-slate-500">years old</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Gender Targeting
                  </label>
                  <select
                    value={genders}
                    onChange={(e) => setGenders(e.target.value as any)}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2 font-medium text-slate-800"
                  >
                    <option value="ALL">All Genders (Recommended)</option>
                    <option value="WOMEN">Women Only</option>
                    <option value="MEN">Men Only</option>
                  </select>
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
                    Projected 30-Day Spend: <strong className="text-slate-900">${projectedMonthlySpend.toLocaleString()}</strong>
                  </div>
                  <div>
                    Client Total Monthly Budget: <strong className="text-slate-900">${activeClient?.monthlyBudget.toLocaleString() || '0'}</strong>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: INSTANT LEAD FORM */}
          {currentStep === 5 && (
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
                          <div className="w-8 h-8 rounded-full bg-slate-900 text-amber-400 flex items-center justify-center font-bold text-xs">
                            {activeClient?.businessName.charAt(0) || 'E'}
                          </div>
                          <div>
                            <div className="font-bold text-xs text-slate-900 leading-tight">
                              {activeClient?.businessName || 'Local Business'}
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

                  {/* Launch Error Notice */}
                  {launchError && (
                    <div className="mt-4 bg-red-50 p-4 rounded-xl border border-red-200 text-red-900 text-xs flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <span className="font-bold text-red-800 block">Meta Marketing API Error:</span>
                        <p className="font-mono text-[11px] bg-red-100/60 p-2 rounded text-red-950 break-words">
                          {launchError}
                        </p>
                        <p className="text-[11px] text-red-700">
                          No orphaned assets were left behind (safe rollback executed). Check your Meta Business Manager token or ad account permissions in Settings.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Safety Notice Box */}
                  <div className="mt-5 bg-amber-50 p-3.5 rounded-xl border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
                    <Clock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block">Safe Staging:</span>
                      This campaign will be generated with status <strong className="underline">PAUSED</strong>. Harold can inspect the final configuration, targeting, and creative in the dashboard before turning it live, or activate it immediately below.
                    </div>
                  </div>
                </div>
              ) : (
                /* Post-Launch Summary Screen */
                <div className="text-center py-6 space-y-4">
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto shadow-md ${
                    isLiveActive ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {isLiveActive ? <Rocket className="w-7 h-7" /> : <Check className="w-7 h-7" />}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">
                      {isLiveActive ? 'Campaign is Now LIVE on Facebook & Instagram!' : 'Campaign Created Successfully (PAUSED)'}
                    </h3>
                    <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                      {isLiveActive
                        ? 'Campaign, ad set, and creative are ACTIVE and currently delivering to your local service area.'
                        : 'Campaign, Ad Set, Ad Creative, and Instant Form have been generated and staged in your dashboard.'}
                    </p>
                  </div>

                  <div className="bg-slate-50 max-w-md mx-auto p-4 rounded-xl border border-slate-200 text-left text-xs space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Client:</span>
                      <span className="font-bold text-slate-900">{activeClient?.businessName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Offer:</span>
                      <span className="font-medium text-slate-800">{offerText}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Daily Budget:</span>
                      <span className="font-semibold text-slate-900">${dailyBudget}/day</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Delivery Status:</span>
                      {isLiveActive ? (
                        <span className="font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                          ACTIVE (Delivering)
                        </span>
                      ) : (
                        <span className="font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">PAUSED (Safe Staging)</span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
                    {!isLiveActive && (
                      <button
                        onClick={handleGoLive}
                        disabled={isGoingLive}
                        className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                      >
                        <Rocket className={`w-4 h-4 ${isGoingLive ? 'animate-bounce' : ''}`} />
                        <span>{isGoingLive ? 'Activating on Meta...' : 'Go Live Now (Set to ACTIVE)'}</span>
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
