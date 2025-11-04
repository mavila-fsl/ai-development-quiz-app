import React, { useState } from 'react';
import { QuizCategory } from '@ai-quiz-app/shared';
import { deleteCategory as deleteCategoryApi } from '../services/api';
import Card from './Card';
import Button from './Button';

interface CategoryListProps {
  categories: QuizCategory[];
  onEdit: (category: QuizCategory) => void;
  onCreate: () => void;
  onRefresh: () => void;
  loading?: boolean;
}

const CategoryList: React.FC<CategoryListProps> = ({
  categories,
  onEdit,
  onCreate,
  onRefresh,
  loading = false
}) => {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async (category: QuizCategory) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${category.name}"? This will also delete all quizzes and questions in this category.`
    );

    if (!confirmed) return;

    setDeletingId(category.id);
    setError(null);

    try {
      await deleteCategoryApi(category.id);
      onRefresh();
    } catch (err: any) {
      const message = err.response?.data?.error || err.message || 'Failed to delete category';
      setError(message);
      console.error('Delete error:', err);
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <Card>
        <div className="text-center py-8 text-gray-600">
          Loading categories...
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Categories</h2>
        <Button onClick={onCreate}>Create Category</Button>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-800">
          {error}
        </div>
      )}

      {categories.length === 0 ? (
        <Card>
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">No categories found</p>
            <Button onClick={onCreate}>Create Your First Category</Button>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <Card key={category.id}>
              <div className="flex items-start justify-between mb-3">
                <span className="text-4xl">{category.icon}</span>
                <div className="flex space-x-2">
                  <Button
                    variant="secondary"
                    onClick={() => onEdit(category)}
                    disabled={deletingId === category.id}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => handleDelete(category)}
                    disabled={deletingId === category.id}
                  >
                    {deletingId === category.id ? 'Deleting...' : 'Delete'}
                  </Button>
                </div>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{category.name}</h3>
              <p className="text-sm text-gray-600 mb-3">{category.description}</p>
              <div className="text-xs text-gray-500">
                Created: {new Date(category.createdAt).toLocaleDateString()}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoryList;
