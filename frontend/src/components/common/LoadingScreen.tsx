import React from 'react';

interface LoadingScreenProps {
  message?: string;
}

/**
 * Loading screen component with a futuristic design
 */
const LoadingScreen: React.FC<LoadingScreenProps> = ({ message = 'Loading...' }) => {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-dark-900 bg-opacity-90 z-50">
      <div className="relative w-24 h-24 mb-8">
        {/* Spinning hexagon */}
        <div className="absolute inset-0 animate-spin-slow">
          <div className="w-24 h-24 border-4 border-primary-500 opacity-30" 
               style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}>
          </div>
        </div>
        
        {/* Inner hexagon with glow */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 bg-dark-800 border-2 border-primary-500 shadow-neon animate-pulse" 
               style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}>
          </div>
        </div>
        
        {/* Center dot */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-4 h-4 bg-primary-500 rounded-full shadow-neon animate-pulse"></div>
        </div>
      </div>
      
      {/* Loading text */}
      <div className="text-center">
        <p className="text-xl font-display text-primary-500 tracking-wider animate-pulse">{message}</p>
        <p className="text-sm text-gray-400 mt-2 font-mono">Initializing chronological systems...</p>
      </div>
    </div>
  );
};

export default LoadingScreen;
