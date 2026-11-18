import { PLAN_TOOLS, executeTool, MAX_TOOL_ITERATIONS } from '@/lib/llm';

describe('planTools', () => {
  it('has exactly 6 tools in PLAN_TOOLS', () => {
    expect(Array.isArray(PLAN_TOOLS)).toBe(true);
    expect(PLAN_TOOLS).toHaveLength(6);
  });

  it('ensures each tool has name, description, and input_schema with required fields', () => {
    for (const tool of PLAN_TOOLS) {
      expect(typeof tool.name).toBe('string');
      expect(tool.name.length).toBeGreaterThan(0);

      expect(typeof tool.description).toBe('string');
      expect(tool.description.length).toBeGreaterThan(0);

      expect(tool.input_schema).toBeDefined();
      expect(tool.input_schema.type).toBe('object');
      expect(Array.isArray(tool.input_schema.required)).toBe(true);
      expect(tool.input_schema.required.length).toBeGreaterThan(0);

      for (const req of tool.input_schema.required) {
        expect(typeof req).toBe('string');
        expect(req.length).toBeGreaterThan(0);
      }
    }
  });

  it('contains the expected tool names', () => {
    const names = PLAN_TOOLS.map((t) => t.name);
    expect(names).toContain('calc_exposure');
    expect(names).toContain('calc_mask_effect');
    expect(names).toContain('calc_ventilation_windows');
    expect(names).toContain('calc_indoor_concentration');
    expect(names).toContain('calc_commute_swap');
    expect(names).toContain('calc_cigarette_equivalent');
  });

  it('exports MAX_TOOL_ITERATIONS as 6', () => {
    expect(MAX_TOOL_ITERATIONS).toBe(6);
  });

  it('executes each calc tool successfully via executeTool', () => {
    const exposureRes = executeTool('calc_exposure', {
      hourlyConcentrations: [100, 120, 90],
    }) as { central: number; formula: string };
    expect(exposureRes.central).toBe(310);
    expect(typeof exposureRes.formula).toBe('string');

    const maskRes = executeTool('calc_mask_effect', {
      ambientPm25: 150,
      maskType: 'n95',
      ageGroup: 'adult',
    }) as { central: number };
    expect(maskRes.central).toBeLessThan(150);

    const ventRes = executeTool('calc_ventilation_windows', {
      hourlyOutdoorPm25: [200, 180, 50, 40, 60, 200],
      indoorPm25Closed: 100,
    }) as Array<{ startHour: number; endHour: number }>;
    expect(Array.isArray(ventRes)).toBe(true);

    const indoorRes = executeTool('calc_indoor_concentration', {
      outdoorPm25: 150,
      windowCondition: 'average',
      cadrM3PerHour: 200,
      roomAreaM2: 20,
    }) as { central: number };
    expect(typeof indoorRes.central).toBe('number');

    const commuteRes = executeTool('calc_commute_swap', {
      currentMode: 'car',
      alternativeMode: 'metro',
      commuteHours: 1,
      ambientPm25: 150,
    }) as { central: number };
    expect(typeof commuteRes.central).toBe('number');

    const cigRes = executeTool('calc_cigarette_equivalent', {
      exposureUgM3H: 528,
    }) as { central: number };
    expect(cigRes.central).toBeCloseTo(1, 4);
  });

  it('handles unknown tool gracefully in executeTool', () => {
    const unknownRes = executeTool('unknown_tool', {}) as { error: string };
    expect(unknownRes.error).toContain('Unknown tool: unknown_tool');
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
    const { getAnthropicClient, getModelName } = await import('@/lib/llm');
    process.env['DEMO_MODE'] = 'true';
    expect(getAnthropicClient()).toBeUndefined();
    expect(getModelName()).toBe('claude-sonnet-4-20250514');
  });

  it('client: throws ConfigError when DEMO_MODE is false and no ANTHROPIC_API_KEY', async () => {
    const { getAnthropicClient } = await import('@/lib/llm');
    process.env['DEMO_MODE'] = 'false';
    delete process.env['ANTHROPIC_API_KEY'];
    expect(() => getAnthropicClient()).toThrow();
  });

  it('prompts: exports expected prompts and generates user prompt', async () => {
    const { PLAN_SYSTEM_PROMPT, AUDIT_SYSTEM_PROMPT, getPlanUserPrompt } = await import(
      '@/lib/llm'
    );
    expect(typeof PLAN_SYSTEM_PROMPT).toBe('string');
    expect(typeof AUDIT_SYSTEM_PROMPT).toBe('string');

    const promptEn = getPlanUserPrompt('{"members":[]}', '{"hourly":{}}', 'en');
    expect(promptEn).toContain('English');

    const promptHi = getPlanUserPrompt('{"members":[]}', '{"hourly":{}}', 'hi');
    expect(promptHi).toContain('Hindi');
  });
});

