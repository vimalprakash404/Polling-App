import { useState, useEffect } from 'react';
import { pollsApi, type Poll } from '../api/polls';
import CreatePollModal from '../components/CreatePollModal';
import EditPollModal from '../components/EditPollModal';
import ManageAllowedUsersModal from '../components/ManageAllowedUsersModal';
import PollCard from '../components/PollCard';
import { connectSocket, disconnectSocket } from '../services/socket';
import { useAuth } from '../context/AuthContext';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingPoll, setEditingPoll] = useState<Poll | null>(null);
  const [managingUsersPoll, setManagingUsersPoll] = useState<Poll | null>(null);

  const fetchPolls = async () => {
    try {
      setLoading(true);
      const data = await pollsApi.getMyPolls();
      setPolls(data);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch polls');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolls();

    const socket = connectSocket(user?.id);

    socket.on('pollCreated', (poll: Poll) => {
      console.log('New poll created:', poll);
      fetchPolls();
    });

    socket.on('pollUpdated', (updatedPoll: Poll) => {
      console.log('Poll updated:', updatedPoll);
      setPolls((prevPolls) =>
        prevPolls.map((poll) =>
          poll._id === updatedPoll._id ? updatedPoll : poll
        )
      );
    });

    socket.on('pollDeleted', (pollId: string) => {
      console.log('Poll deleted:', pollId);
      setPolls((prevPolls) => prevPolls.filter((poll) => poll._id !== pollId));
    });

    return () => {
      disconnectSocket();
    };
  }, [user?.id]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this poll?')) return;

    try {
      await pollsApi.delete(id);
      setPolls(polls.filter((poll) => poll._id !== id));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete poll');
    }
  };

  const handleEdit = (poll: Poll) => {
    setEditingPoll(poll);
  };

  const handleManageUsers = (poll: Poll) => {
    setManagingUsersPoll(poll);
  };

  const activePolls = polls.filter((poll) => poll.isActive);
  const expiredPolls = polls.filter((poll) => !poll.isActive);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex justify-between items-center">
        <h1 className="text-4xl font-bold text-slate-900">Admin Dashboard</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow-lg shadow-blue-500/50"
        >
          Create New Poll
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded mb-6">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-slate-600 font-medium">Loading polls...</p>
          </div>
        </div>
      ) : (
        <>
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">
              Active Polls ({activePolls.length})
            </h2>
            {activePolls.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow">
                <p className="text-slate-500 text-lg">No active polls. Create one to get started!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activePolls.map((poll) => (
                  <PollCard
                    key={poll._id}
                    poll={poll}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onManageUsers={handleManageUsers}
                    isAdmin
                  />
                ))}
              </div>
            )}
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">
              Expired Polls ({expiredPolls.length})
            </h2>
            {expiredPolls.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow">
                <p className="text-slate-500 text-lg">No expired polls yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {expiredPolls.map((poll) => (
                  <PollCard
                    key={poll._id}
                    poll={poll}
                    onDelete={handleDelete}
                    onManageUsers={handleManageUsers}
                    isAdmin
                  />
                ))}
              </div>
            )}
          </section>
        </>
      )}

      {showCreateModal && (
        <CreatePollModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            fetchPolls();
          }}
        />
      )}

      {editingPoll && (
        <EditPollModal
          poll={editingPoll}
          onClose={() => setEditingPoll(null)}
          onSuccess={() => {
            setEditingPoll(null);
            fetchPolls();
          }}
        />
      )}

      {managingUsersPoll && (
        <ManageAllowedUsersModal
          poll={managingUsersPoll}
          onClose={() => setManagingUsersPoll(null)}
          onSuccess={() => {
            setManagingUsersPoll(null);
            fetchPolls();
          }}
        />
      )}
    </div>
  );
}
