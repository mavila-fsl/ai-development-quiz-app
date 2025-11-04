import React, { useState, useEffect } from 'react';
import { CreateQuizDto, UpdateQuizDto, Quiz, QuizCategory } from '@ai-quiz-app/shared';
import Button from './Button';
import Card from './Card';

interface QuizFormProps {
  quiz?: Quiz;
  categories: QuizCategory[];
  defaultCategoryId?: string;
  onSubmit: (data: CreateQuizDto | UpdateQuizDto) => Promise<void>;
  onCancel: () => void;
}

const QuizForm: React.FC<QuizFormProps> = ({ quiz, categories, defaultCategoryId, onSubmit, onCancel }) => {
  const [title, setTitle] = useState(quiz?.title || '');
  const [description, setDescription] = useState(quiz?.description || '');
  const [categoryId, setCategoryId] = useState(quiz?.categoryId || defaultCategoryId || '');
  const [difficulty, setDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>(
    quiz?.difficulty || 'beginner'
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (quiz) {
      setTitle(quiz.title);
      setDescription(quiz.description);
      setCategoryId(quiz.categoryId);
      setDifficulty(quiz.difficulty);
    }
  }, [quiz]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!title.trim()) {
      setError('Quiz title is required');
      return;
    }

    if (!quiz && !categoryId) {
      setError('Please select a category');
      return;
    }

    setLoading(true);

    try {
      const data: CreateQuizDto | UpdateQuizDto = quiz
        ? {
            title: title.trim(),
            description: description.trim() || undefined,
            difficulty,
          }
        : {
            title: title.trim(),
            description: description.trim() || undefined,
            categoryId,
            difficulty,
          };

      await onSubmit(data);
      setSuccess(true);

      if (!quiz) {
        setTitle('');
        setDescription('');
        setDifficulty('beginner');
      }

      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to save quiz');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <h2 className="text-xl font-bold text-gray-900 mb-4">
        {quiz ? 'Edit Quiz' : 'Create Quiz'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="title"
            className="input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter quiz title"
            disabled={loading}
            required
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            id="description"
            className="input"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter quiz description"
            rows={3}
            disabled={loading}
          />
        </div>

        {!quiz && (
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              id="category"
              className="input"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              disabled={loading}
              required
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.icon} {category.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 mb-1">
            Difficulty <span className="text-red-500">*</span>
          </label>
          <select
            id="difficulty"
            className="input"
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as 'beginner' | 'intermediate' | 'advanced')}
            disabled={loading}
            required
          >
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-800">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-lg bg-green-50 p-3 text-sm text-green-800">
            Quiz {quiz ? 'updated' : 'created'} successfully!
          </div>
        )}

        <div className="flex space-x-3">
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : quiz ? 'Update Quiz' : 'Create Quiz'}
          </Button>
          <Button type="button" variant="secondary" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default QuizForm;
