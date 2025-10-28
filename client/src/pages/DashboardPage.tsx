import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { getUserStats } from '../services/api';
import { UserStats } from '@ai-quiz-app/shared';
import Card from '../components/Card';
import Button from '../components/Button';
import Badge from '../components/Badge';
import Loading from '../components/Loading';

const DashboardPage: React.FC = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadStats();
    }
  }, [user]);

  const loadStats = async () => {
    try {
      const data = await getUserStats(user!.id);
      setStats(data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading message="Loading your dashboard..." />;
  }

  if (!stats) {
    return (
      <div className="text-center">
        <p className="text-gray-600">Failed to load stats</p>
        <Link to="/">
          <Button className="mt-4">Back to Home</Button>
        </Link>
      </div>
    );
  }

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getScoreBadge = (percentage: number): 'success' | 'info' | 'warning' | 'danger' => {
    if (percentage >= 90) return 'success';
    if (percentage >= 75) return 'info';
    if (percentage >= 60) return 'warning';
    return 'danger';
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-gray-900">
          Welcome back, {user?.username}!
        </h1>
        <p className="text-gray-600">Here's an overview of your quiz performance</p>
      </div>

      {/* Stats Overview */}
      <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <div className="text-sm font-medium text-gray-600">Total Attempts</div>
          <div className="mt-2 text-3xl font-bold text-gray-900">{stats.totalAttempts}</div>
        </Card>
        <Card>
          <div className="text-sm font-medium text-gray-600">Quizzes Taken</div>
          <div className="mt-2 text-3xl font-bold text-gray-900">{stats.totalQuizzes}</div>
        </Card>
        <Card>
          <div className="text-sm font-medium text-gray-600">Average Score</div>
          <div className="mt-2 text-3xl font-bold text-primary-600">
            {Math.round(stats.averageScore)}%
          </div>
        </Card>
        <Card>
          <div className="text-sm font-medium text-gray-600">Best Score</div>
          <div className="mt-2 text-3xl font-bold text-green-600">
            {Math.round(stats.bestScore)}%
          </div>
        </Card>
      </div>

      {/* Category Performance */}
      {stats.categoryPerformance.length > 0 && (
        <div className="mb-8">
          <h2 className="mb-4 text-2xl font-bold text-gray-900">Performance by Category</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {stats.categoryPerformance.map((perf) => (
              <Card key={perf.category.id}>
                <div className="mb-3 flex items-center space-x-3">
                  <span className="text-3xl">{perf.category.icon}</span>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{perf.category.name}</h3>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{perf.attempts} attempts</span>
                  <Badge variant={getScoreBadge(perf.averageScore)}>
                    {Math.round(perf.averageScore)}%
                  </Badge>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Recent Attempts */}
      {stats.recentAttempts.length > 0 ? (
        <div>
          <h2 className="mb-4 text-2xl font-bold text-gray-900">Recent Quiz Attempts</h2>
          <div className="space-y-4">
            {stats.recentAttempts.map((attempt) => (
              <Card key={attempt.id} className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="mb-1 font-semibold text-gray-900">
                    {(attempt.quiz as any)?.title || 'Quiz'}
                  </h3>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span>{formatDate(attempt.completedAt!)}</span>
                    <span>•</span>
                    <span>{attempt.score} correct</span>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <Badge variant={getScoreBadge(attempt.percentage)}>
                    {Math.round(attempt.percentage)}%
                  </Badge>
                  <Button
                    variant="secondary"
                    onClick={() => navigate(`/results/${attempt.id}`)}
                  >
                    Review
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <Card className="text-center">
          <p className="mb-4 text-gray-600">You haven't taken any quizzes yet!</p>
          <Button onClick={() => navigate('/')}>Browse Quizzes</Button>
        </Card>
      )}
    </div>
  );
};

export default DashboardPage;
