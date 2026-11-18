export type Language = 'en' | 'hi';

const en = {
  // Navigation
  appName: 'AirPlan',
  setup: 'Setup',
  plan: 'Plan',
  audit: 'Audit',
  mythBuster: 'Myth Buster',

  // Setup form labels & options
  city: 'City',
  members: 'Family Members',
  addMember: 'Add Member',
  removeMember: 'Remove Member',
  name: 'Name',
  ageGroup: 'Age Group',
  infant: 'Infant (0-1 yr)',
  child: 'Child (1-17 yrs)',
  adult: 'Adult (18-64 yrs)',
  elderly: 'Elderly (65+ yrs)',
  sensitivity: 'Health Sensitivity',
  none: 'None',
  asthma: 'Asthma / Respiratory',
  heartCondition: 'Heart Condition',
  homeType: 'Home Type',
  apartment: 'Apartment',
  independentHouse: 'Independent House',
  windowCondition: 'Window Condition',
  tight: 'Well Sealed (Tight)',
  average: 'Average',
  leaky: 'Drafty / Leaky',
  purifier: 'Air Purifier',
  hasPurifier: 'Yes, we have an air purifier',
  noPurifier: 'No air purifier',
  cadr: 'Clean Air Delivery Rate (CADR m³/h)',
  roomArea: 'Room Area (m²)',
  commuteMode: 'Primary Commute Mode',
  car: 'Car',
  metro: 'Metro',
  bus: 'Bus',
  bicycle: 'Bicycle',
  walk: 'Walking',
  noneCommute: 'No Commute / Work from Home',
  commuteHours: 'Commute Hours per Day',
  cookingHabits: 'Cooking Habits',
  gasStove: 'Gas Stove',
  timesPerDay: 'Cooking Sessions per Day',
  maskAvailability: 'Mask Available',
  surgical: 'Surgical Mask',
  n95: 'N95 / FFP2 Mask',
  noneMask: 'No Mask',
  submit: 'Generate Plan',

  // Plan page
  title: 'Air Quality Action Plan',
  planTitle: 'Air Quality Action Plan',
  loading: 'Loading...',
  bestActions: 'Top Recommended Actions',
  memberPlan: 'Individual Member Plans',
  bestOutdoorWindow: 'Best Outdoor Window',
  maskRecommendation: 'Mask Recommendation',
  ventilationWindow: 'Ventilation Window',
  skip: 'Activities to Avoid',
  disclaimer:
    'This is not medical advice. Consult a physician for health decisions. Data is indicative with ±25% uncertainty.',
  showMath: 'Show Calculation Details',
  hideMath: 'Hide Calculation Details',
  before: 'Before',
  after: 'After',
  saved: 'Saved',
  cigaretteEquivalent: 'Cigarette Equivalent Saved',
  formula: 'Formula',
  dataSource: 'Data Source',
  range: 'Uncertainty Range',
  low: 'Low',
  central: 'Central',
  high: 'High',
  noData: 'No data available',
  sharePlan: 'Share Plan',
  generatePlan: 'Generate Action Plan',

  // Audit
  auditTitle: 'Indoor Air Quality Audit',
  uploadPhoto: 'Upload Room Photo',
  analyzing: 'Analyzing room photo...',
  findings: 'Audit Findings',
  noFindings: 'No air quality risks detected in this photo',
  confidence: 'Confidence',
  suggestedFix: 'Suggested Fix',
  ventilation: 'Ventilation',
  source: 'Pollution Source',
  purifierCategory: 'Air Purifier',
  general: 'General',
  categoryVentilation: 'Ventilation',
  categorySource: 'Pollution Source',
  categoryPurifier: 'Air Purifier',
  categoryGeneral: 'General',

  // Myths
  mythsTitle: 'Air Quality Myth Buster',
  true_: 'True',
  false_: 'False',
  partial: 'Partially True',
  mythsSource: 'Source',

  // General
  error: 'An error occurred',
  retry: 'Retry',
  language: 'Language',
  english: 'English',
  hindi: 'Hindi',
  privacyNote: 'Your data stays local and private',
  notMedicalAdvice: 'Not medical advice',
} as const;

export type TranslationKey = keyof typeof en;

const hi: Record<TranslationKey, string> = {
  // Navigation
  appName: 'एयरप्लान',
  setup: 'सेटअप',
  plan: 'योजना',
  audit: 'ऑडिट',
  mythBuster: 'भ्रम निवारक',

  // Setup form labels & options
  city: 'शहर',
  members: 'परिवार के सदस्य',
  addMember: 'सदस्य जोड़ें',
  removeMember: 'सदस्य हटाएं',
  name: 'नाम',
  ageGroup: 'आयु वर्ग',
  infant: 'शिशु (0-1 वर्ष)',
  child: 'बच्चा (1-17 वर्ष)',
  adult: 'वयस्क (18-64 वर्ष)',
  elderly: 'वरिष्ठ नागरिक (65+ वर्ष)',
  sensitivity: 'स्वास्थ्य संवेदनशीलता',
  none: 'कोई नहीं',
  asthma: 'अस्थमा / सांस की समस्या',
  heartCondition: 'हृदय रोग',
  homeType: 'घर का प्रकार',
  apartment: 'अपार्टमेंट',
  independentHouse: 'स्वतंत्र मकान',
  windowCondition: 'खिड़कियों की स्थिति',
  tight: 'सील बंद (टाइट)',
  average: 'सामान्य',
  leaky: 'हवा रिसने वाली (लीकी)',
  purifier: 'एयर प्यूरिफायर',
  hasPurifier: 'हाँ, एयर प्यूरिफायर उपलब्ध है',
  noPurifier: 'एयर प्यूरिफायर नहीं है',
  cadr: 'क्लीन एयर डिलीवरी रेट (CADR m³/h)',
  roomArea: 'कमरे का क्षेत्रफल (वर्ग मीटर)',
  commuteMode: 'आवागमन का साधन',
  car: 'कार',
  metro: 'मेट्रो',
  bus: 'बस',
  bicycle: 'साइकिल',
  walk: 'पैदल',
  noneCommute: 'कोई आवागमन नहीं / वर्क फ्रॉम होम',
  commuteHours: 'प्रतिदिन यात्रा के घंटे',
  cookingHabits: 'खाना पकाने की आदतें',
  gasStove: 'गैस स्टोव',
  timesPerDay: 'प्रतिदिन खाना पकाने की आवृत्ति',
  maskAvailability: 'मास्क की उपलब्धता',
  surgical: 'सर्जिकल मास्क',
  n95: 'एन95 / एफएफपी2 मास्क',
  noneMask: 'कोई मास्क नहीं',
  submit: 'योजना तैयार करें',

  // Plan page
  title: 'वायु गुणवत्ता कार्य योजना',
  planTitle: 'वायु गुणवत्ता कार्य योजना',
  loading: 'लोड हो रहा है...',
  bestActions: 'शीर्ष अनुशंसित कदम',
  memberPlan: 'सदस्य वार व्यक्तिगत योजना',
  bestOutdoorWindow: 'बाहर जाने का सबसे अच्छा समय',
  maskRecommendation: 'मास्क संबंधी अनुशंसा',
  ventilationWindow: 'खिड़कियां खोलने का समय',
  skip: 'परहेज करने योग्य गतिविधियां',
  disclaimer:
    'यह चिकित्सा सलाह नहीं है। स्वास्थ्य संबंधी निर्णयों के लिए चिकित्सक से परामर्श लें। डेटा ±25% अनिश्चितता के साथ सांकेतिक है।',
  showMath: 'गणना विवरण देखें',
  hideMath: 'गणना विवरण छिपाएं',
  before: 'पहले',
  after: 'बाद में',
  saved: 'बचत',
  cigaretteEquivalent: 'सिगरेट समतुल्य जोखिम बचत',
  formula: 'सूत्र',
  dataSource: 'डेटा स्रोत',
  range: 'अनिश्चितता सीमा',
  low: 'न्यूनतम',
  central: 'केंद्रीय',
  high: 'अधिकतम',
  noData: 'कोई डेटा उपलब्ध नहीं',
  sharePlan: 'योजना साझा करें',
  generatePlan: 'कार्य योजना तैयार करें',

  // Audit
  auditTitle: 'कमरे की वायु गुणवत्ता ऑडिट',
  uploadPhoto: 'कमरे की फोटो अपलोड करें',
  analyzing: 'कमरे की फोटो का विश्लेषण हो रहा है...',
  findings: 'ऑडिट के निष्कर्ष',
  noFindings: 'इस फोटो में कोई वायु गुणवत्ता जोखिम नहीं पाया गया',
  confidence: 'विश्वास स्तर',
  suggestedFix: 'सुझाया गया समाधान',
  ventilation: 'वेंटिलेशन',
  source: 'प्रदूषण स्रोत',
  purifierCategory: 'एयर प्यूरिफायर',
  general: 'सामान्य',
  categoryVentilation: 'वेंटिलेशन',
  categorySource: 'प्रदूषण स्रोत',
  categoryPurifier: 'एयर प्यूरिफायर',
  categoryGeneral: 'सामान्य',

  // Myths
  mythsTitle: 'वायु गुणवत्ता भ्रम और सच्चाई',
  true_: 'सच',
  false_: 'भ्रम (झूठ)',
  partial: 'आंशिक रूप से सच',
  mythsSource: 'स्रोत संदर्भ',

  // General
  error: 'एक त्रुटि हुई',
  retry: 'पुनः प्रयास करें',
  language: 'भाषा',
  english: 'अंग्रेजी',
  hindi: 'हिंदी',
  privacyNote: 'आपकी जानकारी स्थानीय और सुरक्षित रहती है',
  notMedicalAdvice: 'चिकित्सा सलाह नहीं',
};

export const translations = {
  en,
  hi,
};

/**
 * Translate a key into the given language.
 * Falls back to English, then to the key itself if not found.
 */
export function t(lang: Language, key: TranslationKey): string {
  // eslint-disable-next-line security/detect-object-injection
  const dict = translations[lang] ?? translations.en;
  // eslint-disable-next-line security/detect-object-injection
  const val = dict[key];
  if (val !== undefined && typeof val === 'string') {
    return val;
  }
  // eslint-disable-next-line security/detect-object-injection
  const fallback = translations.en[key];
  if (fallback !== undefined && typeof fallback === 'string') {
    return fallback;
  }
  return String(key);
}
