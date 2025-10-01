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
}

export default function PollCard({ poll, onEdit, onDelete, onVoteSuccess, isAdmin }: PollCardProps) {
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
    <div className="poll-card">
      <div className="poll-header">
        <h3>{poll.title}</h3>
        <div className="poll-badges">
          {poll.isPublic ? (
            <span className="badge badge-public">Public</span>
          ) : (
            <span className="badge badge-private">Private</span>
          )}
          {poll.isActive ? (
            <span className="badge badge-active">Active</span>
          ) : (
            <span className="badge badge-expired">Expired</span>
          )}
        </div>
      </div>

      {poll.description && <p className="poll-description">{poll.description}</p>}

      <div className="poll-meta">
        <p>
          <strong>Created by:</strong> {poll.createdBy.username}
        </p>
        {poll.isActive ? (
          <p className="time-left">
            <strong>Time left:</strong> {minutesLeft > 0 ? `${minutesLeft} minutes` : 'Expired'}
          </p>
        ) : (
          <p>
            <strong>Expired:</strong> {expiresAt.toLocaleString()}
          </p>
        )}
      </div>

      {error && <div className="error-message">{error}</div>}

      {!isAdmin && poll.isActive && !hasVoted && (
        <div className="poll-options">
          {poll.options.map((option, index) => (
            <label key={index} className="poll-option">
              <input
                type="radio"
                name={`poll-${poll._id}`}
                value={index}
                checked={selectedOption === index}
                onChange={() => setSelectedOption(index)}
              />
              <span>{option.text}</span>
            </label>
          ))}
          <button className="btn btn-primary" onClick={handleVote} disabled={voting}>
            {voting ? 'Submitting...' : 'Submit Vote'}
          </button>
        </div>
      )}

      {!isAdmin && hasVoted && (
        <div className="voted-message">
          <p>You have already voted in this poll.</p>
        </div>
      )}

      <div className="poll-actions">
        <button className="btn btn-secondary" onClick={() => setShowResults(!showResults)}>
          {showResults ? 'Hide Results' : 'View Results'}
        </button>
        {isAdmin && onEdit && poll.isActive && (
          <button className="btn btn-secondary" onClick={() => onEdit(poll)}>
            Edit
          </button>
        )}
        {isAdmin && onDelete && (
          <button className="btn btn-danger" onClick={() => onDelete(poll._id)}>
            Delete
          </button>
        )}
      </div>

      {showResults && <PollResults pollId={poll._id} />}
    </div>
  );
}
