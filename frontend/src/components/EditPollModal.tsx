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
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Edit Poll</h2>
          <button
            className="text-gray-500 hover:text-gray-700"
            onClick={onClose}
          >
            &times;
          </button>
        </div>

        {error && (
          <div className="bg-red-100 text-red-700 p-2 rounded mb-4">
            {error}
          </div>
        )}

        <p className="text-sm text-gray-600 mb-4">
          Note: You can only edit the title and description of active polls. Options and duration cannot be changed.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="title" className="block text-sm font-medium mb-1">
              Title
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="Enter poll title"
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="description" className="block text-sm font-medium mb-1">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter poll description (optional)"
              rows={3}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300"
            />
          </div>

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              disabled={loading}
            >
              {loading ? 'Updating...' : 'Update Poll'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
