import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Footer component
 */
const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-dark-800 border-t border-dark-700 py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo and description */}
          <div>
            <Link to="/" className="flex items-center">
              <span className="font-display text-2xl font-bold text-primary-500 tracking-wider">CHRONO<span className="text-tech-500">CORE</span></span>
            </Link>
            <p className="mt-4 text-gray-400 text-sm">
              A futuristic board game where players manipulate time, ethics, and technology to shape civilizations across alternate futures.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-lg font-display text-gray-200 mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-400 hover:text-primary-500 transition-colors">Home</Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-gray-400 hover:text-primary-500 transition-colors">Dashboard</Link>
              </li>
              <li>
                <Link to="/leaderboard" className="text-gray-400 hover:text-primary-500 transition-colors">Leaderboard</Link>
              </li>
            </ul>
          </div>

          {/* Game roles */}
          <div>
            <h3 className="text-lg font-display text-gray-200 mb-4">Game Roles</h3>
            <ul className="space-y-2">
              <li className="text-tech-500">Techno Monk</li>
              <li className="text-secondary-500">Shadow Broker</li>
              <li className="text-primary-500">Chrono Diplomat</li>
              <li className="text-time-500">Bio-Smith</li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-6 border-t border-dark-700 text-center text-gray-500 text-sm">
          <p>&copy; {currentYear} ChronoCore: Path of Realities. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
