import { useState, useEffect } from 'react';
import { pollsApi, type Poll } from '../api/polls';
import CreatePollModal from '../components/CreatePollModal';
import EditPollModal from '../components/EditPollModal';
import PollCard from '../components/PollCard';

export default function AdminDashboard() {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingPoll, setEditingPoll] = useState<Poll | null>(null);

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
  }, []);

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

  const activePolls = polls.filter((poll) => poll.isActive);
  const expiredPolls = polls.filter((poll) => !poll.isActive);

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
          Create New Poll
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading">Loading polls...</div>
      ) : (
        <>
          <section className="polls-section">
            <h2>Active Polls ({activePolls.length})</h2>
            {activePolls.length === 0 ? (
              <p className="empty-state">No active polls. Create one to get started!</p>
            ) : (
              <div className="polls-grid">
                {activePolls.map((poll) => (
                  <PollCard
                    key={poll._id}
                    poll={poll}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    isAdmin
                  />
                ))}
              </div>
            )}
          </section>

          <section className="polls-section">
            <h2>Expired Polls ({expiredPolls.length})</h2>
            {expiredPolls.length === 0 ? (
              <p className="empty-state">No expired polls yet.</p>
            ) : (
              <div className="polls-grid">
                {expiredPolls.map((poll) => (
                  <PollCard
                    key={poll._id}
                    poll={poll}
                    onDelete={handleDelete}
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
    </div>
  );
}
