import React, { useState, useEffect } from 'react';
import {
  QuizCategory,
  Quiz,
  Question,
  CreateCategoryDto,
  UpdateCategoryDto,
  CreateQuizDto,
  UpdateQuizDto,
  CreateQuestionDto,
  UpdateQuestionDto,
} from '@ai-quiz-app/shared';
import {
  getCategories,
  getQuizzes,
  createCategory,
  updateCategory,
  createQuiz,
  updateQuiz,
  createQuestion,
  updateQuestion,
} from '../services/api';
import CategoryList from '../components/CategoryList';
import CategoryForm from '../components/CategoryForm';
import QuizList from '../components/QuizList';
import QuizForm from '../components/QuizForm';
import QuestionEditor from '../components/QuestionEditor';
import QuestionForm from '../components/QuestionForm';
import Loading from '../components/Loading';

type ViewMode = 'categories' | 'quizzes' | 'questions';
type FormMode = 'none' | 'category' | 'quiz' | 'question';

const QuizManagementPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('categories');
  const [formMode, setFormMode] = useState<FormMode>('none');

  const [categories, setCategories] = useState<QuizCategory[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);

  const [selectedCategory, setSelectedCategory] = useState<QuizCategory | null>(null);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);

  const [editingCategory, setEditingCategory] = useState<QuizCategory | undefined>(undefined);
  const [editingQuiz, setEditingQuiz] = useState<Quiz | undefined>(undefined);
  const [editingQuestion, setEditingQuestion] = useState<Question | undefined>(undefined);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [categoriesData, quizzesData] = await Promise.all([
        getCategories(),
        getQuizzes(),
      ]);
      setCategories(categoriesData);
      setQuizzes(quizzesData);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // Category handlers
  const handleCreateCategory = () => {
    setEditingCategory(undefined);
    setFormMode('category');
  };

  const handleEditCategory = (category: QuizCategory) => {
    setEditingCategory(category);
    setFormMode('category');
  };

  const handleSubmitCategory = async (data: CreateCategoryDto | UpdateCategoryDto) => {
    if (editingCategory) {
      await updateCategory(editingCategory.id, data);
    } else {
      await createCategory(data as CreateCategoryDto);
    }
    await loadData();
    setFormMode('none');
    setEditingCategory(undefined);
  };

  // Quiz handlers
  const handleCreateQuiz = (categoryId?: string) => {
    setEditingQuiz(undefined);
    if (categoryId) {
      setSelectedCategory(categories.find((cat) => cat.id === categoryId) || null);
    }
    setFormMode('quiz');
  };

  const handleEditQuiz = (quiz: Quiz) => {
    setEditingQuiz(quiz);
    setFormMode('quiz');
  };

  const handleSubmitQuiz = async (data: CreateQuizDto | UpdateQuizDto) => {
    if (editingQuiz) {
      await updateQuiz(editingQuiz.id, data);
    } else {
      await createQuiz(data as CreateQuizDto);
    }
    await loadData();
    setFormMode('none');
    setEditingQuiz(undefined);
  };

  const handleManageQuestions = (quiz: Quiz) => {
    setSelectedQuiz(quiz);
    setViewMode('questions');
  };

  // Question handlers
  const handleAddQuestion = () => {
    setEditingQuestion(undefined);
    setFormMode('question');
  };

  const handleEditQuestion = (question: Question) => {
    setEditingQuestion(question);
    setFormMode('question');
  };

  const handleSubmitQuestion = async (data: CreateQuestionDto | UpdateQuestionDto) => {
    if (editingQuestion) {
      await updateQuestion(editingQuestion.id, data);
    } else {
      await createQuestion(data as CreateQuestionDto);
    }
    setFormMode('none');
    setEditingQuestion(undefined);
  };

  const handleBackToQuizzes = () => {
    setSelectedQuiz(null);
    setViewMode('quizzes');
  };

  if (loading) {
    return <Loading message="Loading quiz management..." />;
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Quiz Management</h1>
        <p className="mt-2 text-gray-600">
          Manage quizzes, categories, and questions
        </p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-4 mb-6 text-sm text-red-800">
          {error}
        </div>
      )}

      {/* View Mode Tabs */}
      {viewMode !== 'questions' && (
        <div className="mb-6 border-b border-gray-200">
          <nav className="flex space-x-8">
            <button
              onClick={() => setViewMode('categories')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                viewMode === 'categories'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Categories
            </button>
            <button
              onClick={() => setViewMode('quizzes')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                viewMode === 'quizzes'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Quizzes
            </button>
          </nav>
        </div>
      )}

      {/* Form Views */}
      {formMode === 'category' && (
        <div className="mb-6">
          <CategoryForm
            category={editingCategory}
            onSubmit={handleSubmitCategory}
            onCancel={() => {
              setFormMode('none');
              setEditingCategory(undefined);
            }}
          />
        </div>
      )}

      {formMode === 'quiz' && (
        <div className="mb-6">
          <QuizForm
            quiz={editingQuiz}
            categories={categories}
            defaultCategoryId={selectedCategory?.id}
            onSubmit={handleSubmitQuiz}
            onCancel={() => {
              setFormMode('none');
              setEditingQuiz(undefined);
              setSelectedCategory(null);
            }}
          />
        </div>
      )}

      {formMode === 'question' && selectedQuiz && (
        <div className="mb-6">
          <QuestionForm
            question={editingQuestion}
            quizId={selectedQuiz.id}
            onSubmit={handleSubmitQuestion}
            onCancel={() => {
              setFormMode('none');
              setEditingQuestion(undefined);
            }}
          />
        </div>
      )}

      {/* Main Content Views */}
      {viewMode === 'categories' && formMode === 'none' && (
        <CategoryList
          categories={categories}
          onEdit={handleEditCategory}
          onCreate={handleCreateCategory}
          onRefresh={loadData}
        />
      )}

      {viewMode === 'quizzes' && formMode === 'none' && (
        <QuizList
          quizzes={quizzes}
          categories={categories}
          onEdit={handleEditQuiz}
          onCreate={handleCreateQuiz}
          onManageQuestions={handleManageQuestions}
          onRefresh={loadData}
        />
      )}

      {viewMode === 'questions' && selectedQuiz && formMode === 'none' && (
        <QuestionEditor
          quiz={selectedQuiz}
          onAddQuestion={handleAddQuestion}
          onEditQuestion={handleEditQuestion}
          onBack={handleBackToQuizzes}
        />
      )}
    </div>
  );
};

export default QuizManagementPage;
