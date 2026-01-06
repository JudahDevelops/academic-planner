import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { generateQuiz } from '../utils/deepseekAPI';
import { Quiz, Question } from '../types';
import { SparklesIcon } from './icons';

interface QuizzesSectionProps {
  subjectId: string;
}

export function QuizzesSection({ subjectId }: QuizzesSectionProps) {
  const { getSubjectNotes, getSubjectQuizzes, addQuiz, updateQuiz, deleteQuiz } = useApp();
  const [generatingQuiz, setGeneratingQuiz] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [questionCount, setQuestionCount] = useState(10);
  const [timeLimit, setTimeLimit] = useState<number | undefined>(undefined);
  const [showInstantFeedback, setShowInstantFeedback] = useState(false);
  const [selectedNoteIds, setSelectedNoteIds] = useState<string[]>([]);
  const [takingQuiz, setTakingQuiz] = useState<Quiz | null>(null);
  const [reviewingQuiz, setReviewingQuiz] = useState<Quiz | null>(null);

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
          timeLimit,
          showInstantFeedback,
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
      timeTaken: undefined,
    };
    setTakingQuiz(resetQuiz);
  };

  const handleReviewQuiz = (quiz: Quiz) => {
    setReviewingQuiz(quiz);
  };

  const handleQuizComplete = (completedQuiz: Quiz) => {
    updateQuiz(completedQuiz.id, {
      completedAt: completedQuiz.completedAt,
      score: completedQuiz.score,
      timeTaken: completedQuiz.timeTaken,
      questions: completedQuiz.questions,
    });
    setTakingQuiz(null);
  };

  const toggleNoteSelection = (noteId: string) => {
    setSelectedNoteIds(prev =>
      prev.includes(noteId)
        ? prev.filter(id => id !== noteId)
        : [...prev, noteId]
    );
  };

  if (takingQuiz) {
    return <QuizTaking quiz={takingQuiz} onComplete={handleQuizComplete} onCancel={() => setTakingQuiz(null)} />;
  }

  if (reviewingQuiz) {
    return <QuizReview quiz={reviewingQuiz} onClose={() => setReviewingQuiz(null)} />;
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

            {/* Time Limit */}
            <div>
              <label className="flex items-center gap-2 mb-2">
                <input
                  type="checkbox"
                  checked={timeLimit !== undefined}
                  onChange={(e) => setTimeLimit(e.target.checked ? 30 : undefined)}
                  className="rounded text-blue-600"
                />
                <span className="text-sm font-medium text-gray-700">Enable Timer</span>
              </label>
              {timeLimit !== undefined && (
                <div>
                  <label className="block text-sm text-gray-600 mb-2">
                    Time Limit: {timeLimit} minutes
                  </label>
                  <input
                    type="range"
                    min="5"
                    max="120"
                    step="5"
                    value={timeLimit}
                    onChange={(e) => setTimeLimit(Number(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>5 min</span>
                    <span>60 min</span>
                    <span>120 min</span>
                  </div>
                </div>
              )}
            </div>

            {/* Instant Feedback */}
            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={showInstantFeedback}
                  onChange={(e) => setShowInstantFeedback(e.target.checked)}
                  className="rounded text-blue-600"
                />
                <span className="text-sm font-medium text-gray-700">
                  Show if answer is correct after each question
                </span>
              </label>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerateQuiz}
              disabled={generatingQuiz || selectedNoteIds.length === 0}
              className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {generatingQuiz ? (
                <>
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Generating Quiz...</span>
                </>
              ) : (
                <>
                  <SparklesIcon size={20} />
                  <span>Generate {questionCount}-Question Quiz</span>
                </>
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
                  {quiz.settings.timeLimit && (
                    <div className="flex justify-between">
                      <span>Time Limit:</span>
                      <span className="font-medium">{quiz.settings.timeLimit} min</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Created:</span>
                    <span className="font-medium">
                      {new Date(quiz.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {quiz.score !== undefined && (
                    <>
                      <div className="flex justify-between">
                        <span>Last Score:</span>
                        <span className={`font-medium ${quiz.score >= 70 ? 'text-green-600' : 'text-red-600'}`}>
                          {quiz.score}%
                        </span>
                      </div>
                      {quiz.timeTaken && (
                        <div className="flex justify-between">
                          <span>Time Taken:</span>
                          <span className="font-medium">
                            {Math.floor(quiz.timeTaken / 60)}:{String(quiz.timeTaken % 60).padStart(2, '0')}
                          </span>
                        </div>
                      )}
                    </>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleTakeQuiz(quiz)}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium"
                  >
                    {quiz.score !== undefined ? 'Retake' : 'Take Quiz'}
                  </button>
                  {quiz.score !== undefined && (
                    <button
                      onClick={() => handleReviewQuiz(quiz)}
                      className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 text-sm font-medium"
                    >
                      Review
                    </button>
                  )}
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

// Quiz Taking Component - One Question at a Time
function QuizTaking({
  quiz,
  onComplete,
  onCancel,
}: {
  quiz: Quiz;
  onComplete: (quiz: Quiz) => void;
  onCancel: () => void;
}) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<(number | undefined)[]>(
    quiz.questions.map(() => undefined)
  );
  const [selectedAnswer, setSelectedAnswer] = useState<number | undefined>(undefined);
  const [showFeedback, setShowFeedback] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(
    quiz.settings.timeLimit ? quiz.settings.timeLimit * 60 : null
  );
  const [startTime] = useState(Date.now());
  const [isFinished, setIsFinished] = useState(false);

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;

  // Timer
  useEffect(() => {
    if (timeRemaining === null || isFinished) return;

    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev === null || prev <= 0) {
          handleFinishQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timeRemaining, isFinished]);

  // Load previous answer when question changes
  useEffect(() => {
    setSelectedAnswer(answers[currentQuestionIndex]);
    setShowFeedback(false);
  }, [currentQuestionIndex]);

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = answerIndex;
    setAnswers(newAnswers);

    if (quiz.settings.showInstantFeedback) {
      setShowFeedback(true);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleFinishQuiz = () => {
    const timeTaken = Math.floor((Date.now() - startTime) / 1000);

    const questionsWithAnswers = quiz.questions.map((q, i) => ({
      ...q,
      userAnswer: answers[i],
    }));

    const correctAnswers = questionsWithAnswers.filter(
      q => q.userAnswer === q.correctAnswer
    ).length;
    const score = Math.round((correctAnswers / quiz.questions.length) * 100);

    const completedQuiz: Quiz = {
      ...quiz,
      questions: questionsWithAnswers,
      completedAt: new Date().toISOString(),
      score,
      timeTaken,
    };

    setIsFinished(true);
    onComplete(completedQuiz);
  };

  const allAnswered = answers.every(a => a !== undefined);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${String(secs).padStart(2, '0')}`;
  };

  const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
  const hasAnswered = selectedAnswer !== undefined;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{quiz.title}</h2>
            <p className="text-sm text-gray-600 mt-1">
              Question {currentQuestionIndex + 1} of {quiz.questions.length}
            </p>
          </div>
          <div className="flex items-center gap-4">
            {timeRemaining !== null && (
              <div className={`text-2xl font-bold ${timeRemaining < 60 ? 'text-red-600' : 'text-gray-900'}`}>
                ⏱️ {formatTime(timeRemaining)}
              </div>
            )}
            <button
              onClick={onCancel}
              className="text-gray-600 hover:text-gray-900 font-medium"
            >
              Cancel
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all"
            style={{ width: `${((currentQuestionIndex + 1) / quiz.questions.length) * 100}%` }}
          />
        </div>

        {/* Answer Status */}
        <div className="flex gap-1 mt-3">
          {answers.map((answer, i) => (
            <div
              key={i}
              className={`h-2 flex-1 rounded ${
                i === currentQuestionIndex
                  ? 'bg-blue-600'
                  : answer !== undefined
                  ? 'bg-green-400'
                  : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Question */}
      <div className="bg-white rounded-lg border border-gray-200 p-8 mb-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">
          {currentQuestion.question}
        </h3>

        <div className="space-y-3">
          {currentQuestion.options.map((option, oIndex) => {
            const isSelected = selectedAnswer === oIndex;
            const isCorrectAnswer = oIndex === currentQuestion.correctAnswer;
            const showResult = showFeedback && hasAnswered;

            let buttonClass = 'w-full text-left p-4 border-2 rounded-lg transition-all ';

            if (showResult) {
              if (isCorrectAnswer) {
                buttonClass += 'border-green-500 bg-green-50 ';
              } else if (isSelected && !isCorrectAnswer) {
                buttonClass += 'border-red-500 bg-red-50 ';
              } else {
                buttonClass += 'border-gray-200 bg-gray-50 ';
              }
            } else {
              buttonClass += isSelected
                ? 'border-blue-600 bg-blue-50 shadow-md '
                : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50 ';
            }

            return (
              <button
                key={oIndex}
                onClick={() => !showFeedback && handleAnswerSelect(oIndex)}
                disabled={showFeedback}
                className={buttonClass}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                    showResult && isCorrectAnswer ? 'border-green-600 bg-green-600' :
                    showResult && isSelected && !isCorrectAnswer ? 'border-red-600 bg-red-600' :
                    isSelected ? 'border-blue-600 bg-blue-600' :
                    'border-gray-400'
                  }`}>
                    {showResult && isCorrectAnswer && <span className="text-white text-sm">✓</span>}
                    {showResult && isSelected && !isCorrectAnswer && <span className="text-white text-sm">✗</span>}
                    {!showResult && isSelected && <span className="w-3 h-3 bg-white rounded-full"></span>}
                  </div>
                  <span className={`flex-1 ${showResult && isCorrectAnswer ? 'font-semibold text-green-900' : ''}`}>
                    {option}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Instant Feedback */}
        {showFeedback && hasAnswered && (
          <div className={`mt-6 p-4 rounded-lg border ${
            isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
          }`}>
            <p className={`font-semibold mb-2 ${isCorrect ? 'text-green-800' : 'text-red-800'}`}>
              {isCorrect ? '✓ Correct!' : '✗ Incorrect'}
            </p>
            {currentQuestion.explanation && (
              <p className="text-sm text-gray-700">
                {currentQuestion.explanation}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ← Previous
        </button>

        <div className="text-sm text-gray-600">
          {answers.filter(a => a !== undefined).length} / {quiz.questions.length} answered
        </div>

        {isLastQuestion ? (
          <button
            onClick={handleFinishQuiz}
            disabled={!allAnswered}
            className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium disabled:bg-gray-400 disabled:cursor-not-allowed shadow-lg"
          >
            {allAnswered ? 'Finish Quiz ✓' : 'Answer all questions'}
          </button>
        ) : (
          <button
            onClick={handleNext}
            disabled={!hasAnswered && quiz.settings.showInstantFeedback}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Next →
          </button>
        )}
      </div>
    </div>
  );
}

// Quiz Review Component
function QuizReview({ quiz, onClose }: { quiz: Quiz; onClose: () => void }) {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">{quiz.title} - Review</h2>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-900 font-medium"
          >
            Close
          </button>
        </div>

        <div className={`p-4 rounded-lg mb-4 ${quiz.score! >= 70 ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
          <p className={`text-lg font-semibold ${quiz.score! >= 70 ? 'text-green-800' : 'text-red-800'}`}>
            Score: {quiz.score}% ({quiz.questions.filter(q => q.userAnswer === q.correctAnswer).length}/{quiz.questions.length} correct)
          </p>
          {quiz.timeTaken && (
            <p className="text-sm text-gray-700 mt-1">
              Time Taken: {Math.floor(quiz.timeTaken / 60)}:{String(quiz.timeTaken % 60).padStart(2, '0')}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-6">
        {quiz.questions.map((question, qIndex) => {
          const isCorrect = question.userAnswer === question.correctAnswer;

          return (
            <div key={question.id} className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <h3 className="font-semibold text-gray-900 flex-1">
                  {qIndex + 1}. {question.question}
                </h3>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {isCorrect ? '✓ Correct' : '✗ Incorrect'}
                </span>
              </div>

              <div className="space-y-2">
                {question.options.map((option, oIndex) => {
                  const isSelected = question.userAnswer === oIndex;
                  const isCorrectAnswer = oIndex === question.correctAnswer;

                  let className = 'w-full text-left p-4 border-2 rounded-lg ';

                  if (isCorrectAnswer) {
                    className += 'border-green-500 bg-green-50 ';
                  } else if (isSelected && !isCorrectAnswer) {
                    className += 'border-red-500 bg-red-50 ';
                  } else {
                    className += 'border-gray-200 bg-gray-50 ';
                  }

                  return (
                    <div key={oIndex} className={className}>
                      <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                          isCorrectAnswer ? 'border-green-600 bg-green-600' :
                          isSelected && !isCorrectAnswer ? 'border-red-600 bg-red-600' :
                          'border-gray-400'
                        }`}>
                          {isCorrectAnswer && <span className="text-white text-sm">✓</span>}
                          {isSelected && !isCorrectAnswer && <span className="text-white text-sm">✗</span>}
                        </div>
                        <span className={isCorrectAnswer ? 'font-semibold text-green-900' : ''}>
                          {option}
                        </span>
                        {isSelected && !isCorrectAnswer && (
                          <span className="ml-auto text-sm text-red-600 font-medium">Your answer</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {question.explanation && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-900">
                    <span className="font-semibold">Explanation:</span> {question.explanation}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
