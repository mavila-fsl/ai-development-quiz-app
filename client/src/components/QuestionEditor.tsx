import React, { useState, useEffect } from 'react';
import { Quiz, Question } from '@ai-quiz-app/shared';
import { getQuizQuestions, deleteQuestion as deleteQuestionApi } from '../services/api';
import Card from './Card';
import Button from './Button';
import Badge from './Badge';
import Loading from './Loading';

interface QuestionEditorProps {
  quiz: Quiz;
  onAddQuestion: () => void;
  onEditQuestion: (question: Question) => void;
  onBack: () => void;
}

const QuestionEditor: React.FC<QuestionEditorProps> = ({
  quiz,
  onAddQuestion,
  onEditQuestion,
  onBack
}) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadQuestions();
  }, [quiz.id]);

  const loadQuestions = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getQuizQuestions(quiz.id);
      setQuestions(data);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to load questions');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (question: Question) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete this question? This action cannot be undone.`
    );

    if (!confirmed) return;

    setDeletingId(question.id);
    setError(null);

    try {
      await deleteQuestionApi(question.id);
      await loadQuestions();
    } catch (err: any) {
      const message = err.response?.data?.error || err.message || 'Failed to delete question';
      setError(message);
      console.error('Delete error:', err);
    } finally {
      setDeletingId(null);
    }
  };

  const getDifficultyColor = (
    difficulty: string
  ): 'default' | 'success' | 'warning' | 'danger' | 'info' => {
    switch (difficulty) {
      case 'beginner':
        return 'success';
      case 'intermediate':
        return 'warning';
      case 'advanced':
        return 'danger';
      default:
        return 'default';
    }
  };

  if (loading) {
    return <Loading message="Loading questions..." />;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <Button variant="secondary" onClick={onBack} className="mb-2">
            Back to Quizzes
          </Button>
          <h2 className="text-2xl font-bold text-gray-900">{quiz.title}</h2>
          <p className="text-sm text-gray-600">Manage Questions</p>
        </div>
        <Button onClick={onAddQuestion}>Add Question</Button>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-800">
          {error}
        </div>
      )}

      {questions.length === 0 ? (
        <Card>
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">No questions yet</p>
            <Button onClick={onAddQuestion}>Add Your First Question</Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {questions.map((question, index) => (
            <Card key={question.id}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-gray-700">Q{index + 1}</span>
                  {question.difficulty && (
                    <Badge variant={getDifficultyColor(question.difficulty)}>
                      {question.difficulty}
                    </Badge>
                  )}
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="secondary"
                    onClick={() => onEditQuestion(question)}
                    disabled={deletingId === question.id}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => handleDelete(question)}
                    disabled={deletingId === question.id}
                  >
                    {deletingId === question.id ? 'Deleting...' : 'Delete'}
                  </Button>
                </div>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                {question.question}
              </h3>

              <div className="space-y-2 mb-3">
                {question.options.map((option) => (
                  <div
                    key={option.id}
                    className={`p-3 rounded-lg border ${
                      option.id === question.correctAnswer
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-gray-700">
                        {option.id.toUpperCase()}.
                      </span>
                      <span className="text-gray-900">{option.text}</span>
                      {option.id === question.correctAnswer && (
                        <Badge variant="success">Correct</Badge>
                      )}
                    </div>
                    {option.explanation && (
                      <p className="text-sm text-gray-600 mt-1 ml-6">
                        {option.explanation}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {question.explanation && (
                <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm font-medium text-blue-900 mb-1">Explanation:</p>
                  <p className="text-sm text-blue-800">{question.explanation}</p>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default QuestionEditor;
