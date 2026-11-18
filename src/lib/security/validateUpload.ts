interface UploadValidationResult {
  valid: boolean;
  mimeType: string;
  error?: string | undefined;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

function isJpeg(buffer: Buffer): boolean {
  return buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
}

function isPng(buffer: Buffer): boolean {
  return (
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  );
}

function isWebp(buffer: Buffer): boolean {
  return (
    buffer.length >= 12 &&
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50
  );
}

/**
 * Validate an uploaded file buffer by checking magic bytes and size.
 * Accepts JPEG, PNG, and WebP only.
 * @param buffer - Raw file buffer
 * @returns Validation result with MIME type and optional error message
 */
export function validateUpload(buffer: Buffer): UploadValidationResult {
  if (buffer.length > MAX_FILE_SIZE) {
    return { valid: false, mimeType: '', error: 'File exceeds maximum size of 5 MB' };
  }

  if (isJpeg(buffer)) return { valid: true, mimeType: 'image/jpeg' };
  if (isPng(buffer)) return { valid: true, mimeType: 'image/png' };
  if (isWebp(buffer)) return { valid: true, mimeType: 'image/webp' };

  return {
    valid: false,
    mimeType: '',
    error: 'Unsupported file type. Only JPEG, PNG, and WebP are accepted.',
  };
}
