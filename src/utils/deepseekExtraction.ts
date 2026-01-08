const DEEPSEEK_API_KEY = 'sk-a20908928c9e473994bf6414d5d5b742';
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

export interface ExtractionResult {
  success: boolean;
  text?: string;
  error?: string;
}

export type ProgressCallback = (progress: number, status: string) => void;

/**
 * Extract text from a file using DeepSeek API
 * Supports PDFs, images, and documents
 */
export async function extractTextWithDeepSeek(
  file: File,
  onProgress?: ProgressCallback
): Promise<ExtractionResult> {
  try {
    onProgress?.(10, 'Reading file...');

    // Convert file to base64
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Extract base64 data after the data URL prefix
        const base64Data = result.split(',')[1];
        resolve(base64Data);
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });

    onProgress?.(30, 'Sending to DeepSeek API...');

    // Determine the file type
    const fileType = file.type || 'application/octet-stream';
    const isImage = fileType.startsWith('image/');
    const isPDF = fileType === 'application/pdf';

    // For PDFs and images, we'll use vision API approach
    // For other text files, we could potentially send directly
    if (!isImage && !isPDF) {
      // For text files, read directly
      const text = await file.text();
      onProgress?.(100, 'Complete!');
      return {
        success: true,
        text: text.trim(),
      };
    }

    // Construct the API request for vision/OCR
    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: 'You are an expert document text extraction assistant. Extract ALL text content from the provided document/image and return it in plain text format. Preserve formatting, structure, headings, lists, and paragraphs. Do not add any commentary, explanations, or markdown formatting - just return the extracted text exactly as it appears in the document.',
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Please extract all text from this document. Return only the extracted text with no additional formatting or commentary.',
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:${fileType};base64,${base64}`,
                },
              },
            ],
          },
        ],
        temperature: 0.1, // Low temperature for accuracy
        max_tokens: 16000, // Allow long documents
      }),
    });

    onProgress?.(70, 'Processing response...');

    if (!response.ok) {
      const error = await response.text();
      console.error('DeepSeek API error:', error);
      throw new Error(`API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    const extractedText = data.choices[0]?.message?.content;

    if (!extractedText) {
      throw new Error('No text extracted from document');
    }

    onProgress?.(100, 'Complete!');

    return {
      success: true,
      text: extractedText.trim(),
    };
  } catch (error) {
    console.error('DeepSeek extraction error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Text extraction failed',
    };
  }
}
