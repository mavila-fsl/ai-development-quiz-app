import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getCategory, getQuizzes } from '../services/api';
import { QuizCategory, Quiz } from '@ai-quiz-app/shared';
import { useUser } from '../context/UserContext';
import Card from '../components/Card';
import Button from '../components/Button';
import Badge from '../components/Badge';
import Loading from '../components/Loading';

const CategoryPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isQuizManager } = useUser();
  const [category, setCategory] = useState<QuizCategory | null>(null);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  const loadData = async () => {
    try {
      const [categoryData, quizzesData] = await Promise.all([
        getCategory(id!),
        getQuizzes(id!),
      ]);
      setCategory(categoryData);
      setQuizzes(quizzesData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading message="Loading quizzes..." />;
  }

  if (!category) {
    return (
      <div className="text-center">
        <p className="text-gray-600">Category not found</p>
        <Link to="/">
          <Button className="mt-4">Back to Home</Button>
        </Link>
      </div>
    );
  }

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

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <Link to="/" className="mb-4 inline-block text-sm text-primary-600 hover:text-primary-700">
          ← Back to Categories
        </Link>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className="text-5xl">{category.icon}</span>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{category.name}</h1>
              <p className="text-gray-600">{category.description}</p>
            </div>
          </div>
          {isQuizManager && (
            <Button onClick={() => navigate('/manage/quizzes')}>
              Manage Quizzes
            </Button>
          )}
        </div>
      </div>

      {quizzes.length === 0 ? (
        <Card>
          <div className="text-center">
            <p className="text-gray-600 mb-4">No quizzes available in this category yet.</p>
            {isQuizManager && (
              <Button onClick={() => navigate('/manage/quizzes')}>
                Create Quiz
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {quizzes.map((quiz) => (
            <Card
              key={quiz.id}
              className="animate-slide-up"
            >
              <div className="mb-3 flex items-center justify-between">
                <Badge variant={getDifficultyColor(quiz.difficulty)}>
                  {quiz.difficulty.toUpperCase()}
                </Badge>
                {(quiz as any)._count && (
                  <span className="text-sm text-gray-500">
                    {(quiz as any)._count.questions} questions
                  </span>
                )}
              </div>
              <h2 className="mb-2 text-xl font-bold text-gray-900">{quiz.title}</h2>
              <p className="mb-4 text-gray-600">{quiz.description}</p>
              <div className="flex space-x-2">
                <Button
                  className="flex-1"
                  onClick={() => navigate(`/quiz/${quiz.id}`)}
                >
                  Start Quiz
                </Button>
                {isQuizManager && (
                  <Button
                    variant="secondary"
                    onClick={() => navigate('/manage/quizzes')}
                  >
                    Edit
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoryPage;
