import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

/**
 * Navigation bar component
 */
const Navbar: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  return (
    <nav className="bg-dark-800 border-b border-dark-700">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <span className="font-display text-2xl font-bold text-primary-500 tracking-wider">CHRONO<span className="text-tech-500">CORE</span></span>
            </Link>
          </div>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-gray-300 hover:text-primary-500 transition-colors">Home</Link>
            <Link to="/leaderboard" className="text-gray-300 hover:text-primary-500 transition-colors">Leaderboard</Link>
            
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="text-gray-300 hover:text-primary-500 transition-colors">Dashboard</Link>
                <div className="relative group">
                  <button className="flex items-center text-gray-300 hover:text-primary-500 transition-colors focus:outline-none">
                    <span>{user?.username}</span>
                    <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-dark-700 border border-dark-600 rounded-md shadow-lg py-1 z-10 hidden group-hover:block">
                    <Link to="/profile" className="block px-4 py-2 text-sm text-gray-300 hover:bg-dark-600 hover:text-primary-500">Profile</Link>
                    <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-dark-600 hover:text-primary-500">
                      Logout
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-300 hover:text-primary-500 transition-colors">Login</Link>
                <Link to="/register" className="btn-primary">Register</Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-300 hover:text-primary-500 focus:outline-none">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-dark-800 border-t border-dark-700 py-2">
          <div className="container mx-auto px-4 space-y-2">
            <Link to="/" className="block text-gray-300 hover:text-primary-500 transition-colors py-2" onClick={() => setIsMenuOpen(false)}>Home</Link>
            <Link to="/leaderboard" className="block text-gray-300 hover:text-primary-500 transition-colors py-2" onClick={() => setIsMenuOpen(false)}>Leaderboard</Link>
            
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="block text-gray-300 hover:text-primary-500 transition-colors py-2" onClick={() => setIsMenuOpen(false)}>Dashboard</Link>
                <Link to="/profile" className="block text-gray-300 hover:text-primary-500 transition-colors py-2" onClick={() => setIsMenuOpen(false)}>Profile</Link>
                <button onClick={handleLogout} className="block w-full text-left text-gray-300 hover:text-primary-500 transition-colors py-2">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="block text-gray-300 hover:text-primary-500 transition-colors py-2" onClick={() => setIsMenuOpen(false)}>Login</Link>
                <Link to="/register" className="block text-gray-300 hover:text-primary-500 transition-colors py-2" onClick={() => setIsMenuOpen(false)}>Register</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
