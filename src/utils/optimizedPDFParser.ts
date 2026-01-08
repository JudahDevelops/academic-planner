import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const MAX_TEXT_LENGTH = 500000; // 500KB limit
const PREVIEW_PAGES = 5; // Number of pages for quick preview
const FULL_PARSE_CHUNK_SIZE = 10; // Process 10 pages at a time for full parse

export interface ExtractionResult {
  success: boolean;
  text?: string;
  error?: string;
  pageCount?: number;
  isPreview?: boolean;
}

export type ProgressCallback = (progress: number, status: string) => void;

/**
 * Quick preview extraction - parse first N pages only
 * This gives users instant feedback while full parsing happens in background
 */
export async function extractPreview(
  file: File,
  onProgress?: ProgressCallback
): Promise<ExtractionResult> {
  try {
    onProgress?.(10, 'Loading PDF...');
    const arrayBuffer = await file.arrayBuffer();

    onProgress?.(20, 'Parsing structure...');
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    const pagesToParse = Math.min(pdf.numPages, PREVIEW_PAGES);
    let previewText = '';

    for (let i = 1; i <= pagesToParse; i++) {
      const progress = 20 + Math.floor((i / pagesToParse) * 70);
      onProgress?.(progress, `Quick scan: page ${i}/${pagesToParse}...`);

      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      previewText += pageText + '\n\n';

      if (previewText.length > MAX_TEXT_LENGTH) {
        previewText = previewText.substring(0, MAX_TEXT_LENGTH);
        break;
      }
    }

    onProgress?.(95, 'Preview ready!');

    return {
      success: true,
      text: previewText.trim(),
      pageCount: pdf.numPages,
      isPreview: pdf.numPages > PREVIEW_PAGES,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Preview extraction failed',
    };
  }
}

/**
 * Smart sampling - extract text from strategic pages
 * Parses first pages, last pages, and every Nth page in between
 */
export async function extractSmartSample(
  file: File,
  onProgress?: ProgressCallback
): Promise<ExtractionResult> {
  try {
    onProgress?.(10, 'Loading PDF...');
    const arrayBuffer = await file.arrayBuffer();

    onProgress?.(20, 'Analyzing document...');
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const totalPages = pdf.numPages;

    // Determine which pages to parse
    const pagesToParse: number[] = [];

    // Always parse first 3 pages
    for (let i = 1; i <= Math.min(3, totalPages); i++) {
      pagesToParse.push(i);
    }

    // Sample middle pages (every 10th page)
    if (totalPages > 10) {
      for (let i = 10; i < totalPages - 3; i += 10) {
        pagesToParse.push(i);
      }
    }

    // Always parse last 2 pages
    if (totalPages > 3) {
      for (let i = Math.max(4, totalPages - 1); i <= totalPages; i++) {
        if (!pagesToParse.includes(i)) {
          pagesToParse.push(i);
        }
      }
    }

    let sampledText = '';

    for (let idx = 0; idx < pagesToParse.length; idx++) {
      const pageNum = pagesToParse[idx];
      const progress = 20 + Math.floor((idx / pagesToParse.length) * 70);
      onProgress?.(progress, `Sampling: page ${pageNum}/${totalPages}...`);

      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      sampledText += `\n--- Page ${pageNum} ---\n${pageText}\n`;

      if (sampledText.length > MAX_TEXT_LENGTH) {
        sampledText = sampledText.substring(0, MAX_TEXT_LENGTH);
        break;
      }
    }

    onProgress?.(95, 'Sample ready!');

    return {
      success: true,
      text: sampledText.trim(),
      pageCount: totalPages,
      isPreview: true,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Sampling failed',
    };
  }
}

/**
 * Optimized full extraction with chunking
 * Processes pages in batches to keep UI responsive
 */
export async function extractFullOptimized(
  file: File,
  onProgress?: ProgressCallback
): Promise<ExtractionResult> {
  try {
    onProgress?.(10, 'Loading PDF...');
    const arrayBuffer = await file.arrayBuffer();

    onProgress?.(15, 'Parsing structure...');
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const totalPages = pdf.numPages;

    let fullText = '';
    let processedPages = 0;

    // Process in chunks
    for (let startPage = 1; startPage <= totalPages; startPage += FULL_PARSE_CHUNK_SIZE) {
      const endPage = Math.min(startPage + FULL_PARSE_CHUNK_SIZE - 1, totalPages);

      const progress = 15 + Math.floor((startPage / totalPages) * 75);
      onProgress?.(progress, `Processing pages ${startPage}-${endPage}/${totalPages}...`);

      // Parse chunk
      for (let pageNum = startPage; pageNum <= endPage; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ');
        fullText += pageText + '\n\n';
        processedPages++;

        if (fullText.length > MAX_TEXT_LENGTH) {
          fullText = fullText.substring(0, MAX_TEXT_LENGTH);
          onProgress?.(95, 'Content limit reached');
          return {
            success: true,
            text: fullText.trim(),
            pageCount: totalPages,
            isPreview: false,
          };
        }
      }

      // Small delay between chunks to keep UI responsive
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    onProgress?.(95, 'Complete!');

    return {
      success: true,
      text: fullText.trim(),
      pageCount: totalPages,
      isPreview: false,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Extraction failed',
    };
  }
}

/**
 * Main extraction function - uses smart strategy based on document size
 */
export async function extractTextOptimized(
  file: File,
  onProgress?: ProgressCallback,
  strategy: 'preview' | 'sample' | 'full' = 'sample'
): Promise<ExtractionResult> {
  const fileType = file.type.toLowerCase();
  const fileName = file.name.toLowerCase();

  // Check if it's a PDF
  if (fileType !== 'application/pdf' && !fileName.endsWith('.pdf')) {
    // For non-PDFs, use simple text extraction
    if (fileType.startsWith('text/') || fileName.endsWith('.txt') || fileName.endsWith('.md')) {
      try {
        onProgress?.(30, 'Reading text file...');
        let text = await file.text();
        if (text.length > MAX_TEXT_LENGTH) {
          text = text.substring(0, MAX_TEXT_LENGTH);
        }
        onProgress?.(95, 'Complete!');
        return { success: true, text: text.trim() };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to read text file',
        };
      }
    }

    return {
      success: false,
      error: 'Unsupported file type. Please upload PDF or text files.',
    };
  }

  // Use appropriate strategy for PDFs
  switch (strategy) {
    case 'preview':
      return extractPreview(file, onProgress);
    case 'sample':
      return extractSmartSample(file, onProgress);
    case 'full':
      return extractFullOptimized(file, onProgress);
    default:
      return extractSmartSample(file, onProgress);
  }
}
