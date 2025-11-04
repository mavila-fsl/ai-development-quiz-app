import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { getAttempt } from '../services/api';
import { QuizResult, AnswerResult } from '@ai-quiz-app/shared';
import Card from '../components/Card';
import Button from '../components/Button';
import Badge from '../components/Badge';
import Loading from '../components/Loading';

const ResultsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [result, setResult] = useState<QuizResult | null>(
    location.state?.result || null
  );
  const [loading, setLoading] = useState(!result);
  const [showAnswers, setShowAnswers] = useState(false);

  useEffect(() => {
    if (!result && id) {
      loadResult();
    }
  }, [id, result]);

  const loadResult = async () => {
    try {
      // Note: In a real app, you'd want an endpoint that returns the full result
      // For now, we'll just get the attempt
      const attempt = await getAttempt(id!);
      // Transform to result format if needed
      console.log('Attempt:', attempt);
      // TODO: Transform attempt to QuizResult format and call setResult(transformedResult)
    } catch (error) {
      console.error('Failed to load result:', error);
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading message="Loading results..." />;
  }

  if (!result) {
    return (
      <div className="text-center">
        <p className="text-gray-600">Results not found</p>
        <Link to="/">
          <Button className="mt-4">Back to Home</Button>
        </Link>
      </div>
    );
  }

  const getScoreColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 75) return 'text-blue-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadge = (percentage: number): 'success' | 'info' | 'warning' | 'danger' => {
    if (percentage >= 90) return 'success';
    if (percentage >= 75) return 'info';
    if (percentage >= 60) return 'warning';
    return 'danger';
  };

  return (
    <div className="mx-auto max-w-4xl animate-fade-in">
      <Card className="mb-8 text-center">
        <h1 className="mb-2 text-3xl font-bold text-gray-900">Quiz Complete!</h1>
        <div className="mb-4">
          <div className={`text-6xl font-bold ${getScoreColor(result.percentage)}`}>
            {Math.round(result.percentage)}%
          </div>
          <p className="mt-2 text-lg text-gray-600">
            {result.correctAnswers} out of {result.totalQuestions} correct
          </p>
        </div>

        <Badge variant={getScoreBadge(result.percentage)} className="text-base">
          {result.feedback}
        </Badge>

        <div className="mt-6 flex justify-center gap-4">
          <Button onClick={() => navigate(`/quiz/${result.attempt.quizId}`)}>
            Retake Quiz
          </Button>
          <Button variant="secondary" onClick={() => navigate('/dashboard')}>
            View Dashboard
          </Button>
          <Button variant="secondary" onClick={() => setShowAnswers(!showAnswers)}>
            {showAnswers ? 'Hide Answers' : 'Review Answers'}
          </Button>
        </div>
      </Card>

      {showAnswers && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">Answer Review</h2>
          {result.answers.map((answer: AnswerResult, index: number) => (
            <Card key={answer.question.id} className="animate-slide-up">
              <div className="mb-3 flex items-center justify-between">
                <span className="font-semibold text-gray-700">Question {index + 1}</span>
                {answer.isCorrect ? (
                  <Badge variant="success">✓ Correct</Badge>
                ) : (
                  <Badge variant="danger">✗ Incorrect</Badge>
                )}
              </div>

              <h3 className="mb-4 text-lg font-medium text-gray-900">
                {answer.question.question}
              </h3>

              <div className="mb-4 space-y-2">
                {answer.question.options.map((option) => {
                  const isUserAnswer = option.id === answer.userAnswer;
                  const isCorrect = option.id === answer.correctAnswer;

                  let className = 'rounded-lg border-2 p-3 ';
                  if (isCorrect) {
                    className += 'border-green-500 bg-green-50';
                  } else if (isUserAnswer && !isCorrect) {
                    className += 'border-red-500 bg-red-50';
                  } else {
                    className += 'border-gray-200 bg-gray-50';
                  }

                  return (
                    <div key={option.id} className={className}>
                      <div className="flex items-center justify-between">
                        <span>
                          <span className="font-medium">{option.id.toUpperCase()}.</span>{' '}
                          {option.text}
                        </span>
                        {isCorrect && <span className="text-green-600">✓ Correct Answer</span>}
                        {isUserAnswer && !isCorrect && (
                          <span className="text-red-600">Your Answer</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="rounded-lg bg-blue-50 p-4">
                <h4 className="mb-2 font-semibold text-blue-900">Explanation:</h4>
                <p className="text-blue-800">{answer.explanation}</p>
              </div>
            </Card>
          ))}
        </div>
      )}

      <div className="mt-8 text-center">
        <Link to="/" className="text-primary-600 hover:text-primary-700">
          ← Back to Home
        </Link>
      </div>
    </div>
  );
};

export default ResultsPage;
