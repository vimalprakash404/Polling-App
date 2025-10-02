import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import axios from '../api/axios';
import { type Poll } from '../api/polls';

interface ManageAllowedUsersModalProps {
  poll: Poll;
  onClose: () => void;
  onSuccess: () => void;
}

interface User {
  _id: string;
  username: string;
  email: string;
}

export default function ManageAllowedUsersModal({ poll, onClose, onSuccess }: ManageAllowedUsersModalProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>(poll.allowedUsers || []);
  const [loading, setLoading] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [error, setError] = useState('');
  const [usersError, setUsersError] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      setLoadingUsers(true);
      setUsersError('');
      try {
        const response = await axios.get('/users');
        setUsers(response.data);
      } catch (err: any) {
        const errorMsg = err.response?.data?.message || 'Failed to load users';
        setUsersError(errorMsg);
        console.error('Failed to fetch users:', err);
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchUsers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await axios.patch(`/polls/${poll._id}/allowed-users`, {
        allowedUsers: selectedUsers,
      });
      toast.success('Allowed users updated successfully!');
      onSuccess();
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to update allowed users';
      toast.error(errorMsg);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6 relative max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Manage Allowed Users</h2>
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
          Poll: <strong>{poll.title}</strong>
        </p>

        {poll.isPublic && (
          <div className="bg-yellow-100 text-yellow-800 p-3 rounded mb-4">
            This is a public poll. Allowed users setting only applies to private polls.
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Select Users
            </label>
            {usersError && (
              <div className="bg-yellow-100 text-yellow-800 p-2 rounded mb-2 text-sm">
                {usersError}
              </div>
            )}
            {loadingUsers ? (
              <p className="text-sm text-gray-500">Loading users...</p>
            ) : (
              <div className="border border-gray-300 rounded p-3 max-h-64 overflow-y-auto">
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
            <small className="text-gray-500 mt-1 block">
              {selectedUsers.length > 0
                ? `${selectedUsers.length} user(s) selected. They will be able to view and vote on this private poll.`
                : 'Select users who can view and vote on this private poll'}
            </small>
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
              {loading ? 'Updating...' : 'Update'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
