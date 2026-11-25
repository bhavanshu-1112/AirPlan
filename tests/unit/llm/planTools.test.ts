import {
  PLAN_TOOLS,
  executeTool,
  MAX_TOOL_ITERATIONS,
  getGeminiFunctionDeclarations,
} from '@/lib/llm/planTools';

describe('planTools - definitions', () => {
  it('defines exactly 6 tools', () => {
    expect(PLAN_TOOLS).toHaveLength(6);
  });

  it('each tool has name, description, and valid input_schema', () => {
    for (const tool of PLAN_TOOLS) {
      expect(typeof tool.name).toBe('string');
      expect(typeof tool.description).toBe('string');
      expect(tool.input_schema.type).toBe('object');
      expect(tool.input_schema.properties).toBeDefined();
      expect(Array.isArray(tool.input_schema.required)).toBe(true);
    }
  });

  it('converts to Gemini function declarations format', () => {
    const decls = getGeminiFunctionDeclarations();
    expect(decls).toHaveLength(6);
    expect(decls[0]?.name).toBe('calc_exposure');
    expect(decls[0]?.parameters.type).toBe('OBJECT');
    expect(decls[0]?.parameters.properties).toBeDefined();
  });
});

describe('planTools - executeTool dispatch', () => {
  it('dispatches calc_exposure', () => {
    const res = executeTool('calc_exposure', {
      hourlyConcentrations: [100, 200],
      hoursPerSlot: [1, 1],
    }) as { central: number };
    expect(res.central).toBe(300);
  });

  it('dispatches calc_mask_effect', () => {
    const res = executeTool('calc_mask_effect', {
      ambientPm25: 200,
      maskType: 'n95',
      ageGroup: 'adult',
    }) as { central: number };
    expect(res.central).toBeLessThan(200);
  });

  it('dispatches calc_ventilation_windows', () => {
    const res = executeTool('calc_ventilation_windows', {
      hourlyOutdoorPm25: [200, 50, 40, 200],
      indoorPm25Closed: 100,
    }) as unknown[];
    expect(Array.isArray(res)).toBe(true);
  });

  it('dispatches calc_indoor_concentration', () => {
    const res = executeTool('calc_indoor_concentration', {
      outdoorPm25: 150,
      windowCondition: 'tight',
    }) as { central: number };
    expect(res.central).toBeLessThan(150);
  });

  it('dispatches calc_commute_swap', () => {
    const res = executeTool('calc_commute_swap', {
      currentMode: 'walk',
      alternativeMode: 'metro',
      commuteHours: 1,
      ambientPm25: 200,
    }) as { central: number };
    expect(res.central).toBeGreaterThan(0); // Metro is cleaner, exposure is saved
  });

  it('dispatches calc_cigarette_equivalent', () => {
    const res = executeTool('calc_cigarette_equivalent', {
      exposureUgM3H: 1056,
    }) as { central: number };
    expect(res.central).toBe(2);
  });

  it('returns error object for unknown tool', () => {
    const res = executeTool('calc_unknown_tool', {}) as { error: string };
    expect(res.error).toContain('Unknown tool: calc_unknown_tool');
  });

  it('has a positive MAX_TOOL_ITERATIONS constant', () => {
    expect(MAX_TOOL_ITERATIONS).toBeGreaterThan(0);
  });
});

describe('llm client and prompts', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('client: returns undefined in DEMO_MODE', async () => {
    const { getGeminiClient, getModelName } = await import('@/lib/llm');
    process.env['DEMO_MODE'] = 'true';
    expect(getGeminiClient()).toBeUndefined();
    expect(getModelName()).toBe('gemini-3.8-flash');
  });

  it('client: throws ConfigError when DEMO_MODE is false and no API key', async () => {
    const { getGeminiClient } = await import('@/lib/llm');
    process.env['DEMO_MODE'] = 'false';
    delete process.env['GEMINI_API_KEY'];
    expect(() => getGeminiClient()).toThrow();
  });

  it('prompts: exports expected prompts and generates user prompt', async () => {
    const { PLAN_SYSTEM_PROMPT, AUDIT_SYSTEM_PROMPT, getPlanUserPrompt } =
      await import('@/lib/llm');
    expect(typeof PLAN_SYSTEM_PROMPT).toBe('string');
    expect(typeof AUDIT_SYSTEM_PROMPT).toBe('string');

    const promptEn = getPlanUserPrompt('{"members":[]}', '{"hourly":{}}', 'en');
    expect(promptEn).toContain('English');

    const promptHi = getPlanUserPrompt('{"members":[]}', '{"hourly":{}}', 'hi');
    expect(promptHi).toContain('Hindi');
  });
});
