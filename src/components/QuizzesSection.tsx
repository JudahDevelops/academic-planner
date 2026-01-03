import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { generateQuiz } from '../utils/deepseekAPI';
import { Quiz, Question } from '../types';

interface QuizzesSectionProps {
  subjectId: string;
}

export function QuizzesSection({ subjectId }: QuizzesSectionProps) {
  const { getSubjectNotes, getSubjectQuizzes, addQuiz, updateQuiz, deleteQuiz } = useApp();
  const [generatingQuiz, setGeneratingQuiz] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [questionCount, setQuestionCount] = useState(10);
  const [selectedNoteIds, setSelectedNoteIds] = useState<string[]>([]);
  const [takingQuiz, setTakingQuiz] = useState<Quiz | null>(null);

  const notes = getSubjectNotes(subjectId);
  const quizzes = getSubjectQuizzes(subjectId);

  const handleGenerateQuiz = async () => {
    if (selectedNoteIds.length === 0) {
      setGenerateError('Please select at least one note');
      return;
    }

    setGeneratingQuiz(true);
    setGenerateError(null);

    try {
      const selectedNotes = notes.filter(n => selectedNoteIds.includes(n.id));
      const noteContents = selectedNotes.map(n => n.content);

      const questions = await generateQuiz(noteContents, questionCount);

      const quizTitle = `${questionCount}-Question Quiz - ${new Date().toLocaleDateString()}`;

      addQuiz({
        subjectId,
        noteIds: selectedNoteIds,
        title: quizTitle,
        questions,
        createdAt: new Date().toISOString(),
        settings: {
          questionCount,
        },
      });

      setSelectedNoteIds([]);
    } catch (error) {
      setGenerateError(error instanceof Error ? error.message : 'Failed to generate quiz');
    } finally {
      setGeneratingQuiz(false);
    }
  };

  const handleTakeQuiz = (quiz: Quiz) => {
    // Reset user answers
    const resetQuiz = {
      ...quiz,
      questions: quiz.questions.map(q => ({ ...q, userAnswer: undefined })),
      completedAt: undefined,
      score: undefined,
    };
    setTakingQuiz(resetQuiz);
  };

  const handleAnswerSelect = (questionIndex: number, answerIndex: number) => {
    if (!takingQuiz) return;

    const updatedQuestions = [...takingQuiz.questions];
    updatedQuestions[questionIndex] = {
      ...updatedQuestions[questionIndex],
      userAnswer: answerIndex,
    };

    setTakingQuiz({
      ...takingQuiz,
      questions: updatedQuestions,
    });
  };

  const handleSubmitQuiz = () => {
    if (!takingQuiz) return;

    const correctAnswers = takingQuiz.questions.filter(
      q => q.userAnswer === q.correctAnswer
    ).length;
    const score = Math.round((correctAnswers / takingQuiz.questions.length) * 100);

    const completedQuiz: Quiz = {
      ...takingQuiz,
      completedAt: new Date().toISOString(),
      score,
    };

    updateQuiz(takingQuiz.id, {
      completedAt: completedQuiz.completedAt,
      score,
      questions: takingQuiz.questions,
    });

    setTakingQuiz(completedQuiz);
  };

  const toggleNoteSelection = (noteId: string) => {
    setSelectedNoteIds(prev =>
      prev.includes(noteId)
        ? prev.filter(id => id !== noteId)
        : [...prev, noteId]
    );
  };

  if (takingQuiz) {
    return <QuizTaking quiz={takingQuiz} onAnswer={handleAnswerSelect} onSubmit={handleSubmitQuiz} onClose={() => setTakingQuiz(null)} />;
  }

  return (
    <div>
      {/* Quiz Generator */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Generate AI Quiz</h3>

        {notes.length === 0 ? (
          <p className="text-gray-600 text-sm">Upload notes first to generate quizzes</p>
        ) : (
          <div className="space-y-4">
            {/* Note Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Notes to Quiz From
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 border border-gray-200 rounded-lg">
                {notes.map((note) => (
                  <label
                    key={note.id}
                    className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedNoteIds.includes(note.id)}
                      onChange={() => toggleNoteSelection(note.id)}
                      className="rounded text-blue-600"
                    />
                    <span className="text-sm text-gray-900">{note.title}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Question Count */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Questions: {questionCount}
              </label>
              <input
                type="range"
                min="10"
                max="50"
                step="5"
                value={questionCount}
                onChange={(e) => setQuestionCount(Number(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>10</span>
                <span>30</span>
                <span>50</span>
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerateQuiz}
              disabled={generatingQuiz || selectedNoteIds.length === 0}
              className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {generatingQuiz ? (
                <span>🤖 Generating Quiz...</span>
              ) : (
                <span>✨ Generate {questionCount}-Question Quiz</span>
              )}
            </button>

            {generateError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
                {generateError}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Quiz List */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Your Quizzes ({quizzes.length})
        </h3>

        {quizzes.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <p className="text-gray-600">No quizzes yet</p>
            <p className="text-gray-500 text-sm mt-1">Generate your first quiz above</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quizzes.map((quiz) => (
              <div
                key={quiz.id}
                className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
              >
                <h4 className="font-semibold text-gray-900 mb-2">{quiz.title}</h4>

                <div className="space-y-1 text-sm text-gray-600 mb-4">
                  <div className="flex justify-between">
                    <span>Questions:</span>
                    <span className="font-medium">{quiz.questions.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Created:</span>
                    <span className="font-medium">
                      {new Date(quiz.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {quiz.score !== undefined && (
                    <div className="flex justify-between">
                      <span>Last Score:</span>
                      <span className={`font-medium ${quiz.score >= 70 ? 'text-green-600' : 'text-red-600'}`}>
                        {quiz.score}%
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleTakeQuiz(quiz)}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium"
                  >
                    {quiz.score !== undefined ? 'Retake' : 'Take Quiz'}
                  </button>
                  <button
                    onClick={() => deleteQuiz(quiz.id)}
                    className="px-4 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 text-sm font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Quiz Taking Component
function QuizTaking({
  quiz,
  onAnswer,
  onSubmit,
  onClose,
}: {
  quiz: Quiz;
  onAnswer: (questionIndex: number, answerIndex: number) => void;
  onSubmit: () => void;
  onClose: () => void;
}) {
  const isCompleted = quiz.score !== undefined;
  const allAnswered = quiz.questions.every(q => q.userAnswer !== undefined);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">{quiz.title}</h2>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-900 font-medium"
          >
            {isCompleted ? 'Close' : 'Cancel'}
          </button>
        </div>

        {isCompleted && (
          <div className={`p-4 rounded-lg mb-4 ${quiz.score! >= 70 ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            <p className={`text-lg font-semibold ${quiz.score! >= 70 ? 'text-green-800' : 'text-red-800'}`}>
              Score: {quiz.score}% ({quiz.questions.filter(q => q.userAnswer === q.correctAnswer).length}/{quiz.questions.length})
            </p>
          </div>
        )}
      </div>

      <div className="space-y-6">
        {quiz.questions.map((question, qIndex) => (
          <div key={question.id} className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">
              {qIndex + 1}. {question.question}
            </h3>

            <div className="space-y-2">
              {question.options.map((option, oIndex) => {
                const isSelected = question.userAnswer === oIndex;
                const isCorrect = oIndex === question.correctAnswer;
                const showResult = isCompleted;

                let buttonClass = 'w-full text-left p-4 border-2 rounded-lg transition-colors ';

                if (showResult) {
                  if (isCorrect) {
                    buttonClass += 'border-green-500 bg-green-50 ';
                  } else if (isSelected && !isCorrect) {
                    buttonClass += 'border-red-500 bg-red-50 ';
                  } else {
                    buttonClass += 'border-gray-200 bg-gray-50 ';
                  }
                } else {
                  buttonClass += isSelected
                    ? 'border-blue-500 bg-blue-50 '
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 ';
                }

                return (
                  <button
                    key={oIndex}
                    onClick={() => !isCompleted && onAnswer(qIndex, oIndex)}
                    disabled={isCompleted}
                    className={buttonClass}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        showResult && isCorrect ? 'border-green-600 bg-green-600' :
                        showResult && isSelected && !isCorrect ? 'border-red-600 bg-red-600' :
                        isSelected ? 'border-blue-600 bg-blue-600' :
                        'border-gray-400'
                      }`}>
                        {showResult && isCorrect && <span className="text-white text-xs">✓</span>}
                        {showResult && isSelected && !isCorrect && <span className="text-white text-xs">✗</span>}
                        {!showResult && isSelected && <span className="w-2 h-2 bg-white rounded-full"></span>}
                      </div>
                      <span className={showResult && isCorrect ? 'font-medium text-green-900' : ''}>{option}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {isCompleted && question.explanation && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-900">
                  <span className="font-semibold">Explanation:</span> {question.explanation}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {!isCompleted && (
        <div className="sticky bottom-4 mt-8">
          <button
            onClick={onSubmit}
            disabled={!allAnswered}
            className="w-full bg-green-600 text-white px-6 py-4 rounded-lg hover:bg-green-700 font-medium disabled:bg-gray-400 disabled:cursor-not-allowed shadow-lg"
          >
            Submit Quiz
          </button>
        </div>
      )}
    </div>
  );
}
