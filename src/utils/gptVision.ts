import OpenAI from 'openai';

export interface VisionResult {
  success: boolean;
  text: string;
  error?: string;
}

/**
 * Convert File to base64 data URL
 */
async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Extract text and understand images using GPT-4 Vision
 * @param file - Image file (JPG, PNG, HEIC, etc.)
 * @param onProgress - Callback for progress updates (0-100)
 * @param onStatus - Callback for status messages
 * @returns Vision result with extracted text and image description
 */
export async function analyzeImageWithGPT(
  file: File,
  onProgress?: (progress: number) => void,
  onStatus?: (status: string) => void
): Promise<VisionResult> {
  try {
    console.log(`🖼️ Starting GPT-4 Vision analysis for: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`);
    console.log(`📦 File type: ${file.type}`);

    if (onStatus) onStatus('Preparing image...');
    onProgress?.(10);

    // Get OpenAI API key from environment
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey,
      dangerouslyAllowBrowser: true, // Required for client-side usage
    });

    if (onStatus) onStatus('Converting image...');
    onProgress?.(30);

    // Convert image to base64
    const base64Image = await fileToBase64(file);

    if (onStatus) onStatus('Analyzing with GPT-4 Vision...');
    onProgress?.(50);

    console.log('🔍 Sending to GPT-4 Vision...');

    // Call GPT-4 Vision API
    const response = await openai.chat.completions.create({
      model: 'gpt-4o', // gpt-4o has vision capabilities and is cheaper/faster than gpt-4-vision-preview
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Please analyze this image and extract all text content.

For images containing:
- Text documents: Extract all readable text accurately
- Handwritten notes: Transcribe the handwriting as accurately as possible
- Diagrams/charts: Describe the visual content AND extract any text labels
- Math equations: Extract formulas in readable format
- Tables: Preserve table structure in your output
- Mixed content: Extract text AND describe visual elements

Provide a comprehensive response that includes both extracted text and descriptions of visual elements.`,
            },
            {
              type: 'image_url',
              image_url: {
                url: base64Image,
                detail: 'high', // Use high detail for better text recognition
              },
            },
          ],
        },
      ],
      max_tokens: 4096,
    });

    onProgress?.(90);
    console.log('✅ GPT-4 Vision analysis completed');

    const extractedContent = response.choices[0]?.message?.content || '';

    if (!extractedContent || extractedContent.length < 10) {
      console.warn('⚠️ Very little content extracted from image');
      return {
        success: false,
        text: extractedContent,
        error: 'Very little or no content found in the image.',
      };
    }

    onProgress?.(100);
    if (onStatus) onStatus('Complete!');

    console.log(`✅ Analysis completed for: ${file.name}`);
    console.log(`📝 Extracted ${extractedContent.length} characters`);

    return {
      success: true,
      text: extractedContent,
    };

  } catch (error) {
    console.error('❌ GPT-4 Vision Error:', error);
    console.error('❌ Error details:', error instanceof Error ? error.message : 'Unknown error');

    return {
      success: false,
      text: '',
      error: error instanceof Error ? error.message : 'Failed to analyze image with GPT-4 Vision',
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
    'image/gif',
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
    case 'gif':
      return 'GIF Image';
    default:
      return 'Image';
  }
}
