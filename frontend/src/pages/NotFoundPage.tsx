import React from 'react';
import { Link } from 'react-router-dom';

/**
 * 404 Not Found page component
 */
const NotFoundPage: React.FC = () => {
  return (
    <div className="max-w-md mx-auto text-center py-12">
      <h1 className="text-6xl font-display font-bold text-primary-500 mb-4">404</h1>
      <h2 className="text-2xl font-semibold mb-6">Page Not Found</h2>
      
      <p className="text-gray-400 mb-8">
        The page you are looking for doesn't exist or has been moved.
      </p>
      
      <div className="space-y-4">
        <Link to="/" className="btn-primary inline-block">
          Return to Home
        </Link>
        
        <div>
          <Link to="/dashboard" className="text-primary-500 hover:text-primary-400">
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
