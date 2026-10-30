import React, { useState, useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  RefreshCw, 
  ShieldCheck, 
  AlertTriangle, 
  DollarSign, 
  MapPin, 
  Smartphone, 
  Check, 
  Layers,
  ChevronRight,
  ChevronLeft,
  Globe,
  Search
} from 'lucide-react';
import { AdDetailData, GeoLocationSearchResult } from '../types';
import { api } from '../services/api';

interface AdEditWizardProps {
  isOpen: boolean;
  onClose: () => void;
  adDetail: AdDetailData;
  onSuccess: () => void;
}

export const AdEditWizard: React.FC<AdEditWizardProps> = ({
  isOpen,
  onClose,
  adDetail,
  onSuccess,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [showLearningRestartWarning, setShowLearningRestartWarning] = useState(false);

  // Editable fields pre-filled from current ad settings
  const ad = adDetail.ad;
  const adSet = adDetail.adSet;
  const client = adDetail.client;

  // Campaign Goal & Category
  const isTraffic = (ad as any).goalType === 'TRAFFIC_WEBSITE' || !ad.formId;
  const isSpecial = (ad as any).specialCategory && (ad as any).specialCategory !== 'NONE';
  const [websiteUrl, setWebsiteUrl] = useState<string>((ad as any).websiteUrl || client?.websiteUrl || '');

  // Step 1: Copy
  const [primaryText, setPrimaryText] = useState(ad.primaryText || '');
  const [headline, setHeadline] = useState(ad.headline || '');
  const [description, setDescription] = useState(ad.description || '');
  const [callToAction, setCallToAction] = useState<string>(ad.callToAction || (isTraffic ? 'LEARN_MORE' : 'GET_QUOTE'));
  const [isGeneratingCopy, setIsGeneratingCopy] = useState(false);

  // Step 2: Creative Image
  const [imageUrl, setImageUrl] = useState(ad.imageUrl || '');
  const [imageFormat, setImageFormat] = useState<'1:1' | '9:16'>(ad.imageFormat || '1:1');
  const [imagePrompt, setImagePrompt] = useState(
    'Warm, professional service photography in clean setting, natural lighting, photorealistic'
  );
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  // Step 3: Audience & Budget
  const [dailyBudget, setDailyBudget] = useState(adSet?.dailyBudget || 50);
  const [city, setCity] = useState(adSet?.targeting?.city || client?.serviceArea?.city || '');
  const [radiusMiles, setRadiusMiles] = useState(adSet?.targeting?.radiusMiles || client?.serviceArea?.radiusMiles || 15);
  const [minAge, setMinAge] = useState(adSet?.targeting?.minAge || 25);
  const [maxAge, setMaxAge] = useState(adSet?.targeting?.maxAge || 65);
  const [startDate, setStartDate] = useState(adSet?.startDate || new Date().toISOString().split('T')[0]);

  // Requirement 2: Pre-fill from the ad set's current targeting.geo_locations
  const getInitialLocation = (): GeoLocationSearchResult | null => {
    const geo = adSet?.targeting?.geo_locations || (adSet as any)?.geo_locations;
    if (geo?.regions && geo.regions.length > 0) {
      const reg = geo.regions[0];
      const keyStr = String(reg.key || '3865');
      const nameStr = reg.name || (keyStr === '3865' ? 'Michigan' : keyStr === '3866' ? 'Minnesota' : `Region #${keyStr}`);
      return {
        key: keyStr,
        name: nameStr,
        type: 'region',
        country_code: reg.country_code || 'US',
      };
    }
    if (geo?.cities && geo.cities.length > 0) {
      const ct = geo.cities[0];
      return {
        key: String(ct.key || ''),
        name: ct.name || adSet?.targeting?.city || 'City',
        type: 'city',
        country_code: ct.country_code || 'US',
        region: ct.region,
      };
    }
    if (adSet?.targeting?.locationKey) {
      return {
        key: adSet.targeting.locationKey,
        name: adSet.targeting.locationName || adSet.targeting.city || 'Location',
        type: (adSet.targeting.locationType as any) || 'region',
        country_code: 'US',
      };
    }
    if (adSet?.targetingLocationName) {
      const isMich = adSet.targetingLocationName.toLowerCase().includes('michigan');
      return {
        key: isMich ? '3865' : '',
        name: adSet.targetingLocationName,
        type: isMich ? 'region' : 'city',
        country_code: 'US',
      };
    }
    if (adSet?.targeting?.city) {
      const isMich = adSet.targeting.city.toLowerCase() === 'michigan';
      return {
        key: isMich ? '3865' : '',
        name: adSet.targeting.city,
        type: isMich ? 'region' : 'city',
        country_code: 'US',
      };
    }
    return null;
  };

  const [selectedLocation, setSelectedLocation] = useState<GeoLocationSearchResult | null>(getInitialLocation);
  const [locationSearchInput, setLocationSearchInput] = useState('');
  const [locationResults, setLocationResults] = useState<GeoLocationSearchResult[]>([]);
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);

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
      console.warn('Location search error in edit wizard:', e);
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

  // Step 4: Lead Form Questions
  const [formQuestions, setFormQuestions] = useState<string>('Preferred day of week (e.g. Saturday morning)');
  const [privacyPolicyUrl, setPrivacyPolicyUrl] = useState(client?.websiteUrl ? `${client.websiteUrl}/privacy` : 'https://ecentraconcierge.com/privacy');
  const [thankYouPhone, setThankYouPhone] = useState(client?.phone || '');

  // Check if creative content was changed (which triggers Meta review and learning restart)
  const isCreativeModified = 
    primaryText !== ad.primaryText ||
    headline !== ad.headline ||
    description !== ad.description ||
    callToAction !== ad.callToAction ||
    imageUrl !== ad.imageUrl;

  const handleGenerateCopy = async () => {
    if (!client) return;
    setIsGeneratingCopy(true);
    try {
      const res = await api.generateAdCopy({
        clientName: client.businessName,
        niche: client.niche,
        offer: headline || ad.name,
        city: city || client.serviceArea.city,
        state: client.serviceArea.state,
      });
      if (res.copies && res.copies[0]) {
        setPrimaryText(res.copies[0].primaryText);
        setHeadline(res.copies[0].headline);
        setDescription(res.copies[0].description);
        setCallToAction(res.copies[0].callToAction);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingCopy(false);
    }
  };

  const handleGenerateImage = async () => {
    if (!client) return;
    setIsGeneratingImage(true);
    try {
      const res = await api.generateAdImage({
        promptDescription: imagePrompt,
        niche: client.niche,
        format: imageFormat,
      });
      if (res.imageUrl) {
        setImageUrl(res.imageUrl);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handlePreSave = () => {
    if (isCreativeModified) {
      setShowLearningRestartWarning(true);
    } else {
      executeSave();
    }
  };

  const executeSave = async () => {
    setIsSaving(true);
    setSaveError(null);
    setShowLearningRestartWarning(false);
    try {
      const payload: any = {
        budget: dailyBudget,
        city: selectedLocation?.name || city,
        radiusMiles: isSpecial ? Math.max(radiusMiles, 15) : radiusMiles,
        selectedLocation: selectedLocation ? {
          key: selectedLocation.key,
          name: selectedLocation.name,
          type: selectedLocation.type,
          country_code: selectedLocation.country_code,
          region: selectedLocation.region,
          latitude: selectedLocation.latitude,
          longitude: selectedLocation.longitude,
        } : undefined,
        minAge: isSpecial ? 18 : minAge,
        maxAge: isSpecial ? 65 : maxAge,
        startDate,
        primaryText,
        headline,
        description,
        callToAction,
        imageUrl,
        imageFormat,
        websiteUrl: isTraffic ? websiteUrl : undefined,
        formQuestions: isTraffic ? [] : [formQuestions],
        privacyPolicyUrl,
        thankYouPhone,
      };

      await api.editAd(ad.id, payload);
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Failed to update ad:', err);
      setSaveError(err.message || 'Failed to update ad on Meta');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-55 flex items-center justify-center bg-black/75 p-3 sm:p-6 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Edit Ad: {ad.name}
              </h2>
              <p className="text-[11px] text-slate-400">
                Pre-filled with current settings. Updates existing Ad Set or creates fresh creative.
              </p>
            </div>
          </div>

          <button onClick={onClose} className="text-slate-400 hover:text-white p-1.5 rounded-lg cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stepper */}
        <div className="bg-slate-50 px-6 py-3 border-b border-slate-200 flex items-center justify-between text-xs font-semibold">
          {[
            '1. Text & Copy',
            '2. Image Creative',
            '3. Audience & Budget',
            isTraffic ? '4. Destination' : '4. Instant Form',
            '5. Preview & Apply',
          ].map((label, idx) => {
            const stepNum = idx + 1;
            const isActive = currentStep === stepNum;
            const isPast = currentStep > stepNum;
            return (
              <button
                key={idx}
                onClick={() => setCurrentStep(stepNum)}
                className={`flex items-center gap-1.5 cursor-pointer ${
                  isActive ? 'text-amber-600 font-bold' : isPast ? 'text-slate-800' : 'text-slate-400'
                }`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] ${
                  isActive ? 'bg-amber-600 text-white' : isPast ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'
                }`}>
                  {isPast ? <Check className="w-3 h-3" /> : stepNum}
                </span>
                <span className="hidden sm:inline">{label.split('. ')[1]}</span>
              </button>
            );
          })}
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 text-xs space-y-5">
          {/* STEP 1: Text & Copy */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Ad Copy & Headline</h3>
                  <p className="text-slate-500 text-[11px]">Primary text, headline, and call to action.</p>
                </div>
                <button
                  onClick={handleGenerateCopy}
                  disabled={isGeneratingCopy}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isGeneratingCopy ? 'animate-spin text-amber-600' : ''}`} />
                  <span>Rewrite with Gemini</span>
                </button>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Primary Text</label>
                <textarea
                  rows={3}
                  value={primaryText}
                  onChange={(e) => setPrimaryText(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-slate-800 bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Headline</label>
                  <input
                    type="text"
                    value={headline}
                    onChange={(e) => setHeadline(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2 font-medium"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Call to Action Button</label>
                  <select
                    value={callToAction}
                    onChange={(e) => setCallToAction(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2 font-semibold"
                  >
                    <option value="BOOK_NOW">Book Now</option>
                    <option value="GET_QUOTE">Get Quote</option>
                    <option value="LEARN_MORE">Learn More</option>
                    <option value="CONTACT_US">Contact Us</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description Subtext</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2"
                />
              </div>
            </div>
          )}

          {/* STEP 2: Creative Image */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Ad Creative Image</h3>
                <p className="text-slate-500 text-[11px]">Generate a fresh visual or update image URL.</p>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-700">Image Generation Prompt</span>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => setImageFormat('1:1')}
                      className={`px-2 py-0.5 rounded font-semibold ${
                        imageFormat === '1:1' ? 'bg-amber-600 text-white' : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      Square (1080x1080)
                    </button>
                    <button
                      onClick={() => setImageFormat('9:16')}
                      className={`px-2 py-0.5 rounded font-semibold ${
                        imageFormat === '9:16' ? 'bg-amber-600 text-white' : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      Vertical (1080x1920)
                    </button>
                  </div>
                </div>

                <textarea
                  rows={2}
                  value={imagePrompt}
                  onChange={(e) => setImagePrompt(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 bg-white"
                />

                <div className="flex justify-end">
                  <button
                    onClick={handleGenerateImage}
                    disabled={isGeneratingImage}
                    className="px-4 py-2 bg-slate-900 text-white rounded-lg font-semibold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles className={`w-3.5 h-3.5 text-amber-400 ${isGeneratingImage ? 'animate-spin' : ''}`} />
                    <span>{isGeneratingImage ? 'Generating...' : 'Generate New Visual'}</span>
                  </button>
                </div>
              </div>

              {/* Active Image Thumbnail */}
              <div className="border border-slate-200 p-3 rounded-xl flex items-center gap-3">
                <img src={imageUrl} alt="current" className="w-16 h-16 rounded-lg object-cover border border-slate-200 shrink-0" />
                <div className="flex-1">
                  <span className="font-bold text-slate-900 block text-xs">Selected Creative Visual</span>
                  <span className="text-[11px] text-slate-500 block">Format: {imageFormat === '1:1' ? 'Square Feed' : 'Stories/Reels'}</span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Audience & Budget */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Audience & Daily Budget</h3>
                <p className="text-slate-500 text-[11px]">Updates the existing Meta Ad Set immediately.</p>
              </div>

              {/* META AD GEOLOCATION TARGETING (Requirement 2) */}
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
                      placeholder="Search state (e.g. Michigan), city, or county..."
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
                      <span>Targeting area: <strong>{city}</strong></span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCity('')}
                      className="text-[10px] text-emerald-700 hover:text-emerald-950 font-bold cursor-pointer"
                    >
                      Change
                    </button>
                  </div>
                ) : null}
              </div>

              {/* Radius Input (shown for cities/counties) */}
              {selectedLocation?.type !== 'region' && (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Service Area Radius (Miles)</label>
                  <input
                    type="number"
                    value={radiusMiles}
                    onChange={(e) => setRadiusMiles(Number(e.target.value))}
                    className="w-full border border-slate-300 rounded-lg p-2 font-bold"
                  />
                  <span className="text-[10px] text-slate-500">Radius targeting applies to cities & custom coordinates</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Daily Budget ($ USD)</label>
                  <input
                    type="number"
                    value={dailyBudget}
                    onChange={(e) => setDailyBudget(Number(e.target.value))}
                    className="w-full border border-slate-300 rounded-lg p-2 font-bold text-slate-900 text-sm"
                  />
                  <span className="text-[10px] text-slate-500">Projected 30-day: ${(dailyBudget * 30).toLocaleString()}</span>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Age Range</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={minAge}
                      onChange={(e) => setMinAge(Number(e.target.value))}
                      className="w-20 border border-slate-300 rounded-lg p-2"
                    />
                    <span>to</span>
                    <input
                      type="number"
                      value={maxAge}
                      onChange={(e) => setMaxAge(Number(e.target.value))}
                      className="w-20 border border-slate-300 rounded-lg p-2"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Destination or Instant Form */}
          {currentStep === 4 && (
            <div className="space-y-4">
              {isTraffic ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Destination Website URL</h3>
                    <p className="text-slate-500 text-[11px]">Direct link destination where users land when tapping the ad.</p>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Destination URL</label>
                    <input
                      type="url"
                      value={websiteUrl}
                      onChange={(e) => setWebsiteUrl(e.target.value)}
                      placeholder="https://example.com"
                      className="w-full border border-slate-300 rounded-lg p-2 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Call To Action Button</label>
                    <select
                      value={callToAction}
                      onChange={(e) => setCallToAction(e.target.value)}
                      className="w-full border border-slate-300 rounded-lg p-2 font-semibold bg-white"
                    >
                      <option value="LEARN_MORE">Learn More</option>
                      <option value="SHOP_NOW">Shop Now</option>
                      <option value="BUY_NOW">Buy Now</option>
                      <option value="CONTACT_US">Contact Us</option>
                    </select>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Lead Form Configuration</h3>
                    <p className="text-slate-500 text-[11px]">Questions and confirmation screen settings.</p>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Custom Question</label>
                    <input
                      type="text"
                      value={formQuestions}
                      onChange={(e) => setFormQuestions(e.target.value)}
                      className="w-full border border-slate-300 rounded-lg p-2"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Privacy Policy URL</label>
                      <input
                        type="url"
                        value={privacyPolicyUrl}
                        onChange={(e) => setPrivacyPolicyUrl(e.target.value)}
                        className="w-full border border-slate-300 rounded-lg p-2"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Thank You Phone Number</label>
                      <input
                        type="text"
                        value={thankYouPhone}
                        onChange={(e) => setThankYouPhone(e.target.value)}
                        className="w-full border border-slate-300 rounded-lg p-2 font-semibold"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 5: Phone Preview & Apply */}
          {currentStep === 5 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Preview Before Saving</h3>
                <p className="text-slate-500 text-[11px]">Review the ad mockup with your updated changes.</p>
              </div>

              <div className="max-w-xs mx-auto bg-slate-900 rounded-[28px] p-2.5 shadow-xl border-4 border-slate-800 text-slate-900 text-xs">
                <div className="bg-white rounded-[20px] overflow-hidden">
                  <div className="p-2.5 flex items-center justify-between border-b border-slate-50">
                    <span className="font-bold text-xs">{client?.businessName}</span>
                    <span className="text-[10px] text-slate-400">Sponsored</span>
                  </div>
                  <div className="px-2.5 py-1.5 text-xs text-slate-800 line-clamp-2">
                    {primaryText}
                  </div>
                  <div className="w-full aspect-square bg-slate-100 overflow-hidden">
                    <img src={imageUrl} alt="preview" className="w-full h-full object-cover" />
                  </div>
                  <div className="p-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                    <div className="min-w-0 pr-1">
                      <div className="font-bold text-xs text-slate-900 truncate">{headline}</div>
                      <div className="text-[10px] text-slate-500 truncate">{description}</div>
                    </div>
                    <button className="bg-slate-900 text-white px-2.5 py-1 rounded text-[11px] font-bold shrink-0">
                      {callToAction.replace('_', ' ')}
                    </button>
                  </div>
                </div>
              </div>

              {isCreativeModified && (
                <div className="bg-amber-50 border border-amber-200 text-amber-900 p-3 rounded-xl text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>
                    Creative modified. Saving will attach a new creative on Meta, restarting Meta learning.
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {saveError && (
          <div className="mx-6 mb-3 p-3 bg-red-50 rounded-xl border border-red-200 text-red-900 text-xs flex items-start gap-2 shadow-2xs">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block text-red-950">Meta Update Error:</span>
              <span className="font-mono text-[11px] text-red-900">{saveError}</span>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          {currentStep > 1 ? (
            <button
              onClick={() => setCurrentStep((s) => s - 1)}
              className="px-3.5 py-1.5 border border-slate-300 bg-white hover:bg-slate-100 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          ) : (
            <div></div>
          )}

          {currentStep < 5 ? (
            <button
              onClick={() => setCurrentStep((s) => s + 1)}
              className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
            >
              <span>Next Step</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={handlePreSave}
              disabled={isSaving}
              className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer"
            >
              {isSaving ? 'Applying Changes...' : 'Save & Apply to Meta'}
            </button>
          )}
        </div>

        {/* Warning Modal for Creative Modifications (Requirement 4) */}
        {showLearningRestartWarning && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-5 shadow-2xl border border-amber-300 text-xs space-y-3">
              <div className="font-bold text-amber-900 text-sm flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                <span>Notice: Meta Review & Learning Restart</span>
              </div>
              <p className="text-slate-800 leading-relaxed font-medium">
                This sends the ad back to Facebook for review and restarts its learning.
              </p>
              <p className="text-slate-500 text-[11px]">
                Because you modified the ad text, headline, button or image, Meta creates a new ad creative. Facebook will quickly re-approve it before resuming live delivery.
              </p>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  onClick={() => setShowLearningRestartWarning(false)}
                  className="px-3 py-1.5 border border-slate-300 rounded-lg text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={executeSave}
                  className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold"
                >
                  Confirm & Update Ad
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
