import { useState, useEffect } from 'react';
import { pollsApi, type Poll } from '../api/polls';
import PollCard from '../components/PollCard';

export default function UserPolls() {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'expired'>('all');

  const fetchPolls = async () => {
    try {
      setLoading(true);
      const data = await pollsApi.getAll();
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

  const filteredPolls = polls.filter((poll) => {
    if (filter === 'active') return poll.isActive;
    if (filter === 'expired') return !poll.isActive;
    return true;
  });

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Available Polls</h1>
        <div className="filter-buttons">
          <button
            className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilter('all')}
          >
            All ({polls.length})
          </button>
          <button
            className={`btn ${filter === 'active' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilter('active')}
          >
            Active ({polls.filter((p) => p.isActive).length})
          </button>
          <button
            className={`btn ${filter === 'expired' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilter('expired')}
          >
            Expired ({polls.filter((p) => !p.isActive).length})
          </button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading">Loading polls...</div>
      ) : filteredPolls.length === 0 ? (
        <p className="empty-state">No polls available.</p>
      ) : (
        <div className="polls-grid">
          {filteredPolls.map((poll) => (
            <PollCard key={poll._id} poll={poll} onVoteSuccess={fetchPolls} />
          ))}
        </div>
      )}
    </div>
  );
}
