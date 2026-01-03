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
 * Make a request to DeepSeek API
 */
async function callDeepSeek(messages: DeepSeekMessage[]): Promise<string> {
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
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`DeepSeek API error: ${response.status} - ${error}`);
  }

  const data: DeepSeekResponse = await response.json();
  return data.choices[0].message.content;
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

    // Parse the response
    const parsed = JSON.parse(response);
    const questions: Question[] = parsed.questions.map((q: any, index: number) => ({
      id: `q-${Date.now()}-${index}`,
      question: q.question,
      options: q.options as [string, string, string, string],
      correctAnswer: q.correctAnswer as 0 | 1 | 2 | 3,
      explanation: q.explanation,
    }));

    return questions;
  } catch (error) {
    console.error('Quiz generation error:', error);
    throw new Error('Failed to generate quiz. Please try again.');
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
