import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

/**
 * Registration page component
 */
const RegisterPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [preferredRole, setPreferredRole] = useState('');
  const [formError, setFormError] = useState('');
  const { register, error, clearError, loading } = useAuth();
  const navigate = useNavigate();

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    clearError();

    // Validate form
    if (!username.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      setFormError('Please fill in all required fields');
      return;
    }

    if (password !== confirmPassword) {
      setFormError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setFormError('Password must be at least 6 characters long');
      return;
    }

    try {
      await register(username, email, password, preferredRole || undefined);
      navigate('/dashboard');
    } catch (error) {
      // Error is handled by the auth context
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="card p-8">
        <h1 className="text-3xl font-display font-bold mb-6 text-center">Register</h1>
        
        {/* Error message */}
        {(error || formError) && (
          <div className="bg-secondary-900 border border-secondary-800 text-secondary-200 px-4 py-3 rounded mb-4">
            {formError || error}
          </div>
        )}
        
        {/* Registration form */}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="username" className="block text-gray-300 mb-2">
              Username <span className="text-secondary-500">*</span>
            </label>
            <input
              type="text"
              id="username"
              className="input w-full"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
              required
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-300 mb-2">
              Email <span className="text-secondary-500">*</span>
            </label>
            <input
              type="email"
              id="email"
              className="input w-full"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="password" className="block text-gray-300 mb-2">
              Password <span className="text-secondary-500">*</span>
            </label>
            <input
              type="password"
              id="password"
              className="input w-full"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
            />
            <p className="text-gray-500 text-sm mt-1">Must be at least 6 characters long</p>
          </div>
          
          <div className="mb-4">
            <label htmlFor="confirmPassword" className="block text-gray-300 mb-2">
              Confirm Password <span className="text-secondary-500">*</span>
            </label>
            <input
              type="password"
              id="confirmPassword"
              className="input w-full"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
              required
            />
          </div>
          
          <div className="mb-6">
            <label htmlFor="preferredRole" className="block text-gray-300 mb-2">
              Preferred Role
            </label>
            <select
              id="preferredRole"
              className="input w-full"
              value={preferredRole}
              onChange={(e) => setPreferredRole(e.target.value)}
              disabled={loading}
            >
              <option value="">Select a role (optional)</option>
              <option value="Techno Monk">Techno Monk</option>
              <option value="Shadow Broker">Shadow Broker</option>
              <option value="Chrono Diplomat">Chrono Diplomat</option>
              <option value="Bio-Smith">Bio-Smith</option>
            </select>
          </div>
          
          <button
            type="submit"
            className="btn-primary w-full py-3"
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
        
        {/* Login link */}
        <div className="mt-6 text-center">
          <p className="text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-500 hover:text-primary-400">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
