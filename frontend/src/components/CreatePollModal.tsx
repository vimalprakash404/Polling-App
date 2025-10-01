import { useState, useEffect } from 'react';
import { pollsApi } from '../api/polls';
import axios from '../api/axios';

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
  const [users, setUsers] = useState<Array<{ _id: string; username: string; email: string }>>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [usersError, setUsersError] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      setLoadingUsers(true);
      setUsersError('');
      try {
        const response = await axios.get('/users');
        setUsers(response.data);
      } catch (err: any) {
        const errorMsg = err.response?.data?.message || 'Failed to fetch users';
        setUsersError(errorMsg);
        console.error('Failed to fetch users:', err);
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchUsers();
  }, []);

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
        allowedUsers: !isPublic && selectedUsers.length > 0 ? selectedUsers : undefined,
      });
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create poll');
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
          <h2 className="text-xl font-semibold">Create New Poll</h2>
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

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="title" className="block text-sm font-medium mb-1">
              Title *
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

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Options *</label>
            {options.map((option, index) => (
              <div key={index} className="flex items-center mb-2">
                <input
                  type="text"
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  placeholder={`Option ${index + 1}`}
                  required
                  className="flex-grow border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300"
                />
                {options.length > 2 && (
                  <button
                    type="button"
                    className="ml-2 text-red-500 hover:text-red-700"
                    onClick={() => handleRemoveOption(index)}
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              className="mt-2 text-blue-500 hover:text-blue-700"
              onClick={handleAddOption}
            >
              Add Option
            </button>
          </div>

          <div className="mb-4">
            <label htmlFor="duration" className="block text-sm font-medium mb-1">
              Duration (minutes) *
            </label>
            <input
              type="number"
              id="duration"
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(Number(e.target.value))}
              required
              min="1"
              max="120"
              placeholder="Max 120 minutes"
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300"
            />
            <small className="text-gray-500">Maximum duration: 2 hours (120 minutes)</small>
          </div>

          <div className="mb-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="form-checkbox h-5 w-5 text-blue-500"
              />
              <span>Make this poll public</span>
            </label>
          </div>

          {!isPublic && (
            <div className="mb-4">
              <label htmlFor="allowedUsers" className="block text-sm font-medium mb-1">
                Allowed Users
              </label>
              {usersError && (
                <div className="bg-yellow-100 text-yellow-800 p-2 rounded mb-2 text-sm">
                  {usersError}
                </div>
              )}
              {loadingUsers ? (
                <p className="text-sm text-gray-500">Loading users...</p>
              ) : (
                <div className="border border-gray-300 rounded p-3 max-h-48 overflow-y-auto">
                  {users.length === 0 ? (
                    <p className="text-sm text-gray-500">
                      {usersError ? 'Unable to load users' : 'No users available. Register users first to add them to private polls.'}
                    </p>
                  ) : (
                    users.map((user) => (
                      <label key={user._id} className="flex items-center space-x-2 mb-2">
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user._id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedUsers([...selectedUsers, user._id]);
                            } else {
                              setSelectedUsers(selectedUsers.filter((id) => id !== user._id));
                            }
                          }}
                          className="form-checkbox h-4 w-4 text-blue-500"
                        />
                        <span className="text-sm">
                          {user.username} ({user.email})
                        </span>
                      </label>
                    ))
                  )}
                </div>
              )}
              <small className="text-gray-500 block mt-1">
                {selectedUsers.length > 0
                  ? `${selectedUsers.length} user(s) selected. They will be able to view and vote on this private poll.`
                  : 'Select users who can view and vote on this private poll'}
              </small>
            </div>
          )}

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
              {loading ? 'Creating...' : 'Create Poll'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
