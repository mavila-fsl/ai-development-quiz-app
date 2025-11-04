import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { UserRole } from '@ai-quiz-app/shared';
import { UserProvider } from './context/UserContext';
import Layout from './components/Layout';
import RoleProtectedRoute from './components/RoleProtectedRoute';
import HomePage from './pages/HomePage';
import CategoryPage from './pages/CategoryPage';
import QuizPage from './pages/QuizPage';
import ResultsPage from './pages/ResultsPage';
import DashboardPage from './pages/DashboardPage';
import ManagePage from './pages/ManagePage';
import QuizManagementPage from './pages/QuizManagementPage';
import Unauthorized from './pages/Unauthorized';

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />

      {/* Quiz Taker Routes - Protected for QUIZ_TAKER role */}
      <Route
        path="/category/:id"
        element={
          <RoleProtectedRoute allowedRoles={[UserRole.QUIZ_TAKER]}>
            <CategoryPage />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/quiz/:id"
        element={
          <RoleProtectedRoute allowedRoles={[UserRole.QUIZ_TAKER]}>
            <QuizPage />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/results/:id"
        element={
          <RoleProtectedRoute allowedRoles={[UserRole.QUIZ_TAKER]}>
            <ResultsPage />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <RoleProtectedRoute allowedRoles={[UserRole.QUIZ_TAKER]}>
            <DashboardPage />
          </RoleProtectedRoute>
        }
      />

      {/* Quiz Manager Routes - Protected for QUIZ_MANAGER role */}
      <Route
        path="/manage"
        element={
          <RoleProtectedRoute allowedRoles={[UserRole.QUIZ_MANAGER]}>
            <ManagePage />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/manage/quizzes"
        element={
          <RoleProtectedRoute allowedRoles={[UserRole.QUIZ_MANAGER]}>
            <QuizManagementPage />
          </RoleProtectedRoute>
        }
      />

      {/* Unauthorized Route - Accessible to all authenticated users */}
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Fallback Route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <UserProvider>
        <Layout>
          <AppRoutes />
        </Layout>
      </UserProvider>
    </BrowserRouter>
  );
};

export default App;
