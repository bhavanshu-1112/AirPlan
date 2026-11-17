import { z } from 'zod/v4';

export const GeocodingResultSchema = z.object({
  name: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  country: z.string(),
  admin1: z.string().optional(),
}).strict();

export const HourlyForecastSchema = z.object({
  time: z.array(z.string()),
  pm2_5: z.array(z.number()),
  pm10: z.array(z.number()),
  us_aqi: z.array(z.number()),
}).strict();

export const ForecastResponseSchema = z.object({
  hourly: HourlyForecastSchema,
  hourly_units: z.record(z.string(), z.string()),
}).strict();

export type GeocodingResult = z.infer<typeof GeocodingResultSchema>;
export type HourlyForecast = z.infer<typeof HourlyForecastSchema>;
export type ForecastResponse = z.infer<typeof ForecastResponseSchema>;
