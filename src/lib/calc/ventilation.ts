import type { VentilationWindow } from './types';

/**
 * Find contiguous windows where outdoor PM2.5 is lower than indoor PM2.5,
 * indicating that opening windows would improve indoor air quality.
 *
 * @param hourlyOutdoorPm25UgM3  - Hourly outdoor PM2.5 array (µg/m³)
 * @param indoorPm25ClosedUgM3   - Indoor PM2.5 with windows closed (µg/m³)
 * @returns Array of ventilation windows; empty = keep windows closed
 */
export function calcVentilationWindows(
  hourlyOutdoorPm25UgM3: number[],
  indoorPm25ClosedUgM3: number,
): VentilationWindow[] {
  const windows: VentilationWindow[] = [];
  let windowStart: number | null = null;
  let windowSum = 0;
  let windowCount = 0;

  for (const [h, outdoorVal] of hourlyOutdoorPm25UgM3.entries()) {
    const outdoor = outdoorVal;
    const isGood = outdoor < indoorPm25ClosedUgM3;

    if (isGood) {
      if (windowStart === null) {
        windowStart = h;
        windowSum = 0;
        windowCount = 0;
      }
      windowSum += outdoor;
      windowCount += 1;
    } else {
      if (windowStart !== null && windowCount > 0) {
        windows.push({
          startHour: windowStart,
          endHour: h - 1,
          avgPm25: windowSum / windowCount,
        });
      }
      windowStart = null;
      windowSum = 0;
      windowCount = 0;
    }
  }

  // Close any open window at end of array
  if (windowStart !== null && windowCount > 0) {
    windows.push({
      startHour: windowStart,
      endHour: hourlyOutdoorPm25UgM3.length - 1,
      avgPm25: windowSum / windowCount,
    });
  }

  return windows;
}
