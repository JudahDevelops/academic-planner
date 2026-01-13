import { Question } from '../types';

const DEEPSEEK_API_KEY = 'sk-a20908928c9e473994bf6414d5d5b742';
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

interface DeepSeekMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface DeepSeekResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
}

/**
 * Make a request to DeepSeek API with retry logic
 */
async function callDeepSeek(messages: DeepSeekMessage[], retries = 3): Promise<string> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`DeepSeek API attempt ${attempt}/${retries}, messages:`, messages.length);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout

      const response = await fetch(DEEPSEEK_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages,
          temperature: 0.7,
          max_tokens: 3000, // Increased for plain text format (less compact than JSON)
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      console.log('DeepSeek response status:', response.status, response.statusText);

      if (!response.ok) {
        const error = await response.text();
        console.error('DeepSeek API error response:', error);
        throw new Error(`DeepSeek API error: ${response.status} - ${error}`);
      }

      const data: DeepSeekResponse = await response.json();
      console.log('DeepSeek response received, content length:', data.choices[0].message.content.length);

      return data.choices[0].message.content;
    } catch (error) {
      console.error(`DeepSeek API call failed (attempt ${attempt}/${retries}):`, error);

      // Don't retry on the last attempt
      if (attempt === retries) {
        if (error instanceof Error && error.name === 'AbortError') {
          throw new Error('Request timeout: The API took too long to respond. Try with fewer questions or shorter notes.');
        }
        if (error instanceof TypeError && error.message.includes('fetch')) {
          throw new Error('Network error: Unable to reach DeepSeek API. Check your internet connection.');
        }
        throw error;
      }

      // Wait before retrying (exponential backoff)
      const waitTime = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
      console.log(`Waiting ${waitTime}ms before retry...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }

  throw new Error('Failed to complete API request after all retries');
}

/**
 * Generate quiz questions from note content
 */
export async function generateQuiz(
  noteContents: string[],
  questionCount: number
): Promise<Question[]> {
  const combinedContent = noteContents.join('\n\n---\n\n');

  // Limit content - using more generous limit now that we're using plain text format
  const MAX_CONTENT_LENGTH = 10000;
  const truncatedContent = combinedContent.length > MAX_CONTENT_LENGTH
    ? combinedContent.substring(0, MAX_CONTENT_LENGTH) + '\n\n[Content truncated for quiz generation.]'
    : combinedContent;

  // TESTING: Try plain text format instead of JSON to see if that avoids HTTP/2 errors
  const systemPrompt = `You are an expert quiz generator. Generate exactly ${questionCount} multiple-choice questions based on the provided study notes.

Format each question using this PLAIN TEXT structure (no JSON):

Q1: [Your question here]
A) [First option]
B) [Second option]
C) [Third option]
D) [Fourth option]
ANSWER: [Letter A/B/C/D]
EXPLANATION: [Brief 1-sentence explanation]

Q2: [Next question]
...and so on.

Keep explanations to ONE sentence each. Make options clear and distinct.`;

  const userPrompt = `Generate ${questionCount} multiple-choice questions from these notes:\n\n${truncatedContent}`;

  console.log(`Quiz generation (TEXT FORMAT): Sending ${truncatedContent.length} characters to DeepSeek (${combinedContent.length > MAX_CONTENT_LENGTH ? 'truncated from ' + combinedContent.length : 'full content'})`);

  try {
    const response = await callDeepSeek([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ]);

    console.log('Raw DeepSeek response:', response.substring(0, 300) + '...');

    // Parse plain text format
    const questions: Question[] = [];
    const questionBlocks = response.split(/Q\d+:/i).filter(block => block.trim());

    console.log(`Found ${questionBlocks.length} question blocks`);

    for (let i = 0; i < questionBlocks.length; i++) {
      const block = questionBlocks[i].trim();
      console.log(`Parsing block ${i + 1}:`, block.substring(0, 100));

      // Extract question (everything before first option)
      const questionMatch = block.match(/^(.+?)(?=[A-D]\))/s);
      if (!questionMatch) {
        console.warn(`Failed to parse question in block ${i + 1}`);
        continue;
      }
      const question = questionMatch[1].trim();

      // Extract options
      const optionMatches = block.match(/[A-D]\)\s*(.+?)(?=(?:[A-D]\)|ANSWER:|$))/gs);
      if (!optionMatches || optionMatches.length < 4) {
        console.warn(`Failed to parse options in block ${i + 1}, found ${optionMatches?.length || 0} options`);
        continue;
      }
      const options = optionMatches.slice(0, 4).map(opt =>
        opt.replace(/^[A-D]\)\s*/, '').trim()
      );

      // Extract answer
      const answerMatch = block.match(/ANSWER:\s*([A-D])/i);
      if (!answerMatch) {
        console.warn(`Failed to parse answer in block ${i + 1}`);
        continue;
      }
      const answerLetter = answerMatch[1].toUpperCase();
      const correctAnswer = ['A', 'B', 'C', 'D'].indexOf(answerLetter);

      // Extract explanation
      const explanationMatch = block.match(/EXPLANATION:\s*(.+?)$/is);
      const explanation = explanationMatch ? explanationMatch[1].trim() : '';

      questions.push({
        id: `q-${Date.now()}-${i}`,
        question,
        options: options as [string, string, string, string],
        correctAnswer: correctAnswer as 0 | 1 | 2 | 3,
        explanation,
      });
    }

    if (questions.length === 0) {
      throw new Error('Failed to parse any questions from response. Try again.');
    }

    console.log(`Successfully parsed ${questions.length} questions from plain text format`);
    return questions;
  } catch (error) {
    console.error('Quiz generation error:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to generate quiz. Please try again.');
  }
}

/**
 * Chat with AI about notes (NotebookLM style)
 */
export async function chatWithNotes(
  noteContents: string[],
  chatHistory: { role: 'user' | 'assistant'; content: string }[],
  userMessage: string
): Promise<string> {
  const combinedContent = noteContents.join('\n\n---\n\n');

  // Limit content to avoid HTTP/2 protocol errors with large documents
  const MAX_CONTENT_LENGTH = 30000;
  const truncatedContent = combinedContent.length > MAX_CONTENT_LENGTH
    ? combinedContent.substring(0, MAX_CONTENT_LENGTH) + '\n\n[Content truncated...]'
    : combinedContent;

  const systemPrompt = `You are a helpful study assistant. You have access to the student's notes and can answer questions about them, create summaries, explain concepts, and help with studying.

Available notes:
${truncatedContent}

Instructions:
- Answer questions based on the provided notes
- If asked about something not in the notes, politely say so
- Be concise but thorough
- Use examples from the notes when relevant
- Help the student understand the material, don't just repeat it`;

  const messages: DeepSeekMessage[] = [
    { role: 'system', content: systemPrompt },
    ...chatHistory.map(msg => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
    })),
    { role: 'user', content: userMessage },
  ];

  try {
    return await callDeepSeek(messages);
  } catch (error) {
    console.error('Chat error:', error);
    throw new Error('Failed to get response. Please try again.');
  }
}
