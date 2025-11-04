import React, { useState, useEffect } from 'react';
import { CreateQuestionDto, UpdateQuestionDto, Question, QuestionOption } from '@ai-quiz-app/shared';
import Button from './Button';
import Card from './Card';

interface QuestionFormProps {
  question?: Question;
  quizId: string;
  onSubmit: (data: CreateQuestionDto | UpdateQuestionDto) => Promise<void>;
  onCancel: () => void;
}

const QuestionForm: React.FC<QuestionFormProps> = ({ question, quizId, onSubmit, onCancel }) => {
  const [text, setText] = useState(question?.question || '');
  const [difficulty, setDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>(
    question?.difficulty ?? 'beginner'
  );
  const [explanation, setExplanation] = useState(question?.explanation || '');
  const [options, setOptions] = useState<QuestionOption[]>(
    question?.options || [
      { id: 'a', text: '', explanation: '' },
      { id: 'b', text: '', explanation: '' },
    ]
  );
  const [correctAnswer, setCorrectAnswer] = useState(question?.correctAnswer || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (question) {
      setText(question.question);
      setDifficulty(question.difficulty ?? 'beginner');
      setExplanation(question.explanation);
      setOptions(question.options);
      setCorrectAnswer(question.correctAnswer);
    }
  }, [question]);

  const addOption = () => {
    const nextId = String.fromCharCode(97 + options.length);
    setOptions([...options, { id: nextId, text: '', explanation: '' }]);
  };

  const removeOption = (index: number) => {
    if (options.length <= 2) {
      setError('At least 2 options are required');
      return;
    }
    const newOptions = options.filter((_, i) => i !== index);
    setOptions(newOptions);

    if (correctAnswer === options[index].id) {
      setCorrectAnswer('');
    }
  };

  const updateOption = (index: number, field: keyof QuestionOption, value: string) => {
    const newOptions = [...options];
    newOptions[index] = { ...newOptions[index], [field]: value };
    setOptions(newOptions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!text.trim()) {
      setError('Question text is required');
      return;
    }

    if (options.some((opt) => !opt.text.trim())) {
      setError('All option texts are required');
      return;
    }

    if (!correctAnswer) {
      setError('Please select the correct answer');
      return;
    }

    setLoading(true);

    try {
      const data: CreateQuestionDto | UpdateQuestionDto = question
        ? {
            question: text.trim(),
            difficulty,
            options: options.map((opt) => ({
              id: opt.id,
              text: opt.text.trim(),
              explanation: opt.explanation?.trim(),
            })),
            correctAnswer,
            explanation: explanation.trim() || undefined,
          }
        : {
            question: text.trim(),
            quizId,
            difficulty,
            options: options.map((opt) => ({
              id: opt.id,
              text: opt.text.trim(),
              explanation: opt.explanation?.trim(),
            })),
            correctAnswer,
            explanation: explanation.trim() || undefined,
          };

      await onSubmit(data);
      setSuccess(true);

      if (!question) {
        setText('');
        setExplanation('');
        setOptions([
          { id: 'a', text: '', explanation: '' },
          { id: 'b', text: '', explanation: '' },
        ]);
        setCorrectAnswer('');
        setDifficulty('beginner');
      }

      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to save question');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <h2 className="text-xl font-bold text-gray-900 mb-4">
        {question ? 'Edit Question' : 'Create Question'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="text" className="block text-sm font-medium text-gray-700 mb-1">
            Question Text <span className="text-red-500">*</span>
          </label>
          <textarea
            id="text"
            className="input"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter the question"
            rows={3}
            disabled={loading}
            required
          />
        </div>

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

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Options <span className="text-red-500">*</span> (minimum 2)
            </label>
            <Button type="button" variant="secondary" onClick={addOption} disabled={loading}>
              Add Option
            </Button>
          </div>

          <div className="space-y-3">
            {options.map((option, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-3">
                <div className="flex items-start space-x-3 mb-2">
                  <input
                    type="radio"
                    id={`correct-${index}`}
                    name="correctAnswer"
                    value={option.id}
                    checked={correctAnswer === option.id}
                    onChange={(e) => setCorrectAnswer(e.target.value)}
                    className="mt-1"
                    disabled={loading}
                  />
                  <div className="flex-1">
                    <label htmlFor={`option-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                      Option {option.id.toUpperCase()}
                    </label>
                    <input
                      type="text"
                      id={`option-${index}`}
                      className="input"
                      value={option.text}
                      onChange={(e) => updateOption(index, 'text', e.target.value)}
                      placeholder="Enter option text"
                      disabled={loading}
                      required
                    />
                  </div>
                  {options.length > 2 && (
                    <Button
                      type="button"
                      variant="danger"
                      onClick={() => removeOption(index)}
                      disabled={loading}
                      className="mt-6"
                    >
                      Remove
                    </Button>
                  )}
                </div>
                <div>
                  <label htmlFor={`explanation-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                    Option Explanation (optional)
                  </label>
                  <textarea
                    id={`explanation-${index}`}
                    className="input"
                    value={option.explanation || ''}
                    onChange={(e) => updateOption(index, 'explanation', e.target.value)}
                    placeholder="Explain why this option is correct or incorrect"
                    rows={2}
                    disabled={loading}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="explanation" className="block text-sm font-medium text-gray-700 mb-1">
            General Explanation (optional)
          </label>
          <textarea
            id="explanation"
            className="input"
            value={explanation}
            onChange={(e) => setExplanation(e.target.value)}
            placeholder="Provide a general explanation for this question"
            rows={3}
            disabled={loading}
          />
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-800">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-lg bg-green-50 p-3 text-sm text-green-800">
            Question {question ? 'updated' : 'created'} successfully!
          </div>
        )}

        <div className="flex space-x-3">
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : question ? 'Update Question' : 'Create Question'}
          </Button>
          <Button type="button" variant="secondary" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default QuestionForm;
