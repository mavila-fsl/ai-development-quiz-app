import React from 'react';
import { Navigate } from 'react-router-dom';

const ManagePage: React.FC = () => {
  return <Navigate to="/manage/quizzes" replace />;
};

export default ManagePage;
