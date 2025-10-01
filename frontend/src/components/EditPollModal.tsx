import { useState } from 'react';
import { pollsApi, type Poll } from '../api/polls';

interface EditPollModalProps {
  poll: Poll;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditPollModal({ poll, onClose, onSuccess }: EditPollModalProps) {
  const [title, setTitle] = useState(poll.title);
  const [description, setDescription] = useState(poll.description || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await pollsApi.update(poll._id, {
        title,
        description: description || undefined,
      });
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update poll');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Edit Poll</h2>
          <button className="close-btn" onClick={onClose}>
            &times;
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <p className="info-message">
          Note: You can only edit the title and description of active polls. Options and duration cannot be changed.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Title</label>
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

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Updating...' : 'Update Poll'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
