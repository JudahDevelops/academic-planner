import { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { chatWithNotes } from '../utils/deepseekAPI';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { IdeaIcon } from './icons';

interface ChatSectionProps {
  subjectId: string;
}

export function ChatSection({ subjectId }: ChatSectionProps) {
  const {
    getSubjectNotes,
    getSubjectMessages,
    addChatMessage,
    clearSubjectChat,
  } = useApp();

  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedNoteIds, setSelectedNoteIds] = useState<string[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const notes = getSubjectNotes(subjectId);
  const chatHistory = getSubjectMessages(subjectId);

  // Auto-select all notes by default
  useEffect(() => {
    if (notes.length > 0 && selectedNoteIds.length === 0) {
      setSelectedNoteIds(notes.map(n => n.id));
    }
  }, [notes.length]);

  // Auto-scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    setError(null);
    setIsLoading(true);

    // Add user message
    const userMsg = {
      subjectId,
      role: 'user' as const,
      content: userMessage,
      timestamp: new Date().toISOString(),
    };

    await addChatMessage(userMsg);

    try {
      const selectedNotes = notes.filter(n => selectedNoteIds.includes(n.id));
      const noteContents = selectedNotes.map(n => n.content);

      if (noteContents.length === 0) {
        setError('Please select at least one note');
        setIsLoading(false);
        return;
      }

      const history = chatHistory.map(msg => ({
        role: msg.role,
        content: msg.content,
      }));

      const response = await chatWithNotes(noteContents, history, userMessage);

      await addChatMessage({
        subjectId,
        role: 'assistant' as const,
        content: response,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get response');
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

  const toggleNoteSelection = (noteId: string) => {
    setSelectedNoteIds(prev =>
      prev.includes(noteId)
        ? prev.filter(id => id !== noteId)
        : [...prev, noteId]
    );
  };

  const suggestedPrompts = [
    'Summarize my notes',
    'Create a study guide',
    'What are the key concepts?',
    'Quiz me on this material',
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-16rem)]">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-t-lg border border-b-0 border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">AI Study Assistant</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {selectedNoteIds.length} of {notes.length} notes selected
            </p>
          </div>
          {chatHistory.length > 0 && (
            <button
              onClick={() => clearSubjectChat(subjectId)}
              className="text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 font-medium"
            >
              Clear Chat
            </button>
          )}
        </div>

        {/* Note Selection */}
        {notes.length > 0 && (
          <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select Notes for AI Context
            </label>
            <div className="flex flex-wrap gap-2">
              {notes.map((note) => (
                <label
                  key={note.id}
                  className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg text-sm cursor-pointer transition-colors ${
                    selectedNoteIds.includes(note.id)
                      ? 'bg-blue-600 dark:bg-blue-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedNoteIds.includes(note.id)}
                    onChange={() => toggleNoteSelection(note.id)}
                    className="sr-only"
                  />
                  <span>{note.title}</span>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Chat Messages */}
      <div className="flex-1 bg-white dark:bg-gray-800 border-l border-r border-gray-200 dark:border-gray-700 overflow-y-auto p-4 space-y-4">
        {chatHistory.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600 dark:text-gray-400 mb-4">Start a conversation!</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {suggestedPrompts.map((prompt, index) => (
                <button
                  key={index}
                  onClick={() => setInputMessage(prompt)}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm"
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
                    ? 'bg-blue-600 dark:bg-blue-500 text-white'
                    : 'bg-purple-50 dark:bg-purple-900/30 border border-purple-100 dark:border-purple-800'
                }`}
              >
                {message.role === 'user' ? (
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                ) : (
                  <div className="prose prose-sm max-w-none prose-headings:mt-3 prose-headings:mb-2 prose-p:my-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-0 prose-headings:text-purple-900 dark:prose-headings:text-purple-100 prose-p:text-gray-800 dark:prose-p:text-gray-200 prose-strong:text-gray-900 dark:prose-strong:text-white prose-code:text-purple-700 dark:prose-code:text-purple-300 prose-a:text-blue-600 dark:prose-a:text-blue-400">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {message.content}
                    </ReactMarkdown>
                  </div>
                )}
                <p className={`text-xs mt-2 ${message.role === 'user' ? 'text-blue-200 dark:text-blue-300' : 'text-purple-600 dark:text-purple-400'}`}>
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
            <div className="max-w-3xl px-4 py-3 rounded-lg bg-purple-50 dark:bg-purple-900/30 border border-purple-100 dark:border-purple-800">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-400 dark:bg-purple-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-purple-400 dark:bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-purple-400 dark:bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white dark:bg-gray-800 rounded-b-lg border border-t-0 border-gray-200 dark:border-gray-700 p-4">
        {error && (
          <div className="mb-3 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-red-800 dark:text-red-300 text-sm">
            {error}
          </div>
        )}

        <div className="flex gap-2">
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask anything about your notes..."
            disabled={isLoading || notes.length === 0}
            rows={3}
            className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none disabled:bg-gray-100 dark:disabled:bg-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading || notes.length === 0}
            className="px-6 py-3 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 font-medium disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed self-end"
          >
            {isLoading ? '...' : 'Send'}
          </button>
        </div>

        {notes.length === 0 ? (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 flex items-center gap-1">
            <IdeaIcon size={12} />
            Upload notes first to start chatting
          </p>
        ) : (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 flex items-center gap-1">
            <IdeaIcon size={12} />
            Tip: Press Enter to send, Shift+Enter for new line
          </p>
        )}
      </div>
    </div>
  );
}
