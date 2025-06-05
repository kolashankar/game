import React, { useState, useEffect } from 'react';
import { userService } from '../../services/userService';
import LoadingScreen from '../../components/common/LoadingScreen';

interface LeaderboardEntry {
  id: string;
  username: string;
  avatar?: string;
  preferredRole?: string;
  karmaScore: number;
  totalWins: number;
  totalGamesPlayed: number;
  winRate: number;
}

/**
 * Leaderboard page component
 */
const LeaderboardPage: React.FC = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortBy, setSortBy] = useState<'karma' | 'wins' | 'winRate'>('karma');
  const [timeFrame, setTimeFrame] = useState<'all' | 'month' | 'week'>('all');

  // Fetch leaderboard data on component mount and when filters change
  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        const data = await userService.getLeaderboard(sortBy, timeFrame);
        
        // Transform the data into the LeaderboardEntry format
        const entries: LeaderboardEntry[] = data.users.map(user => ({
          id: user.id,
          username: user.username,
          avatar: user.profilePicture,
          preferredRole: user.preferredRole,
          karmaScore: user.karmaScore,
          totalWins: user.totalWins,
          totalGamesPlayed: user.totalGamesPlayed,
          winRate: user.totalGamesPlayed > 0 ? user.totalWins / user.totalGamesPlayed : 0
        }));
        
        setLeaderboard(entries);
        setError('');
      } catch (error) {
        console.error('Failed to fetch leaderboard:', error);
        setError('Failed to load leaderboard. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [sortBy, timeFrame]);

  // Handle sort change
  const handleSortChange = (newSort: 'karma' | 'wins' | 'winRate') => {
    setSortBy(newSort);
  };

  // Handle time frame change
  const handleTimeFrameChange = (newTimeFrame: 'all' | 'month' | 'week') => {
    setTimeFrame(newTimeFrame);
  };

  if (loading) {
    return <LoadingScreen message="Loading Leaderboard" />;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-display font-bold mb-8">Leaderboard</h1>
      
      {/* Filters */}
      <div className="card p-4 mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          {/* Sort options */}
          <div>
            <label className="text-gray-400 mr-2">Sort by:</label>
            <div className="flex gap-2 mt-2 sm:mt-0">
              <button
                onClick={() => handleSortChange('karma')}
                className={`px-3 py-1 rounded-full text-sm ${
                  sortBy === 'karma'
                    ? 'bg-primary-900 text-primary-400 border border-primary-700'
                    : 'bg-dark-700 text-gray-400 hover:bg-dark-600'
                }`}
              >
                Karma Score
              </button>
              <button
                onClick={() => handleSortChange('wins')}
                className={`px-3 py-1 rounded-full text-sm ${
                  sortBy === 'wins'
                    ? 'bg-primary-900 text-primary-400 border border-primary-700'
                    : 'bg-dark-700 text-gray-400 hover:bg-dark-600'
                }`}
              >
                Total Wins
              </button>
              <button
                onClick={() => handleSortChange('winRate')}
                className={`px-3 py-1 rounded-full text-sm ${
                  sortBy === 'winRate'
                    ? 'bg-primary-900 text-primary-400 border border-primary-700'
                    : 'bg-dark-700 text-gray-400 hover:bg-dark-600'
                }`}
              >
                Win Rate
              </button>
            </div>
          </div>
          
          {/* Time frame options */}
          <div>
            <label className="text-gray-400 mr-2">Time frame:</label>
            <div className="flex gap-2 mt-2 sm:mt-0">
              <button
                onClick={() => handleTimeFrameChange('all')}
                className={`px-3 py-1 rounded-full text-sm ${
                  timeFrame === 'all'
                    ? 'bg-primary-900 text-primary-400 border border-primary-700'
                    : 'bg-dark-700 text-gray-400 hover:bg-dark-600'
                }`}
              >
                All Time
              </button>
              <button
                onClick={() => handleTimeFrameChange('month')}
                className={`px-3 py-1 rounded-full text-sm ${
                  timeFrame === 'month'
                    ? 'bg-primary-900 text-primary-400 border border-primary-700'
                    : 'bg-dark-700 text-gray-400 hover:bg-dark-600'
                }`}
              >
                This Month
              </button>
              <button
                onClick={() => handleTimeFrameChange('week')}
                className={`px-3 py-1 rounded-full text-sm ${
                  timeFrame === 'week'
                    ? 'bg-primary-900 text-primary-400 border border-primary-700'
                    : 'bg-dark-700 text-gray-400 hover:bg-dark-600'
                }`}
              >
                This Week
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Error message */}
      {error && (
        <div className="bg-secondary-900 border border-secondary-800 text-secondary-200 px-4 py-3 rounded mb-8">
          {error}
        </div>
      )}
      
      {/* Leaderboard table */}
      <div className="card p-6">
        {leaderboard.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400">No leaderboard data available for the selected filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-dark-600">
                  <th className="pb-4 font-medium">Rank</th>
                  <th className="pb-4 font-medium">Player</th>
                  <th className="pb-4 font-medium text-right">Karma Score</th>
                  <th className="pb-4 font-medium text-right">Wins</th>
                  <th className="pb-4 font-medium text-right">Games</th>
                  <th className="pb-4 font-medium text-right">Win Rate</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((player, index) => (
                  <tr 
                    key={player.id} 
                    className={`border-b border-dark-700 ${index < 3 ? 'bg-dark-800 bg-opacity-50' : ''}`}
                  >
                    {/* Rank */}
                    <td className="py-4">
                      {index < 3 ? (
                        <div className={`
                          w-8 h-8 rounded-full flex items-center justify-center font-bold
                          ${index === 0 ? 'bg-yellow-900 text-yellow-400' : 
                            index === 1 ? 'bg-gray-800 text-gray-300' : 
                            'bg-amber-900 text-amber-600'}
                        `}>
                          {index + 1}
                        </div>
                      ) : (
                        <div className="w-8 h-8 flex items-center justify-center text-gray-400">
                          {index + 1}
                        </div>
                      )}
                    </td>
                    
                    {/* Player info */}
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary-900 flex items-center justify-center">
                          {player.avatar ? (
                            <img 
                              src={player.avatar} 
                              alt={player.username} 
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-lg font-medium">
                              {player.username.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold">{player.username}</p>
                          {player.preferredRole && (
                            <p className="text-sm text-gray-400">{player.preferredRole}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    
                    {/* Stats */}
                    <td className="py-4 text-right">
                      <span className={`font-medium ${
                        sortBy === 'karma' ? 'text-primary-400' : 'text-gray-300'
                      }`}>
                        {player.karmaScore.toLocaleString()}
                      </span>
                    </td>
                    <td className="py-4 text-right">
                      <span className={`font-medium ${
                        sortBy === 'wins' ? 'text-primary-400' : 'text-gray-300'
                      }`}>
                        {player.totalWins.toLocaleString()}
                      </span>
                    </td>
                    <td className="py-4 text-right text-gray-400">
                      {player.totalGamesPlayed.toLocaleString()}
                    </td>
                    <td className="py-4 text-right">
                      <span className={`font-medium ${
                        sortBy === 'winRate' ? 'text-primary-400' : 'text-gray-300'
                      }`}>
                        {(player.winRate * 100).toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeaderboardPage;
