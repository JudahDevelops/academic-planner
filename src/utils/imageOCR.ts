import Tesseract, { createWorker } from 'tesseract.js';

export interface OCRResult {
  success: boolean;
  text: string;
  error?: string;
  confidence?: number; // 0-100
}

/**
 * Extract text from an image file using Tesseract.js OCR
 * @param file - Image file (JPG, PNG, HEIC, etc.)
 * @param onProgress - Callback for progress updates (0-100)
 * @param onStatus - Callback for status messages
 * @returns OCR result with extracted text
 */
export async function extractTextFromImage(
  file: File,
  onProgress?: (progress: number) => void,
  onStatus?: (status: string) => void
): Promise<OCRResult> {
  try {
    console.log(`🖼️ Starting OCR for image: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`);

    if (onStatus) onStatus('Initializing OCR engine...');

    // Create Tesseract worker
    const worker = await createWorker('eng', 1, {
      logger: (m) => {
        // Track progress
        if (m.status === 'recognizing text') {
          const progress = Math.round((m.progress || 0) * 100);
          if (onProgress) onProgress(progress);
          if (onStatus) onStatus(`Recognizing text... ${progress}%`);
          console.log(`📊 OCR Progress: ${progress}%`);
        } else if (m.status) {
          if (onStatus) onStatus(m.status);
          console.log(`🔄 OCR Status: ${m.status}`);
        }
      },
    });

    if (onStatus) onStatus('Processing image...');

    // Perform OCR
    const { data } = await worker.recognize(file);

    // Terminate worker to free memory
    await worker.terminate();

    const extractedText = data.text.trim();
    const confidence = data.confidence;

    console.log(`✅ OCR completed for: ${file.name}`);
    console.log(`📝 Extracted ${extractedText.length} characters with ${confidence.toFixed(1)}% confidence`);

    if (!extractedText || extractedText.length < 10) {
      console.warn('⚠️ Very little text extracted from image');
      return {
        success: false,
        text: extractedText,
        error: 'Very little or no text found in the image. The image might not contain readable text.',
        confidence,
      };
    }

    return {
      success: true,
      text: extractedText,
      confidence,
    };

  } catch (error) {
    console.error('❌ OCR Error:', error);
    return {
      success: false,
      text: '',
      error: error instanceof Error ? error.message : 'Failed to extract text from image',
    };
  }
}

/**
 * Check if a file is an image type
 */
export function isImageFile(file: File): boolean {
  const imageTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/heic',
    'image/heif',
    'image/webp',
    'image/bmp',
    'image/tiff',
  ];

  return imageTypes.includes(file.type.toLowerCase());
}

/**
 * Get display name for image file type
 */
export function getImageTypeName(file: File): string {
  const ext = file.name.split('.').pop()?.toLowerCase() || '';

  switch (ext) {
    case 'jpg':
    case 'jpeg':
      return 'JPEG Image';
    case 'png':
      return 'PNG Image';
    case 'heic':
    case 'heif':
      return 'HEIC Image';
    case 'webp':
      return 'WebP Image';
    case 'bmp':
      return 'BMP Image';
    case 'tiff':
    case 'tif':
      return 'TIFF Image';
    default:
      return 'Image';
  }
}
