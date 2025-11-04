import React from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import Card from '../components/Card';
import Button from '../components/Button';

const Unauthorized: React.FC = () => {
  const { user, isQuizManager, isQuizTaker } = useUser();

  // Determine appropriate home link based on user role
  const getHomePath = () => {
    if (!user) return '/';
    if (isQuizManager) return '/manage';
    if (isQuizTaker) return '/';
    return '/';
  };

  const getRoleDisplay = () => {
    if (!user) return 'Not logged in';
    if (isQuizManager) return 'Quiz Manager';
    if (isQuizTaker) return 'Quiz Taker';
    return user.role;
  };

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Card className="max-w-md">
        <div className="text-center">
          <div className="mb-4 text-6xl">🚫</div>
          <h1 className="mb-2 text-3xl font-bold text-gray-900">Access Denied</h1>
          <p className="mb-6 text-gray-600">
            You don't have permission to access this page.
          </p>

          {user && (
            <div className="mb-6 rounded-lg bg-gray-100 p-4">
              <p className="text-sm text-gray-700">
                <span className="font-medium">Logged in as:</span> {user.username}
              </p>
              <p className="text-sm text-gray-700">
                <span className="font-medium">Your role:</span> {getRoleDisplay()}
              </p>
            </div>
          )}

          <div className="space-y-3">
            <Link to={getHomePath()}>
              <Button variant="primary" className="w-full">
                {isQuizManager ? 'Go to Management' : 'Go to Home'}
              </Button>
            </Link>
            {user && isQuizTaker && (
              <Link to="/dashboard">
                <Button variant="secondary" className="w-full">
                  Go to Dashboard
                </Button>
              </Link>
            )}
          </div>

          {!user && (
            <p className="mt-4 text-sm text-gray-500">
              Please log in to access this content.
            </p>
          )}
        </div>
      </Card>
    </div>
  );
};

export default Unauthorized;
