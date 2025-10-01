import { useState } from 'react';
import { type Poll, pollsApi } from '../api/polls';
import { useAuth } from '../context/AuthContext';
import PollResults from './PollResults';

interface PollCardProps {
  poll: Poll;
  onEdit?: (poll: Poll) => void;
  onDelete?: (id: string) => void;
  onVoteSuccess?: () => void;
  isAdmin?: boolean;
  onManageUsers?: (poll: Poll) => void;
}

export default function PollCard({ poll, onEdit, onDelete, onVoteSuccess, isAdmin, onManageUsers }: PollCardProps) {
  const { user } = useAuth();
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [voting, setVoting] = useState(false);
  const [error, setError] = useState('');
  const [showResults, setShowResults] = useState(false);

  const hasVoted = poll.options.some((option) =>
    option.votedBy.includes(user?.id || '')
  );

  const expiresAt = new Date(poll.expiresAt);
  const now = new Date();
  const timeLeft = expiresAt.getTime() - now.getTime();
  const minutesLeft = Math.floor(timeLeft / (1000 * 60));

  const handleVote = async () => {
    if (selectedOption === null) {
      setError('Please select an option');
      return;
    }

    setVoting(true);
    setError('');

    try {
      await pollsApi.vote(poll._id, { optionIndex: selectedOption });
      alert('Vote submitted successfully!');
      if (onVoteSuccess) onVoteSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit vote');
    } finally {
      setVoting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow p-6 border border-slate-200">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-bold text-slate-900">{poll.title}</h3>
        <div className="flex gap-2">
          {poll.isPublic ? (
            <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700 font-medium">
              Public
            </span>
          ) : (
            <span className="px-2 py-1 text-xs rounded-full bg-orange-100 text-orange-700 font-medium">
              Private
            </span>
          )}
          {poll.isActive ? (
            <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700 font-medium">
              Active
            </span>
          ) : (
            <span className="px-2 py-1 text-xs rounded-full bg-slate-100 text-slate-700 font-medium">
              Expired
            </span>
          )}
        </div>
      </div>

      {poll.description && (
        <p className="text-slate-600 mb-4 text-sm">{poll.description}</p>
      )}

      <div className="mb-4 text-sm space-y-1">
        <p className="text-slate-700">
          <span className="font-semibold">Created by:</span> {poll.createdBy.username}
        </p>
        {poll.isActive ? (
          <p className="text-slate-700">
            <span className="font-semibold">Time left:</span>{' '}
            <span className={minutesLeft > 0 ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
              {minutesLeft > 0 ? `${minutesLeft} minutes` : 'Expired'}
            </span>
          </p>
        ) : (
          <p className="text-slate-700">
            <span className="font-semibold">Expired:</span> {expiresAt.toLocaleString()}
          </p>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded mb-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {!isAdmin && poll.isActive && !hasVoted && (
        <div className="space-y-3 mb-4">
          {poll.options.map((option, index) => (
            <label
              key={index}
              className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                selectedOption === index
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-slate-200 hover:border-blue-300 bg-white'
              }`}
            >
              <input
                type="radio"
                name={`poll-${poll._id}`}
                value={index}
                checked={selectedOption === index}
                onChange={() => setSelectedOption(index)}
                className="w-4 h-4 text-blue-600"
              />
              <span className="ml-3 text-slate-900 font-medium">{option.text}</span>
            </label>
          ))}
          <button
            onClick={handleVote}
            disabled={voting}
            className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {voting ? 'Submitting...' : 'Submit Vote'}
          </button>
        </div>
      )}

      {!isAdmin && hasVoted && (
        <div className="bg-green-50 border-l-4 border-green-500 p-3 rounded mb-4">
          <p className="text-sm text-green-700 font-medium">You have already voted in this poll.</p>
        </div>
      )}

      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setShowResults(!showResults)}
          className="flex-1 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors font-medium text-sm"
        >
          {showResults ? 'Hide Results' : 'View Results'}
        </button>
        {isAdmin && onEdit && poll.isActive && (
          <button
            onClick={() => onEdit(poll)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
          >
            Edit
          </button>
        )}
        {isAdmin && onManageUsers && !poll.isPublic && (
          <button
            onClick={() => onManageUsers(poll)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium text-sm"
          >
            Manage Users
          </button>
        )}
        {isAdmin && onDelete && (
          <button
            onClick={() => onDelete(poll._id)}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-sm"
          >
            Delete
          </button>
        )}
      </div>

      {showResults && <PollResults pollId={poll._id} />}
    </div>
  );
}
