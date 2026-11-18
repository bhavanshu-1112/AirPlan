import { t, translations, type TranslationKey } from '@/lib/i18n';

describe('i18n translations', () => {
  const enKeys = Object.keys(translations.en).sort();
  const hiKeys = Object.keys(translations.hi).sort();
  const devanagariRegex = /[\u0900-\u097F]/;

  it('ensures en and hi have the exact same set of translation keys', () => {
    expect(enKeys).toEqual(hiKeys);
    expect(enKeys.length).toBeGreaterThanOrEqual(60);
  });

  it('covers all required UI keys across nav, setup, plan, audit, myths, and general', () => {
    // Nav
    expect(translations.en.appName).toBeDefined();
    expect(translations.en.setup).toBeDefined();
    expect(translations.en.plan).toBeDefined();
    expect(translations.en.audit).toBeDefined();
    expect(translations.en.mythBuster).toBeDefined();

    // Setup form
    expect(translations.en.city).toBeDefined();
    expect(translations.en.members).toBeDefined();
    expect(translations.en.addMember).toBeDefined();
    expect(translations.en.removeMember).toBeDefined();
    expect(translations.en.name).toBeDefined();
    expect(translations.en.ageGroup).toBeDefined();
    expect(translations.en.infant).toBeDefined();
    expect(translations.en.child).toBeDefined();
    expect(translations.en.adult).toBeDefined();
    expect(translations.en.elderly).toBeDefined();
    expect(translations.en.sensitivity).toBeDefined();
    expect(translations.en.none).toBeDefined();
    expect(translations.en.asthma).toBeDefined();
    expect(translations.en.heartCondition).toBeDefined();
    expect(translations.en.homeType).toBeDefined();
    expect(translations.en.apartment).toBeDefined();
    expect(translations.en.independentHouse).toBeDefined();
    expect(translations.en.windowCondition).toBeDefined();
    expect(translations.en.tight).toBeDefined();
    expect(translations.en.average).toBeDefined();
    expect(translations.en.leaky).toBeDefined();
    expect(translations.en.purifier).toBeDefined();
    expect(translations.en.hasPurifier).toBeDefined();
    expect(translations.en.noPurifier).toBeDefined();
    expect(translations.en.cadr).toBeDefined();
    expect(translations.en.roomArea).toBeDefined();
    expect(translations.en.commuteMode).toBeDefined();
    expect(translations.en.car).toBeDefined();
    expect(translations.en.metro).toBeDefined();
    expect(translations.en.bus).toBeDefined();
    expect(translations.en.bicycle).toBeDefined();
    expect(translations.en.walk).toBeDefined();
    expect(translations.en.noneCommute).toBeDefined();
    expect(translations.en.commuteHours).toBeDefined();
    expect(translations.en.cookingHabits).toBeDefined();
    expect(translations.en.gasStove).toBeDefined();
    expect(translations.en.timesPerDay).toBeDefined();
    expect(translations.en.maskAvailability).toBeDefined();
    expect(translations.en.surgical).toBeDefined();
    expect(translations.en.n95).toBeDefined();
    expect(translations.en.noneMask).toBeDefined();
    expect(translations.en.submit).toBeDefined();

    // Plan page
    expect(translations.en.title).toBeDefined();
    expect(translations.en.loading).toBeDefined();
    expect(translations.en.bestActions).toBeDefined();
    expect(translations.en.memberPlan).toBeDefined();
    expect(translations.en.bestOutdoorWindow).toBeDefined();
    expect(translations.en.maskRecommendation).toBeDefined();
    expect(translations.en.ventilationWindow).toBeDefined();
    expect(translations.en.skip).toBeDefined();
    expect(translations.en.disclaimer).toBeDefined();
    expect(translations.en.showMath).toBeDefined();
    expect(translations.en.hideMath).toBeDefined();
    expect(translations.en.before).toBeDefined();
    expect(translations.en.after).toBeDefined();
    expect(translations.en.saved).toBeDefined();
    expect(translations.en.cigaretteEquivalent).toBeDefined();
    expect(translations.en.formula).toBeDefined();
    expect(translations.en.dataSource).toBeDefined();
    expect(translations.en.range).toBeDefined();
    expect(translations.en.low).toBeDefined();
    expect(translations.en.central).toBeDefined();
    expect(translations.en.high).toBeDefined();
    expect(translations.en.noData).toBeDefined();
    expect(translations.en.sharePlan).toBeDefined();
    expect(translations.en.generatePlan).toBeDefined();

    // Audit
    expect(translations.en.auditTitle).toBeDefined();
    expect(translations.en.uploadPhoto).toBeDefined();
    expect(translations.en.analyzing).toBeDefined();
    expect(translations.en.findings).toBeDefined();
    expect(translations.en.noFindings).toBeDefined();
    expect(translations.en.confidence).toBeDefined();
    expect(translations.en.suggestedFix).toBeDefined();
    expect(translations.en.ventilation).toBeDefined();
    expect(translations.en.source).toBeDefined();
    expect(translations.en.general).toBeDefined();

    // Myths
    expect(translations.en.mythsTitle).toBeDefined();
    expect(translations.en.true_).toBeDefined();
    expect(translations.en.false_).toBeDefined();
    expect(translations.en.partial).toBeDefined();
    expect(translations.en.mythsSource).toBeDefined();

    // General
    expect(translations.en.error).toBeDefined();
    expect(translations.en.retry).toBeDefined();
    expect(translations.en.language).toBeDefined();
    expect(translations.en.english).toBeDefined();
    expect(translations.en.hindi).toBeDefined();
    expect(translations.en.privacyNote).toBeDefined();
    expect(translations.en.notMedicalAdvice).toBeDefined();
  });

  it('returns valid string for every translation key in English and Hindi', () => {
    for (const key of enKeys as TranslationKey[]) {
      const enVal = t('en', key);
      expect(typeof enVal).toBe('string');
      expect(enVal.length).toBeGreaterThan(0);

      const hiVal = t('hi', key);
      expect(typeof hiVal).toBe('string');
      expect(hiVal.length).toBeGreaterThan(0);
    }
  });

  it('ensures Hindi translations contain Devanagari script', () => {
    for (const key of hiKeys as TranslationKey[]) {
      const hiVal = t('hi', key);
      expect(devanagariRegex.test(hiVal)).toBe(true);
    }
  });

  it('ensures English translations contain no Devanagari script', () => {
    for (const key of enKeys as TranslationKey[]) {
      const enVal = t('en', key);
      expect(devanagariRegex.test(enVal)).toBe(false);
    }
  });

  it('handles unknown keys gracefully by returning the key name', () => {
    const unknownKey = 'non_existent_random_key' as unknown as TranslationKey;
    expect(t('en', unknownKey)).toBe('non_existent_random_key');
    expect(t('hi', unknownKey)).toBe('non_existent_random_key');
  });

  it('falls back to English when an unsupported language is provided', () => {
    expect(t('fr' as unknown as 'en', 'appName')).toBe('AirPlan');
  });
});
