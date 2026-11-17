import { calcVentilationWindows } from '@/lib/calc/ventilation';

describe('calcVentilationWindows', () => {
  it('no ventilation window when all outdoor > indoor', () => {
    // indoor = 50, all outdoor = [60, 70, 80] — none qualify
    const windows = calcVentilationWindows([60, 70, 80], 50);
    expect(windows).toHaveLength(0);
  });

  it('single contiguous window in the middle', () => {
    // indoor=100, outdoor=[120, 40, 30, 50, 110]
    // hours 1-3 qualify (40,30,50 < 100)
    const windows = calcVentilationWindows([120, 40, 30, 50, 110], 100);
    expect(windows).toHaveLength(1);
    expect(windows[0]?.startHour).toBe(1);
    expect(windows[0]?.endHour).toBe(3);
    // avg = (40+30+50)/3 = 40
    expect(windows[0]?.avgPm25).toBeCloseTo(40);
  });

  it('multiple separate windows', () => {
    // indoor=100, outdoor=[20, 150, 10, 10, 200, 5]
    // window 1: h0 (20), window 2: h2-3 (10,10), window 3: h5 (5)
    const windows = calcVentilationWindows([20, 150, 10, 10, 200, 5], 100);
    expect(windows).toHaveLength(3);
  });

  it('all outdoor < indoor — one full window', () => {
    const outdoor = [10, 20, 30, 40];
    const windows = calcVentilationWindows(outdoor, 50);
    expect(windows).toHaveLength(1);
    expect(windows[0]?.startHour).toBe(0);
    expect(windows[0]?.endHour).toBe(3);
    expect(windows[0]?.avgPm25).toBeCloseTo(25);
  });

  it('property: never returns windows where outdoor ≥ indoor', () => {
    const outdoor = [80, 20, 150, 30, 60];
    const indoor = 50;
    const windows = calcVentilationWindows(outdoor, indoor);
    for (const w of windows) {
      for (let h = w.startHour; h <= w.endHour; h++) {
        expect(outdoor[h]).toBeLessThan(indoor);
      }
    }
  });

  it('empty outdoor array → empty windows', () => {
    const windows = calcVentilationWindows([], 50);
    expect(windows).toHaveLength(0);
  });

  it('single qualifying hour → window with startHour === endHour', () => {
    const windows = calcVentilationWindows([200, 10, 200], 50);
    expect(windows).toHaveLength(1);
    expect(windows[0]?.startHour).toBe(1);
    expect(windows[0]?.endHour).toBe(1);
  });
});
