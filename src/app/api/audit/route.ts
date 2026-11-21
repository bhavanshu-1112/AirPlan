import { NextRequest } from 'next/server';
import { checkRateLimit } from '@/lib/security/rateLimit';
import { errorToResponse, RateLimitError, ValidationError } from '@/lib/security/errors';
import { validateUpload } from '@/lib/security/validateUpload';
import { getGeminiClient, AUDIT_SYSTEM_PROMPT } from '@/lib/llm';
import { logger } from '@/lib/security/logger';
import auditFindingsFixture from '@/fixtures/audit-findings.json';

async function callGeminiVision(buffer: Buffer, mimeType: string): Promise<unknown | null> {
  const client = getGeminiClient();
  if (!client) return null;

  try {
    const response = await client.generateContent({
      systemInstruction: { parts: [{ text: AUDIT_SYSTEM_PROMPT }] },
      contents: [
        {
          role: 'user',
          parts: [
            { text: 'Analyze this room photo for indoor air quality and ventilation factors.' },
            { inlineData: { mimeType, data: buffer.toString('base64') } },
          ],
        },
      ],
      generationConfig: { responseMimeType: 'application/json', temperature: 0.1 },
    });
    return JSON.parse(response.text);
  } catch (err) {
    logger.warn('[Audit API] Gemini vision failed, using fallback fixture', {
      error: err instanceof Error ? err.message : String(err),
    });
    return null;
  }
}

async function extractAndValidateImage(
  request: NextRequest,
): Promise<{ buffer: Buffer; mimeType: string }> {
  const formData = await request.formData();
  const file = formData.get('image') as File | null;
  if (!file) {
    throw new ValidationError('Image file required');
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const uploadResult = validateUpload(buffer);
  if (!uploadResult.valid) {
    throw new ValidationError(uploadResult.error ?? 'Invalid image file');
  }

  return { buffer, mimeType: file.type || 'image/jpeg' };
}

export async function POST(request: NextRequest): Promise<Response> {
  try {
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = (forwarded ? forwarded.split(',')[0]?.trim() : null) || 'anonymous';

    if (!checkRateLimit(ip, 5, 60000).allowed) {
      throw new RateLimitError();
    }

    const { buffer, mimeType } = await extractAndValidateImage(request);

    if (process.env['DEMO_MODE'] !== 'true') {
      const liveFindings = await callGeminiVision(buffer, mimeType);
      if (liveFindings) {
        return Response.json(liveFindings);
      }
    }

    return Response.json({ findings: auditFindingsFixture });
  } catch (error) {
    return errorToResponse(error);
  }
}
