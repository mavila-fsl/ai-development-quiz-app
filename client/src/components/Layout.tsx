import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import Button from './Button';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useUser();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-2xl">🧠</span>
              <span className="text-xl font-bold text-gray-900">AI Quiz App</span>
            </Link>

            <nav className="flex items-center space-x-4">
              {user && (
                <>
                  <Link
                    to="/dashboard"
                    className="text-sm font-medium text-gray-700 transition-colors hover:text-primary-600"
                  >
                    Dashboard
                  </Link>
                  <span className="text-sm text-gray-500">|</span>
                  <span className="text-sm text-gray-700">👤 {user.username}</span>
                  <Button variant="secondary" onClick={handleLogout}>
                    Logout
                  </Button>
                </>
              )}
            </nav>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{children}</main>

      <footer className="mt-auto border-t border-gray-200 bg-white py-6">
        <div className="mx-auto max-w-7xl px-4 text-center text-sm text-gray-500 sm:px-6 lg:px-8">
          <p>© 2025 AI Development Quiz App. Test and improve your AI development knowledge.</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
