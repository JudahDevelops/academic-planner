import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const MAX_TEXT_LENGTH = 500000; // 500KB limit per file (increased for full documents)
const INITIAL_PAGES = 10; // Quick initial extraction for fast feedback
const BATCH_SIZE = 5; // Process remaining pages in batches

export interface ExtractionResult {
  success: boolean;
  text?: string;
  error?: string;
}

export type ProgressCallback = (progress: number, status: string) => void;

/**
 * Extract text from PDF file
 */
export async function extractTextFromPDF(
  file: File,
  onProgress?: ProgressCallback
): Promise<ExtractionResult> {
  try {
    onProgress?.(10, 'Loading PDF...');
    const arrayBuffer = await file.arrayBuffer();

    onProgress?.(20, 'Parsing PDF structure...');
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    let fullText = '';
    const totalPages = pdf.numPages;

    // Phase 1: Quick initial extraction (first 10 pages for fast feedback)
    const initialPages = Math.min(totalPages, INITIAL_PAGES);

    for (let i = 1; i <= initialPages; i++) {
      const progress = 20 + Math.floor((i / totalPages) * 40);
      onProgress?.(progress, `Loading page ${i}/${totalPages}...`);

      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      fullText += pageText + '\n\n';

      if (fullText.length > MAX_TEXT_LENGTH) {
        fullText = fullText.substring(0, MAX_TEXT_LENGTH);
        onProgress?.(95, 'Content limit reached');
        return { success: true, text: fullText.trim() };
      }
    }

    // Phase 2: Process remaining pages in batches (better performance)
    if (totalPages > initialPages) {
      for (let i = initialPages + 1; i <= totalPages; i += BATCH_SIZE) {
        const batchEnd = Math.min(i + BATCH_SIZE - 1, totalPages);
        const progress = 20 + Math.floor((i / totalPages) * 70);
        onProgress?.(progress, `Processing pages ${i}-${batchEnd}/${totalPages}...`);

        // Process batch
        for (let pageNum = i; pageNum <= batchEnd; pageNum++) {
          const page = await pdf.getPage(pageNum);
          const textContent = await page.getTextContent();
          const pageText = textContent.items
            .map((item: any) => item.str)
            .join(' ');
          fullText += pageText + '\n\n';

          if (fullText.length > MAX_TEXT_LENGTH) {
            fullText = fullText.substring(0, MAX_TEXT_LENGTH);
            onProgress?.(95, 'Content limit reached');
            return { success: true, text: fullText.trim() };
          }
        }

        // Small delay between batches to keep UI responsive
        await new Promise(resolve => setTimeout(resolve, 10));
      }
    }

    onProgress?.(95, 'Finalizing...');
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
export async function extractTextFromDOCX(
  file: File,
  onProgress?: ProgressCallback
): Promise<ExtractionResult> {
  try {
    onProgress?.(10, 'Loading DOCX file...');
    const arrayBuffer = await file.arrayBuffer();

    onProgress?.(30, 'Parsing document structure...');

    // Add small delay to keep UI responsive
    await new Promise(resolve => setTimeout(resolve, 10));

    const result = await mammoth.extractRawText({ arrayBuffer });

    onProgress?.(70, 'Extracting text content...');
    let text = result.value;

    // Truncate if too long
    if (text.length > MAX_TEXT_LENGTH) {
      text = text.substring(0, MAX_TEXT_LENGTH);
      onProgress?.(90, 'Content limit reached');
    }

    onProgress?.(95, 'Finalizing...');
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
export async function extractTextFromPlainText(
  file: File,
  onProgress?: ProgressCallback
): Promise<ExtractionResult> {
  try {
    onProgress?.(30, 'Reading text file...');
    let text = await file.text();

    onProgress?.(70, 'Processing content...');
    // Truncate if too long
    if (text.length > MAX_TEXT_LENGTH) {
      text = text.substring(0, MAX_TEXT_LENGTH);
    }

    onProgress?.(95, 'Finalizing...');
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
export async function extractTextFromImage(
  file: File,
  onProgress?: ProgressCallback
): Promise<ExtractionResult> {
  // For now, store the image data URL and use DeepSeek Vision API later
  return new Promise((resolve) => {
    onProgress?.(30, 'Loading image...');
    const reader = new FileReader();
    reader.onload = () => {
      onProgress?.(95, 'Finalizing...');
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
export async function extractText(
  file: File,
  onProgress?: ProgressCallback
): Promise<ExtractionResult> {
  const fileType = file.type.toLowerCase();
  const fileName = file.name.toLowerCase();

  // Determine file type and extract accordingly
  if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
    return extractTextFromPDF(file, onProgress);
  }

  if (
    fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    fileName.endsWith('.docx')
  ) {
    return extractTextFromDOCX(file, onProgress);
  }

  if (
    fileType.startsWith('text/') ||
    fileName.endsWith('.txt') ||
    fileName.endsWith('.md')
  ) {
    return extractTextFromPlainText(file, onProgress);
  }

  if (fileType.startsWith('image/')) {
    return extractTextFromImage(file, onProgress);
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
