import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { getQuiz, getQuizQuestions, startAttempt, completeAttempt } from '../services/api';
import { Quiz, Question, SubmitAnswerDto } from '@ai-quiz-app/shared';
import Card from '../components/Card';
import Button from '../components/Button';
import ProgressBar from '../components/ProgressBar';
import Loading from '../components/Loading';

const QuizPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useUser();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Map<string, string>>(new Map());
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (id && user) {
      loadQuiz();
    }
  }, [id, user]);

  const loadQuiz = async () => {
    try {
      const [quizData, questionsData] = await Promise.all([
        getQuiz(id!),
        getQuizQuestions(id!),
      ]);
      setQuiz(quizData);
      setQuestions(questionsData);

      // Start attempt
      const attempt = await startAttempt({ userId: user!.id, quizId: id! });
      setAttemptId(attempt.id);
    } catch (error) {
      console.error('Failed to load quiz:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (answerId: string) => {
    const newAnswers = new Map(answers);
    newAnswers.set(questions[currentQuestionIndex].id, answerId);
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = async () => {
    if (answers.size !== questions.length) {
      alert('Please answer all questions before submitting.');
      return;
    }

    setSubmitting(true);
    try {
      const submitData: SubmitAnswerDto[] = Array.from(answers.entries()).map(
        ([questionId, userAnswer]) => ({
          questionId,
          userAnswer,
        })
      );

      const result = await completeAttempt({
        attemptId: attemptId!,
        answers: submitData,
      });

      navigate(`/results/${result.attempt.id}`, { state: { result } });
    } catch (error) {
      console.error('Failed to submit quiz:', error);
      alert('Failed to submit quiz. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <Loading message="Loading quiz..." />;
  }

  if (!quiz || questions.length === 0) {
    return (
      <div className="text-center">
        <p className="text-gray-600">Quiz not found</p>
        <Link to="/">
          <Button className="mt-4">Back to Home</Button>
        </Link>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const selectedAnswer = answers.get(currentQuestion.id);
  const allAnswered = answers.size === questions.length;

  return (
    <div className="mx-auto max-w-3xl animate-fade-in">
      <div className="mb-6">
        <Link
          to={`/category/${quiz.categoryId}`}
          className="mb-4 inline-block text-sm text-primary-600 hover:text-primary-700"
        >
          ← Back to Category
        </Link>
        <h1 className="mb-2 text-2xl font-bold text-gray-900">{quiz.title}</h1>
        <ProgressBar current={currentQuestionIndex + 1} total={questions.length} />
      </div>

      <Card className="mb-6">
        <h2 className="mb-6 text-xl font-semibold text-gray-900">{currentQuestion.question}</h2>

        <div className="space-y-3">
          {currentQuestion.options.map((option) => {
            const isSelected = selectedAnswer === option.id;
            return (
              <button
                key={option.id}
                onClick={() => handleAnswerSelect(option.id)}
                className={`w-full rounded-lg border-2 p-4 text-left transition-all ${
                  isSelected
                    ? 'border-primary-600 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center">
                  <div
                    className={`mr-3 flex h-6 w-6 items-center justify-center rounded-full border-2 ${
                      isSelected
                        ? 'border-primary-600 bg-primary-600'
                        : 'border-gray-300'
                    }`}
                  >
                    {isSelected && <div className="h-2 w-2 rounded-full bg-white" />}
                  </div>
                  <span className="font-medium">{option.id.toUpperCase()}.</span>
                  <span className="ml-2">{option.text}</span>
                </div>
              </button>
            );
          })}
        </div>
      </Card>

      <div className="flex items-center justify-between">
        <Button
          variant="secondary"
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
        >
          ← Previous
        </Button>

        <span className="text-sm text-gray-500">
          {answers.size} of {questions.length} answered
        </span>

        {currentQuestionIndex === questions.length - 1 ? (
          <Button onClick={handleSubmit} disabled={!allAnswered || submitting}>
            {submitting ? 'Submitting...' : 'Submit Quiz'}
          </Button>
        ) : (
          <Button onClick={handleNext} disabled={!selectedAnswer}>
            Next →
          </Button>
        )}
      </div>
    </div>
  );
};

export default QuizPage;
