import { NextRequest } from 'next/server';
import { checkRateLimit } from '@/lib/security/rateLimit';
import {
  errorToResponse,
  RateLimitError,
  ValidationError,
} from '@/lib/security/errors';
import { validateUpload } from '@/lib/security/validateUpload';
import auditFindingsFixture from '@/fixtures/audit-findings.json';

export async function POST(request: NextRequest): Promise<Response> {
  try {
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = (forwarded ? forwarded.split(',')[0]?.trim() : null) || 'anonymous';

    const rateResult = checkRateLimit(ip, 5, 60000);
    if (!rateResult.allowed) {
      throw new RateLimitError();
    }

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

    if (process.env['DEMO_MODE'] === 'true') {
      return Response.json({ findings: auditFindingsFixture });
    }

    // Otherwise: would call vision model (for now, return fixture findings too with a TODO comment).
    // TODO: Call Anthropic vision API with AUDIT_SYSTEM_PROMPT and base64 encoded image to analyze room air quality.
    return Response.json({ findings: auditFindingsFixture });
  } catch (error) {
    return errorToResponse(error);
  }
}
