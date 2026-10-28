export const STANDARD_NICHES = [
  { value: 'med_spa', label: 'Med Spa / Aesthetics' },
  { value: 'water_mold', label: 'Water & Mold Remediation' },
  { value: 'solar', label: 'Solar Energy' },
  { value: 'remodeling', label: 'Home Remodeling' },
  { value: 'home_services', label: 'Home Services' },
  { value: 'appraisal_real_estate', label: 'Real Estate / Appraisal' },
  { value: 'digital_product', label: 'Digital Product / Guide' },
  { value: 'marketing_business', label: 'Marketing / Business Services' },
  { value: 'other', label: 'Other (type your own)' },
];

export function getNicheLabel(niche?: string): string {
  if (!niche) return 'General Service';
  if (niche === 'other') return 'Other';
  const found = STANDARD_NICHES.find((opt) => opt.value === niche);
  if (found && found.value !== 'other') {
    return found.label;
  }
  return niche;
}

export function getNicheAudienceRecommendation(niche?: string): string {
  const n = (niche || '').toLowerCase();
  if (n === 'appraisal_real_estate' || n.includes('appraisal') || n.includes('real estate')) {
    return 'Homeowners, people going through divorce, probate, or estate settlement, real estate investors';
  }
  if (n === 'digital_product' || n.includes('digital') || n.includes('guide')) {
    return "Adults 25–65 interested in the guide's topic, plain-language benefit-focused wording";
  }
  if (n === 'marketing_business' || n.includes('marketing') || n.includes('business')) {
    return 'Small business owners and local service business owners';
  }
  if (n === 'water_mold' || n.includes('mold') || n.includes('water')) {
    return 'Local homeowners dealing with moisture, musty odors, leaks, or storm damage';
  }
  if (n === 'med_spa' || n.includes('spa') || n.includes('aesthetic')) {
    return 'Local residents, women & men interested in skincare, facials, and anti-aging wellness';
  }
  if (n === 'solar' || n.includes('solar')) {
    return 'Single-family homeowners with high electric bills interested in net metering';
  }
  if (n === 'remodeling' || n.includes('remodel') || n.includes('kitchen') || n.includes('bath')) {
    return 'Homeowners planning major interior or exterior renovations';
  }
  return 'General local audience; customizable radius and demographic parameters';
}

export function getNicheDefaultCpl(niche?: string): number {
  const n = (niche || '').toLowerCase();
  if (n === 'appraisal_real_estate' || n.includes('appraisal') || n.includes('real estate')) {
    return 35.00;
  }
  if (n === 'digital_product' || n.includes('digital') || n.includes('guide')) {
    return 15.00;
  }
  if (n === 'marketing_business' || n.includes('marketing') || n.includes('business')) {
    return 40.00;
  }
  if (n === 'water_mold' || n.includes('mold')) {
    return 45.00;
  }
  if (n === 'med_spa') {
    return 28.00;
  }
  if (n === 'solar') {
    return 55.00;
  }
  if (n === 'remodeling') {
    return 50.00;
  }
  return 30.00;
}
