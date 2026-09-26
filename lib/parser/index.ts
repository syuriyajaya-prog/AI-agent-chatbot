// Resume parser supporting PDF (pdf-parse) and DOCX (mammoth)

export async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  try {
    // Dynamic import to prevent bundler and serverless build issues
    // eslint-disable-next-line
    const pdf = require('pdf-parse');
    const parseFn = typeof pdf === 'function' ? pdf : pdf.default;

    const data = await parseFn(buffer);
    const cleaned = cleanExtractedText(data.text || '');
    if (cleaned.length > 20) {
      return cleaned;
    }
  } catch (error) {
    console.warn('pdf-parse parser encountered an issue, attempting raw text fallback:', error);
  }

  // Fallback: extract ASCII and printable text tokens directly from PDF stream
  try {
    const rawString = buffer.toString('latin1');
    const matches: string[] = [];

    // Match text blocks inside PDF (text) Tj
    const textMatches = rawString.match(/\(([^)]+)\)\s*Tj/g);
    if (textMatches && textMatches.length > 0) {
      textMatches.forEach(m => {
        const clean = m.replace(/^\(/, '').replace(/\)\s*Tj$/, '').trim();
        if (clean.length > 0) matches.push(clean);
      });
      return cleanExtractedText(matches.join(' '));
    }

    // Direct printable ASCII scan fallback
    const printable = rawString.replace(/[^\x20-\x7E\n\r\t]/g, ' ');
    return cleanExtractedText(printable);
  } catch (rawErr) {
    console.error('All PDF extraction attempts failed:', rawErr);
    throw new Error('Failed to extract readable text from PDF resume.');
  }
}

export async function extractTextFromDocx(buffer: Buffer): Promise<string> {
  try {
    // eslint-disable-next-line
    const mammoth = require('mammoth');
    const result = await mammoth.extractRawText({ buffer });
    return cleanExtractedText(result.value || '');
  } catch (error) {
    console.error('Error extracting text from DOCX:', error);
    throw new Error(`Failed to parse DOCX resume: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function extractResumeText(filename: string, buffer: Buffer): Promise<string> {
  const ext = filename.split('.').pop()?.toLowerCase();
  if (ext === 'pdf') {
    return extractTextFromPdf(buffer);
  } else if (ext === 'docx' || ext === 'doc') {
    return extractTextFromDocx(buffer);
  } else if (ext === 'txt') {
    return cleanExtractedText(buffer.toString('utf-8'));
  } else {
    throw new Error(`Unsupported resume file format: .${ext}. Only PDF and DOCX files are supported.`);
  }
}

function cleanExtractedText(text: string): string {
  if (!text) return '';
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // remove non-printable ASCII
    .replace(/\s+/g, ' ')
    .trim();
}
