import { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { chatWithNotes } from '../utils/deepseekAPI';

interface ChatSectionProps {
  subjectId: string;
}

export function ChatSection({ subjectId }: ChatSectionProps) {
  const { getSubjectNotes, getSubjectChatHistory, addChatMessage, clearSubjectChat } = useApp();
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const notes = getSubjectNotes(subjectId);
  const chatHistory = getSubjectChatHistory(subjectId);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    if (notes.length === 0) {
      setError('Please upload notes first to start chatting');
      return;
    }

    const userMessage = inputMessage.trim();
    setInputMessage('');
    setError(null);
    setIsLoading(true);

    // Add user message to context immediately
    addChatMessage({
      subjectId,
      role: 'user',
      content: userMessage,
      timestamp: new Date().toISOString(),
    });

    try {
      const noteContents = notes.map(n => n.content);

      // Build history including all previous messages
      // Note: We don't include the just-added user message here because
      // it will be passed separately as userMessage parameter
      const history = chatHistory.map(msg => ({
        role: msg.role,
        content: msg.content,
      }));

      const response = await chatWithNotes(noteContents, history, userMessage);

      // Add assistant response
      addChatMessage({
        subjectId,
        role: 'assistant',
        content: response,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get response');
      // Even on error, the user message stays in history
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearChat = () => {
    if (confirm('Are you sure you want to clear the chat history?')) {
      clearSubjectChat(subjectId);
    }
  };

  const suggestedPrompts = [
    'Summarize my notes',
    'Create a study guide',
    'What are the key concepts?',
    'Quiz me on this material',
    'Explain this topic simply',
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-16rem)]">
      {/* Header */}
      <div className="bg-white rounded-t-lg border border-b-0 border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">AI Study Assistant</h3>
            <p className="text-sm text-gray-600">
              {notes.length} {notes.length === 1 ? 'note' : 'notes'} loaded
            </p>
          </div>
          {chatHistory.length > 0 && (
            <button
              onClick={handleClearChat}
              className="text-sm text-red-600 hover:text-red-800 font-medium"
            >
              Clear Chat
            </button>
          )}
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 bg-white border-l border-r border-gray-200 overflow-y-auto p-4 space-y-4">
        {notes.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-2">No notes available</p>
            <p className="text-sm text-gray-500">Upload notes to start chatting with your study assistant</p>
          </div>
        ) : chatHistory.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">Start a conversation about your notes!</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {suggestedPrompts.map((prompt, index) => (
                <button
                  key={index}
                  onClick={() => setInputMessage(prompt)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          chatHistory.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-3xl px-4 py-3 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                <p className={`text-xs mt-2 ${message.role === 'user' ? 'text-blue-200' : 'text-gray-500'}`}>
                  {new Date(message.timestamp).toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          ))
        )}

        {isLoading && (
          <div className="flex justify-start">
            <div className="max-w-3xl px-4 py-3 rounded-lg bg-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white rounded-b-lg border border-t-0 border-gray-200 p-4">
        {error && (
          <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
            {error}
          </div>
        )}

        <div className="flex gap-2">
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={notes.length === 0 ? "Upload notes first..." : "Ask anything about your notes... (Press Enter to send)"}
            disabled={isLoading || notes.length === 0}
            rows={3}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none disabled:bg-gray-100"
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading || notes.length === 0}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:bg-gray-400 disabled:cursor-not-allowed self-end"
          >
            {isLoading ? '...' : 'Send'}
          </button>
        </div>

        <p className="text-xs text-gray-500 mt-2">
          💡 Tip: Ask for summaries, explanations, study guides, or practice questions
        </p>
      </div>
    </div>
  );
}
