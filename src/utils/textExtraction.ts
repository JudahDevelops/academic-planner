import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const MAX_TEXT_LENGTH = 100000; // 100KB limit per file

export interface ExtractionResult {
  success: boolean;
  text?: string;
  error?: string;
}

/**
 * Extract text from PDF file
 */
export async function extractTextFromPDF(file: File): Promise<ExtractionResult> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    let fullText = '';

    // Extract text from all pages
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      fullText += pageText + '\n\n';

      // Stop if we exceed the limit
      if (fullText.length > MAX_TEXT_LENGTH) {
        fullText = fullText.substring(0, MAX_TEXT_LENGTH);
        break;
      }
    }

    return {
      success: true,
      text: fullText.trim(),
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to extract PDF text',
    };
  }
}

/**
 * Extract text from DOCX file
 */
export async function extractTextFromDOCX(file: File): Promise<ExtractionResult> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });

    let text = result.value;

    // Truncate if too long
    if (text.length > MAX_TEXT_LENGTH) {
      text = text.substring(0, MAX_TEXT_LENGTH);
    }

    return {
      success: true,
      text: text.trim(),
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to extract DOCX text',
    };
  }
}

/**
 * Extract text from plain text file
 */
export async function extractTextFromPlainText(file: File): Promise<ExtractionResult> {
  try {
    let text = await file.text();

    // Truncate if too long
    if (text.length > MAX_TEXT_LENGTH) {
      text = text.substring(0, MAX_TEXT_LENGTH);
    }

    return {
      success: true,
      text: text.trim(),
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to read text file',
    };
  }
}

/**
 * Extract text from image (placeholder - requires OCR or Vision API)
 */
export async function extractTextFromImage(file: File): Promise<ExtractionResult> {
  // For now, store the image data URL and use DeepSeek Vision API later
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve({
        success: true,
        text: `[Image: ${file.name}]\n(Image text extraction requires Vision API - will be processed during quiz generation)`,
      });
    };
    reader.onerror = () => {
      resolve({
        success: false,
        error: 'Failed to read image file',
      });
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Main function to extract text from any supported file type
 */
export async function extractText(file: File): Promise<ExtractionResult> {
  const fileType = file.type.toLowerCase();
  const fileName = file.name.toLowerCase();

  // Determine file type and extract accordingly
  if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
    return extractTextFromPDF(file);
  }

  if (
    fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    fileName.endsWith('.docx')
  ) {
    return extractTextFromDOCX(file);
  }

  if (
    fileType.startsWith('text/') ||
    fileName.endsWith('.txt') ||
    fileName.endsWith('.md')
  ) {
    return extractTextFromPlainText(file);
  }

  if (fileType.startsWith('image/')) {
    return extractTextFromImage(file);
  }

  return {
    success: false,
    error: `Unsupported file type: ${fileType || 'unknown'}`,
  };
}

/**
 * Validate file size
 */
export function validateFileSize(file: File, maxSizeMB: number = 5): boolean {
  const maxBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxBytes;
}

/**
 * Get file type category
 */
export function getFileType(file: File): 'pdf' | 'docx' | 'txt' | 'md' | 'image' {
  const fileType = file.type.toLowerCase();
  const fileName = file.name.toLowerCase();

  if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) return 'pdf';
  if (
    fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    fileName.endsWith('.docx')
  ) return 'docx';
  if (fileName.endsWith('.md')) return 'md';
  if (fileType.startsWith('image/')) return 'image';
  return 'txt';
}
