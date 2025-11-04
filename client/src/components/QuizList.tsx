import React, { useState } from 'react';
import { Quiz, QuizCategory } from '@ai-quiz-app/shared';
import { deleteQuiz as deleteQuizApi } from '../services/api';
import Card from './Card';
import Button from './Button';
import Badge from './Badge';

interface QuizListProps {
  quizzes: Quiz[];
  categories: QuizCategory[];
  onEdit: (quiz: Quiz) => void;
  onCreate: (categoryId?: string) => void;
  onManageQuestions: (quiz: Quiz) => void;
  onRefresh: () => void;
  loading?: boolean;
  categoryFilter?: string;
}

const QuizList: React.FC<QuizListProps> = ({
  quizzes,
  categories,
  onEdit,
  onCreate,
  onManageQuestions,
  onRefresh,
  loading = false,
  categoryFilter
}) => {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  const getCategoryName = (categoryId: string): string => {
    const category = categories.find((cat) => cat.id === categoryId);
    return category ? `${category.icon} ${category.name}` : 'Unknown Category';
  };

  const handleDelete = async (quiz: Quiz) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${quiz.title}"? This will also delete all questions in this quiz.`
    );

    if (!confirmed) return;

    setDeletingId(quiz.id);
    setError(null);

    try {
      await deleteQuizApi(quiz.id);
      onRefresh();
    } catch (err: any) {
      const message = err.response?.data?.error || err.message || 'Failed to delete quiz';
      setError(message);
      console.error('Delete error:', err);
    } finally {
      setDeletingId(null);
    }
  };

  const filteredQuizzes = categoryFilter
    ? quizzes.filter((quiz) => quiz.categoryId === categoryFilter)
    : quizzes;

  if (loading) {
    return (
      <Card>
        <div className="text-center py-8 text-gray-600">
          Loading quizzes...
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Quizzes</h2>
        <Button onClick={() => onCreate(categoryFilter)}>Create Quiz</Button>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-800">
          {error}
        </div>
      )}

      {filteredQuizzes.length === 0 ? (
        <Card>
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">
              {categoryFilter ? 'No quizzes in this category' : 'No quizzes found'}
            </p>
            <Button onClick={() => onCreate(categoryFilter)}>Create Your First Quiz</Button>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filteredQuizzes.map((quiz) => (
            <Card key={quiz.id}>
              <div className="mb-3 flex items-start justify-between">
                <div className="space-y-2">
                  <Badge variant={getDifficultyColor(quiz.difficulty)}>
                    {quiz.difficulty.toUpperCase()}
                  </Badge>
                  <div className="text-xs text-gray-500">{getCategoryName(quiz.categoryId)}</div>
                </div>
                {(quiz as any)._count && (
                  <span className="text-sm text-gray-500">
                    {(quiz as any)._count.questions} questions
                  </span>
                )}
              </div>

              <h3 className="text-lg font-bold text-gray-900 mb-2">{quiz.title}</h3>
              <p className="text-sm text-gray-600 mb-4">{quiz.description}</p>

              <div className="flex flex-wrap gap-2">
                <Button
                  variant="secondary"
                  onClick={() => onManageQuestions(quiz)}
                  disabled={deletingId === quiz.id}
                >
                  Manage Questions
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => onEdit(quiz)}
                  disabled={deletingId === quiz.id}
                >
                  Edit
                </Button>
                <Button
                  variant="danger"
                  onClick={() => handleDelete(quiz)}
                  disabled={deletingId === quiz.id}
                >
                  {deletingId === quiz.id ? 'Deleting...' : 'Delete'}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default QuizList;
