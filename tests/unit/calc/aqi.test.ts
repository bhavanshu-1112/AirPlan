import { getAqiCategory } from '@/lib/calc/aqi';

describe('getAqiCategory', () => {
  it('AQI 0 → Good', () => {
    const r = getAqiCategory(0);
    expect(r.category).toBe('Good');
    expect(r.color).toBe('#00E400');
  });

  it('AQI 50 → Good (boundary)', () => {
    const r = getAqiCategory(50);
    expect(r.category).toBe('Good');
  });

  it('AQI 51 → Moderate', () => {
    const r = getAqiCategory(51);
    expect(r.category).toBe('Moderate');
    expect(r.color).toBe('#FFFF00');
  });

  it('AQI 100 → Moderate (boundary)', () => {
    const r = getAqiCategory(100);
    expect(r.category).toBe('Moderate');
  });

  it('AQI 101 → Unhealthy for Sensitive Groups', () => {
    const r = getAqiCategory(101);
    expect(r.category).toBe('Unhealthy for Sensitive Groups');
    expect(r.color).toBe('#FF7E00');
  });

  it('AQI 150 → Unhealthy for Sensitive Groups (boundary)', () => {
    const r = getAqiCategory(150);
    expect(r.category).toBe('Unhealthy for Sensitive Groups');
  });

  it('AQI 151 → Unhealthy', () => {
    const r = getAqiCategory(151);
    expect(r.category).toBe('Unhealthy');
    expect(r.color).toBe('#FF0000');
  });

  it('AQI 200 → Unhealthy (boundary)', () => {
    const r = getAqiCategory(200);
    expect(r.category).toBe('Unhealthy');
  });

  it('AQI 201 → Very Unhealthy', () => {
    const r = getAqiCategory(201);
    expect(r.category).toBe('Very Unhealthy');
    expect(r.color).toBe('#8F3F97');
  });

  it('AQI 300 → Very Unhealthy (boundary)', () => {
    const r = getAqiCategory(300);
    expect(r.category).toBe('Very Unhealthy');
  });

  it('AQI 301 → Hazardous', () => {
    const r = getAqiCategory(301);
    expect(r.category).toBe('Hazardous');
    expect(r.color).toBe('#7E0023');
  });

  it('AQI 500 → Hazardous (extreme)', () => {
    const r = getAqiCategory(500);
    expect(r.category).toBe('Hazardous');
  });

  it('every category has a non-empty icon', () => {
    const aqis = [25, 75, 125, 175, 250, 400];
    for (const aqi of aqis) {
      expect(getAqiCategory(aqi).icon).not.toBe('');
    }
  });

  it('every category has a healthMessage', () => {
    const aqis = [25, 75, 125, 175, 250, 400];
    for (const aqi of aqis) {
      expect(getAqiCategory(aqi).healthMessage.length).toBeGreaterThan(5);
    }
  });
});
