import { useState } from 'react';
import { pollsApi } from '../api/polls';

interface CreatePollModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreatePollModal({ onClose, onSuccess }: CreatePollModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [isPublic, setIsPublic] = useState(true);
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAddOption = () => {
    setOptions([...options, '']);
  };

  const handleRemoveOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const validOptions = options.filter((opt) => opt.trim() !== '');
    if (validOptions.length < 2) {
      setError('Please provide at least 2 options');
      return;
    }

    if (durationMinutes < 1 || durationMinutes > 120) {
      setError('Duration must be between 1 and 120 minutes');
      return;
    }

    setLoading(true);

    try {
      await pollsApi.create({
        title,
        description: description || undefined,
        options: validOptions,
        isPublic,
        durationMinutes,
      });
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create poll');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Create New Poll</h2>
          <button className="close-btn" onClick={onClose}>
            &times;
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Title *</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="Enter poll title"
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter poll description (optional)"
              rows={3}
            />
          </div>

          <div className="form-group">
            <label>Options *</label>
            {options.map((option, index) => (
              <div key={index} className="option-input-group">
                <input
                  type="text"
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  placeholder={`Option ${index + 1}`}
                  required
                />
                {options.length > 2 && (
                  <button
                    type="button"
                    className="btn btn-danger btn-sm"
                    onClick={() => handleRemoveOption(index)}
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleAddOption}
            >
              Add Option
            </button>
          </div>

          <div className="form-group">
            <label htmlFor="duration">Duration (minutes) *</label>
            <input
              type="number"
              id="duration"
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(Number(e.target.value))}
              required
              min="1"
              max="120"
              placeholder="Max 120 minutes"
            />
            <small>Maximum duration: 2 hours (120 minutes)</small>
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
              />
              <span>Make this poll public</span>
            </label>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Creating...' : 'Create Poll'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
