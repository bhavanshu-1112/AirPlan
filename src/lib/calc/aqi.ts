/** AQI category breakpoints and health messaging (US AQI scale). */
const AQI_CATEGORIES: ReadonlyArray<{
  max: number;
  category: string;
  color: string;
  icon: string;
  healthMessage: string;
}> = [
  {
    max: 50,
    category: 'Good',
    color: '#00E400',
    icon: '😊',
    healthMessage: 'Air quality is satisfactory. Enjoy outdoor activities.',
  },
  {
    max: 100,
    category: 'Moderate',
    color: '#FFFF00',
    icon: '🙂',
    healthMessage: 'Acceptable; sensitive individuals should consider limiting prolonged outdoor exposure.',
  },
  {
    max: 150,
    category: 'Unhealthy for Sensitive Groups',
    color: '#FF7E00',
    icon: '😐',
    healthMessage: 'Members of sensitive groups may experience health effects. General public is less likely to be affected.',
  },
  {
    max: 200,
    category: 'Unhealthy',
    color: '#FF0000',
    icon: '😷',
    healthMessage: 'Everyone may begin to experience health effects. Sensitive groups may experience more serious effects.',
  },
  {
    max: 300,
    category: 'Very Unhealthy',
    color: '#8F3F97',
    icon: '🤢',
    healthMessage: 'Health alert: everyone may experience more serious health effects.',
  },
];

const HAZARDOUS_ENTRY = {
  category: 'Hazardous',
  color: '#7E0023',
  icon: '☠️',
  healthMessage: 'Health warning of emergency conditions. The entire population is likely to be affected.',
} as const;

/**
 * Get AQI category info for a given US AQI value.
 *
 * @param aqiValue - US AQI value (0–500+)
 * @returns Category name, hex color, emoji icon, and health message
 */
export function getAqiCategory(aqiValue: number): {
  category: string;
  color: string;
  icon: string;
  healthMessage: string;
} {
  for (const entry of AQI_CATEGORIES) {
    if (aqiValue <= entry.max) {
      return {
        category: entry.category,
        color: entry.color,
        icon: entry.icon,
        healthMessage: entry.healthMessage,
      };
    }
  }
  return HAZARDOUS_ENTRY;
}
