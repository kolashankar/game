import React, { useState } from 'react';

interface QuestChoice {
  id: string;
  text: string;
  karmaImpact: number;
  resourceCost?: Record<string, number>;
  resourceGain?: Record<string, number>;
}

interface Quest {
  id: string;
  title: string;
  description: string;
  choices: QuestChoice[];
}

interface QuestModalProps {
  quest: Quest;
  onComplete: (questId: string, choiceId: string) => void;
  onClose: () => void;
}

/**
 * Quest modal component for displaying and interacting with quests
 */
const QuestModal: React.FC<QuestModalProps> = ({ quest, onComplete, onClose }) => {
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Handle quest completion
  const handleComplete = async () => {
    if (!selectedChoice) return;
    
    setLoading(true);
    try {
      await onComplete(quest.id, selectedChoice);
    } catch (error) {
      console.error('Failed to complete quest:', error);
      setLoading(false);
    }
  };

  // Get karma impact color
  const getKarmaColor = (impact: number) => {
    if (impact > 0) return 'text-green-500';
    if (impact < 0) return 'text-red-500';
    return 'text-gray-400';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-70">
      <div className="card p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-display font-bold">{quest.title}</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="Close"
            disabled={loading}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Quest description */}
        <div className="mb-6 text-gray-300 leading-relaxed">
          <p>{quest.description}</p>
        </div>
        
        {/* Quest choices */}
        <div className="space-y-4 mb-6">
          <h3 className="text-lg font-semibold">Choose Your Path</h3>
          {quest.choices.map((choice) => (
            <div 
              key={choice.id}
              className={`
                p-4 rounded-lg border-2 cursor-pointer transition-all
                ${selectedChoice === choice.id 
                  ? 'border-primary-500 bg-primary-900 bg-opacity-20' 
                  : 'border-dark-600 bg-dark-700 hover:border-dark-500'}
              `}
              onClick={() => !loading && setSelectedChoice(choice.id)}
            >
              <p className="mb-3">{choice.text}</p>
              
              <div className="flex flex-wrap gap-4 text-sm">
                {/* Karma impact */}
                <div className={getKarmaColor(choice.karmaImpact)}>
                  <span className="font-medium">Karma: </span>
                  {choice.karmaImpact > 0 ? '+' : ''}{choice.karmaImpact}
                </div>
                
                {/* Resource cost */}
                {choice.resourceCost && Object.keys(choice.resourceCost).length > 0 && (
                  <div className="text-red-400">
                    <span className="font-medium">Cost: </span>
                    {Object.entries(choice.resourceCost).map(([resource, amount], index, arr) => (
                      <span key={resource}>
                        {amount} {resource}{index < arr.length - 1 ? ', ' : ''}
                      </span>
                    ))}
                  </div>
                )}
                
                {/* Resource gain */}
                {choice.resourceGain && Object.keys(choice.resourceGain).length > 0 && (
                  <div className="text-green-400">
                    <span className="font-medium">Gain: </span>
                    {Object.entries(choice.resourceGain).map(([resource, amount], index, arr) => (
                      <span key={resource}>
                        {amount} {resource}{index < arr.length - 1 ? ', ' : ''}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {/* Action buttons */}
        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="btn-secondary"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleComplete}
            className="btn-primary"
            disabled={!selectedChoice || loading}
          >
            {loading ? 'Processing...' : 'Confirm Choice'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuestModal;
