import { useContext } from 'react';
import { GameContext } from '../context/GameContext';

/**
 * Custom hook to access the game context
 * @returns Game context
 */
export const useGame = () => {
  const context = useContext(GameContext);
  
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  
  return context;
};
