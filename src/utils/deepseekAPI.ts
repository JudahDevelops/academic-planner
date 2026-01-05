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
          max_tokens: 4000,
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

  const systemPrompt = `You are an expert quiz generator. Generate exactly ${questionCount} multiple-choice questions based on the provided study notes.

CRITICAL REQUIREMENTS:
1. Return ONLY valid JSON - no markdown, no code blocks, no explanatory text
2. Format: {"questions": [array of question objects]}
3. Each question must have: question, options (array of 4 strings), correctAnswer (number 0-3), explanation
4. Questions should test understanding, not just memorization
5. Make options plausible but clearly distinguishable
6. Include brief explanations for the correct answers

Example format:
{
  "questions": [
    {
      "question": "What is the time complexity of binary search?",
      "options": ["O(n)", "O(log n)", "O(n²)", "O(1)"],
      "correctAnswer": 1,
      "explanation": "Binary search divides the search space in half each iteration, resulting in O(log n) time complexity."
    }
  ]
}`;

  const userPrompt = `Generate ${questionCount} multiple-choice questions from these notes:\n\n${combinedContent}`;

  try {
    const response = await callDeepSeek([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ]);

    console.log('Raw DeepSeek response:', response.substring(0, 200) + '...');

    // Extract JSON from response (handle markdown code blocks and extra text)
    let jsonString = response.trim();

    // Remove markdown code blocks if present
    if (jsonString.includes('```')) {
      const match = jsonString.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
      if (match) {
        jsonString = match[1];
      } else {
        // Try to find JSON between any code blocks
        jsonString = jsonString.replace(/```(?:json)?/g, '').replace(/```/g, '');
      }
    }

    // Find JSON object in the string (in case there's extra text)
    const jsonMatch = jsonString.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonString = jsonMatch[0];
    }

    console.log('Extracted JSON:', jsonString.substring(0, 200) + '...');

    // Parse the response
    const parsed = JSON.parse(jsonString);

    if (!parsed.questions || !Array.isArray(parsed.questions)) {
      throw new Error('Invalid response format: missing questions array');
    }

    if (parsed.questions.length === 0) {
      throw new Error('No questions were generated');
    }

    const questions: Question[] = parsed.questions.map((q: any, index: number) => {
      if (!q.question || !q.options || !Array.isArray(q.options)) {
        throw new Error(`Invalid question format at index ${index}`);
      }

      return {
        id: `q-${Date.now()}-${index}`,
        question: q.question,
        options: q.options as [string, string, string, string],
        correctAnswer: q.correctAnswer as 0 | 1 | 2 | 3,
        explanation: q.explanation,
      };
    });

    console.log(`Successfully generated ${questions.length} questions`);
    return questions;
  } catch (error) {
    console.error('Quiz generation error:', error);
    if (error instanceof SyntaxError) {
      throw new Error('Failed to parse AI response. The AI returned invalid JSON. Please try again.');
    }
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

  const systemPrompt = `You are a helpful study assistant. You have access to the student's notes and can answer questions about them, create summaries, explain concepts, and help with studying.

Available notes:
${combinedContent}

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
