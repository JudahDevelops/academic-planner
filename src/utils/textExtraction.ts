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
 * Extract text and analyze images using GPT-4 Vision
 */
export async function extractTextFromImage(
  file: File,
  onProgress?: ProgressCallback
): Promise<ExtractionResult> {
  try {
    // Import GPT-4 Vision utility dynamically
    const { analyzeImageWithGPT } = await import('./gptVision');

    const result = await analyzeImageWithGPT(
      file,
      (progress) => {
        onProgress?.(progress, `Analyzing image... ${progress}%`);
      },
      (status) => {
        onProgress?.(0, status);
      }
    );

    // If analysis completed but found no/little content, still save the image with a helpful message
    if (!result.success) {
      const noContentMessage = result.text && result.text.length > 0
        ? `📸 Image uploaded: ${file.name}\n\nExtracted content (low confidence):\n${result.text}\n\n⚠️ ${result.error}`
        : `📸 Image uploaded: ${file.name}\n\n⚠️ No content detected in this image.\n\nPossible reasons:\n- Image is blank or corrupted\n- Image quality is too low\n- API error occurred\n\nYou can still use this image as a reference, but AI features may not work without content.`;

      return {
        success: true, // Treat as success so the note is saved
        text: noContentMessage,
      };
    }

    return {
      success: true,
      text: `📸 Analyzed with GPT-4 Vision: ${file.name}\n\n${result.text}`,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to analyze image',
    };
  }
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
