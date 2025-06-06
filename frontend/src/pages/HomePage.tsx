import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

/**
 * Home page component
 */
const HomePage: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  // If already authenticated (including guest), redirect to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="space-y-16">
      {/* Hero section */}
      <section className="py-16 text-center">
        <h1 className="text-4xl md:text-6xl font-display font-bold mb-6">
          <span className="text-primary-500">CHRONO</span>
          <span className="text-tech-500">CORE</span>
        </h1>
        <h2 className="text-2xl md:text-3xl font-display mb-8 text-gray-300">Path of Realities</h2>
        <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-10">
          A futuristic board game where players manipulate time, ethics, and technology 
          to shape civilizations across alternate futures.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
        <Link to="/dashboard" className="btn-primary text-lg px-8 py-3">
          Play as Guest
        </Link>
        <div className="hidden sm:block border-l border-gray-700 mx-2"></div>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link to="/login" className="btn-outline-primary text-lg px-8 py-3">
            Login
          </Link>
          <Link to="/register" className="btn-outline-primary text-lg px-8 py-3">
            Create Account
          </Link>
        </div>
      </div>
      </section>

      {/* Game features */}
      <section className="py-16">
        <h2 className="text-3xl font-display font-bold mb-12 text-center">Key Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="card-glow-tech p-6 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-tech-900 flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-tech-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
            <h3 className="text-xl font-display font-semibold mb-2 text-tech-500">Multiverse Board System</h3>
            <p className="text-gray-400">
              Modular and expandable board made of hexagonal tiles representing different timelines.
              Each session can be different based on how the tiles are arranged.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="card-glow-ethics p-6 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-ethics-900 flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-ethics-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="text-xl font-display font-semibold mb-2 text-ethics-500">Ethical Dilemmas</h3>
            <p className="text-gray-400">
              Each tile has ethical dilemmas, historical parallels, and karmic choices.
              Players make decisions similar to real-life leadership, business, or personal growth scenarios.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="card-glow-time p-6 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-time-900 flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-time-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-display font-semibold mb-2 text-time-500">Time-Tech-Ethics Dice</h3>
            <p className="text-gray-400">
              Custom dice with symbols: Time Warp, Tech Boost, Ethical Turn, Action Point, Event Trigger.
              Outcomes are unpredictable but logical based on choices made before.
            </p>
          </div>
        </div>
      </section>

      {/* Player roles */}
      <section className="py-16">
        <h2 className="text-3xl font-display font-bold mb-12 text-center">Player Roles</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Role 1 */}
          <div className="card p-6 border-tech-500 hover:shadow-neon-tech transition-shadow duration-300">
            <h3 className="text-xl font-display font-semibold mb-2 text-tech-500">Techno Monk</h3>
            <p className="text-gray-400 mb-4">
              Spiritual tech leaders who balance innovation with wisdom. They excel at research and can stabilize timelines.
            </p>
            <div className="mt-auto pt-4 border-t border-dark-700">
              <span className="text-sm font-mono text-tech-500">HARMONY + INNOVATION</span>
            </div>
          </div>

          {/* Role 2 */}
          <div className="card p-6 border-secondary-500 hover:shadow-neon transition-shadow duration-300">
            <h3 className="text-xl font-display font-semibold mb-2 text-secondary-500">Shadow Broker</h3>
            <p className="text-gray-400 mb-4">
              Ethical hackers who manipulate information and resources. They excel at acquiring resources and infiltrating realms.
            </p>
            <div className="mt-auto pt-4 border-t border-dark-700">
              <span className="text-sm font-mono text-secondary-500">STRATEGY + DECEPTION</span>
            </div>
          </div>

          {/* Role 3 */}
          <div className="card p-6 border-primary-500 hover:shadow-neon transition-shadow duration-300">
            <h3 className="text-xl font-display font-semibold mb-2 text-primary-500">Chrono Diplomat</h3>
            <p className="text-gray-400 mb-4">
              Peacekeepers and manipulators of time. They excel at connecting timelines and resolving time rifts.
            </p>
            <div className="mt-auto pt-4 border-t border-dark-700">
              <span className="text-sm font-mono text-primary-500">TIME + DIPLOMACY</span>
            </div>
          </div>

          {/* Role 4 */}
          <div className="card p-6 border-time-500 hover:shadow-neon-time transition-shadow duration-300">
            <h3 className="text-xl font-display font-semibold mb-2 text-time-500">Bio-Smith</h3>
            <p className="text-gray-400 mb-4">
              Genetic eco-engineers who shape life and environments. They excel at developing realms and creating sustainable systems.
            </p>
            <div className="mt-auto pt-4 border-t border-dark-700">
              <span className="text-sm font-mono text-time-500">NATURE + FUTURE</span>
            </div>
          </div>
        </div>
      </section>

      {/* Call to action */}
      <section className="py-16 text-center">
        <div className="card-glow p-10 max-w-4xl mx-auto">
          <h2 className="text-3xl font-display font-bold mb-6">Ready to Shape the Future?</h2>
          <p className="text-xl text-gray-400 mb-8">
            Join ChronoCore today and become an Architect of Reality. Your decisions will echo across timelines.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            {isAuthenticated ? (
              <Link to="/dashboard" className="btn-primary text-lg px-8 py-3">
                Enter the Game
              </Link>
            ) : (
              <>
                <Link to="/register" className="btn-primary text-lg px-8 py-3">
                  Create Account
                </Link>
                <Link to="/login" className="btn-outline-primary text-lg px-8 py-3">
                  Login
                </Link>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
