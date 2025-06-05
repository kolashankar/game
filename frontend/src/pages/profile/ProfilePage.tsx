import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { userService } from '../../services/userService';
import LoadingScreen from '../../components/common/LoadingScreen';

/**
 * User profile page component
 */
const ProfilePage: React.FC = () => {
  const { user, updateUserProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    preferredRole: '',
    avatar: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch user stats on component mount
  useEffect(() => {
    const fetchUserStats = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const userStats = await userService.getUserStats(user.id);
        setStats(userStats);
      } catch (error) {
        console.error('Failed to fetch user stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserStats();
  }, [user]);

  // Initialize form data when user data is available
  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username,
        email: user.email,
        preferredRole: user.preferredRole || '',
        avatar: user.avatar || ''
      });
    }
  }, [user]);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    try {
      setLoading(true);
      await updateUserProfile(formData);
      setSuccess('Profile updated successfully');
      setIsEditing(false);
    } catch (error) {
      setError('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !user) {
    return <LoadingScreen message="Loading Profile" />;
  }

  if (!user) {
    return (
      <div className="card p-6 text-center">
        <h2 className="text-2xl font-display font-bold mb-4">Profile Not Available</h2>
        <p className="text-gray-400 mb-6">Please log in to view your profile.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-display font-bold mb-8">Your Profile</h1>
      
      {/* Profile header */}
      <div className="card p-6 mb-8">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          {/* Avatar */}
          <div className="w-24 h-24 rounded-full bg-primary-900 flex items-center justify-center text-3xl font-bold">
            {user.avatar ? (
              <img 
                src={user.avatar} 
                alt={user.username} 
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              user.username.charAt(0).toUpperCase()
            )}
          </div>
          
          {/* User info */}
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-2xl font-semibold">{user.username}</h2>
            <p className="text-gray-400 mb-2">{user.preferredRole || 'No preferred role'}</p>
            <p className="text-gray-500">Member since {new Date(user.createdAt).toLocaleDateString()}</p>
            
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="btn-primary mt-4"
              >
                Edit Profile
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Edit profile form */}
      {isEditing && (
        <div className="card p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Edit Profile</h2>
          
          {error && (
            <div className="bg-secondary-900 border border-secondary-800 text-secondary-200 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          
          {success && (
            <div className="bg-green-900 border border-green-800 text-green-200 px-4 py-3 rounded mb-4">
              {success}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="username" className="block text-gray-300 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  className="input w-full"
                  value={formData.username}
                  onChange={handleInputChange}
                  disabled={loading}
                  required
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="input w-full"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={loading}
                  required
                />
              </div>
              
              <div>
                <label htmlFor="preferredRole" className="block text-gray-300 mb-2">
                  Preferred Role
                </label>
                <select
                  id="preferredRole"
                  name="preferredRole"
                  className="input w-full"
                  value={formData.preferredRole}
                  onChange={handleInputChange}
                  disabled={loading}
                >
                  <option value="">Select a role (optional)</option>
                  <option value="Techno Monk">Techno Monk</option>
                  <option value="Shadow Broker">Shadow Broker</option>
                  <option value="Chrono Diplomat">Chrono Diplomat</option>
                  <option value="Bio-Smith">Bio-Smith</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="avatar" className="block text-gray-300 mb-2">
                  Avatar URL
                </label>
                <input
                  type="text"
                  id="avatar"
                  name="avatar"
                  className="input w-full"
                  value={formData.avatar}
                  onChange={handleInputChange}
                  disabled={loading}
                  placeholder="https://example.com/avatar.jpg"
                />
                <p className="text-gray-500 text-sm mt-1">Leave empty to use initials</p>
              </div>
            </div>
            
            <div className="flex justify-end space-x-4 mt-6">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="btn-secondary"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      )}
      
      {/* User stats */}
      <div className="card p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Game Statistics</h2>
        
        {loading && !stats ? (
          <div className="text-center py-4">
            <p className="text-gray-400">Loading stats...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="p-4 bg-dark-700 rounded-lg text-center">
                <p className="text-gray-400 text-sm">Games Played</p>
                <p className="text-2xl font-semibold">{stats?.totalGamesPlayed || 0}</p>
              </div>
              <div className="p-4 bg-dark-700 rounded-lg text-center">
                <p className="text-gray-400 text-sm">Wins</p>
                <p className="text-2xl font-semibold">{stats?.totalWins || 0}</p>
              </div>
              <div className="p-4 bg-dark-700 rounded-lg text-center">
                <p className="text-gray-400 text-sm">Karma Score</p>
                <p className="text-2xl font-semibold">{stats?.karmaScore || 0}</p>
              </div>
              <div className="p-4 bg-dark-700 rounded-lg text-center">
                <p className="text-gray-400 text-sm">Win Rate</p>
                <p className="text-2xl font-semibold">
                  {stats?.totalGamesPlayed 
                    ? Math.round((stats.totalWins / stats.totalGamesPlayed) * 100) 
                    : 0}%
                </p>
              </div>
            </div>
            
            {/* Tech tree progress */}
            {stats?.techTreeProgress && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Tech Tree Progress</h3>
                <div className="space-y-3">
                  {Object.entries(stats.techTreeProgress).map(([tech, level]: [string, any]) => (
                    <div key={tech}>
                      <div className="flex justify-between mb-1">
                        <span className="text-gray-300">{tech}</span>
                        <span className="text-gray-400">Level {level.current}/{level.max}</span>
                      </div>
                      <div className="w-full bg-dark-700 rounded-full h-2">
                        <div 
                          className="bg-tech-500 h-2 rounded-full" 
                          style={{ width: `${(level.current / level.max) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Recent games */}
            {stats?.recentGames && stats.recentGames.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Recent Games</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left border-b border-dark-600">
                        <th className="pb-2 font-medium">Game</th>
                        <th className="pb-2 font-medium">Date</th>
                        <th className="pb-2 font-medium">Result</th>
                        <th className="pb-2 font-medium">Karma</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.recentGames.map((game: any) => (
                        <tr key={game.id} className="border-b border-dark-700">
                          <td className="py-3">{game.name}</td>
                          <td className="py-3 text-gray-400">
                            {new Date(game.completedAt).toLocaleDateString()}
                          </td>
                          <td className="py-3">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              game.result === 'win' 
                                ? 'bg-green-900 text-green-400' 
                                : 'bg-secondary-900 text-secondary-400'
                            }`}>
                              {game.result === 'win' ? 'Victory' : 'Defeat'}
                            </span>
                          </td>
                          <td className="py-3">
                            <span className={game.karmaGained >= 0 ? 'text-green-500' : 'text-red-500'}>
                              {game.karmaGained > 0 ? '+' : ''}{game.karmaGained}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
      
      {/* Achievements */}
      <div className="card p-6">
        <h2 className="text-xl font-semibold mb-4">Achievements</h2>
        
        {loading && !stats ? (
          <div className="text-center py-4">
            <p className="text-gray-400">Loading achievements...</p>
          </div>
        ) : stats?.achievements && stats.achievements.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stats.achievements.map((achievement: any) => (
              <div 
                key={achievement.id}
                className="p-4 bg-dark-700 rounded-lg flex items-center gap-4"
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  achievement.unlocked 
                    ? 'bg-primary-900 text-primary-400' 
                    : 'bg-dark-800 text-gray-500'
                }`}>
                  {achievement.unlocked ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  )}
                </div>
                <div>
                  <h4 className={`font-semibold ${achievement.unlocked ? 'text-white' : 'text-gray-500'}`}>
                    {achievement.name}
                  </h4>
                  <p className={`text-sm ${achievement.unlocked ? 'text-gray-400' : 'text-gray-600'}`}>
                    {achievement.description}
                  </p>
                  {achievement.unlocked && (
                    <p className="text-xs text-primary-500 mt-1">
                      Unlocked on {new Date(achievement.unlockedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-gray-400">No achievements unlocked yet.</p>
            <p className="text-gray-500 mt-2">Play more games to earn achievements!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
