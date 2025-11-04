import React, { useState, useEffect } from 'react';
import { CreateCategoryDto, UpdateCategoryDto, QuizCategory } from '@ai-quiz-app/shared';
import Button from './Button';
import Card from './Card';

interface CategoryFormProps {
  category?: QuizCategory;
  onSubmit: (data: CreateCategoryDto | UpdateCategoryDto) => Promise<void>;
  onCancel: () => void;
}

const CategoryForm: React.FC<CategoryFormProps> = ({ category, onSubmit, onCancel }) => {
  const [name, setName] = useState(category?.name || '');
  const [description, setDescription] = useState(category?.description || '');
  const [icon, setIcon] = useState(category?.icon || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (category) {
      setName(category.name);
      setDescription(category.description);
      setIcon(category.icon);
    }
  }, [category]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!name.trim()) {
      setError('Category name is required');
      return;
    }

    setLoading(true);

    try {
      const data = {
        name: name.trim(),
        description: description.trim() || undefined,
        icon: icon.trim() || undefined,
      };

      await onSubmit(data);
      setSuccess(true);

      if (!category) {
        setName('');
        setDescription('');
        setIcon('');
      }

      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to save category');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <h2 className="text-xl font-bold text-gray-900 mb-4">
        {category ? 'Edit Category' : 'Create Category'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter category name"
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
            placeholder="Enter category description"
            rows={3}
            disabled={loading}
          />
        </div>

        <div>
          <label htmlFor="icon" className="block text-sm font-medium text-gray-700 mb-1">
            Icon (Emoji)
          </label>
          <input
            type="text"
            id="icon"
            className="input"
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
            placeholder="Enter an emoji"
            maxLength={2}
            disabled={loading}
          />
          {icon && (
            <div className="mt-2 text-4xl">{icon}</div>
          )}
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-800">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-lg bg-green-50 p-3 text-sm text-green-800">
            Category {category ? 'updated' : 'created'} successfully!
          </div>
        )}

        <div className="flex space-x-3">
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : category ? 'Update Category' : 'Create Category'}
          </Button>
          <Button type="button" variant="secondary" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default CategoryForm;
