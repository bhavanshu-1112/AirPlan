import { z } from 'zod/v4';

export const AuditFindingSchema = z.object({
  category: z.enum(['ventilation', 'source', 'purifier', 'general']),
  observation: z.string(),
  confidence: z.number().min(0).max(1),
  suggestedFix: z.string(),
  paramAdjustment: z.record(z.string(), z.union([z.string(), z.number()])).optional(),
}).strict();

export const AuditResultSchema = z.object({
  findings: z.array(AuditFindingSchema),
  noFindings: z.boolean().optional(),
  message: z.string().optional(),
}).strict();

export type AuditFinding = z.infer<typeof AuditFindingSchema>;
export type AuditResult = z.infer<typeof AuditResultSchema>;
