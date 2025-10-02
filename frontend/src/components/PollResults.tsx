import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { pollsApi, type PollResults as PollResultsType } from '../api/polls';

interface PollResultsProps {
  pollId: string;
}

export default function PollResults({ pollId }: PollResultsProps) {
  const [results, setResults] = useState<PollResultsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        const data = await pollsApi.getResults(pollId);
        setResults(data);
        setError('');
      } catch (err: any) {
        const errorMsg = err.response?.data?.message || 'Failed to fetch results';
        setError(errorMsg);
        toast.error(errorMsg);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [pollId]);

  if (loading) return <div className="loading">Loading results...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!results) return null;

  return (
    <div className="poll-results">
      <h4>Results</h4>
      <p className="total-votes">Total Votes: {results.totalVotes}</p>

      <div className="results-list">
        {results.results.map((result, index) => (
          <div key={index} className="result-item">
            <div className="result-header">
              <span className="result-text">{result.text}</span>
              <span className="result-stats">
                {result.votes} votes ({result.percentage}%)
              </span>
            </div>
            <div className="result-bar">
              <div
                className="result-bar-fill"
                style={{ width: `${result.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
