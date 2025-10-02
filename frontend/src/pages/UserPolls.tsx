import { useState, useEffect } from 'react';
import { pollsApi, type Poll } from '../api/polls';
import PollCard from '../components/PollCard';
import { connectSocket, disconnectSocket } from '../services/socket';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

export default function UserPolls() {
  const { user } = useAuth();
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

    const socket = connectSocket(user?.id);

    socket.on('pollCreated', (poll: Poll) => {
      console.log('New poll created:', poll);
      setPolls((prevPolls) => [poll, ...prevPolls]);
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

    socket.on('pollAccessGranted', (poll: Poll) => {
      console.log('Poll access granted:', poll);
      setPolls((prevPolls) => [poll, ...prevPolls]);
      toast.info(`You now have access to the poll: "${poll.title}"`);
    });

    socket.on('pollAccessRevoked', (data: { pollId: string }) => {
      console.log('Poll access revoked:', data.pollId);
      setPolls((prevPolls) => prevPolls.filter((poll) => poll._id !== data.pollId));
      toast.warning('Your access to a poll has been revoked');
    });

    return () => {
      disconnectSocket();
    };
  }, [user?.id]);

  const filteredPolls = polls.filter((poll) => {
    if (filter === 'active') return poll.isActive;
    if (filter === 'expired') return !poll.isActive;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">Available Polls</h1>
        <div className="flex gap-3">
          <button
            className={`px-6 py-2 rounded-lg font-medium transition-all ${
              filter === 'all'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/50'
                : 'bg-white text-slate-700 border border-slate-300 hover:border-blue-500'
            }`}
            onClick={() => setFilter('all')}
          >
            All ({polls.length})
          </button>
          <button
            className={`px-6 py-2 rounded-lg font-medium transition-all ${
              filter === 'active'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/50'
                : 'bg-white text-slate-700 border border-slate-300 hover:border-blue-500'
            }`}
            onClick={() => setFilter('active')}
          >
            Active ({polls.filter((p) => p.isActive).length})
          </button>
          <button
            className={`px-6 py-2 rounded-lg font-medium transition-all ${
              filter === 'expired'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/50'
                : 'bg-white text-slate-700 border border-slate-300 hover:border-blue-500'
            }`}
            onClick={() => setFilter('expired')}
          >
            Expired ({polls.filter((p) => !p.isActive).length})
          </button>
        </div>
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
      ) : filteredPolls.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-slate-500 text-lg">No polls available.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPolls.map((poll) => (
            <PollCard key={poll._id} poll={poll} onVoteSuccess={fetchPolls} />
          ))}
        </div>
      )}
    </div>
  );
}
