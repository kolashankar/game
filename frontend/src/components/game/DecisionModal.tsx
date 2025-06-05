import React, { useState } from 'react';

interface DecisionChoice {
  id: string;
  text: string;
  karmaImpact: number;
  timelineImpact: number;
  description: string;
}

interface Decision {
  id: string;
  title: string;
  description: string;
  context: string;
  choices: DecisionChoice[];
}

interface DecisionModalProps {
  decision: Decision;
  onDecide: (decisionId: string, choiceId: string) => void;
  onClose: () => void;
}

/**
 * Decision modal component for ethical dilemmas
 */
const DecisionModal: React.FC<DecisionModalProps> = ({ decision, onDecide, onClose }) => {
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Handle decision submission
  const handleDecide = async () => {
    if (!selectedChoice) return;
    
    setLoading(true);
    try {
      await onDecide(decision.id, selectedChoice);
    } catch (error) {
      console.error('Failed to make decision:', error);
      setLoading(false);
    }
  };

  // Get karma impact color
  const getKarmaColor = (impact: number) => {
    if (impact > 0) return 'text-green-500';
    if (impact < 0) return 'text-red-500';
    return 'text-gray-400';
  };

  // Get timeline impact color
  const getTimelineColor = (impact: number) => {
    if (impact > 0) return 'text-blue-500';
    if (impact < 0) return 'text-orange-500';
    return 'text-gray-400';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-80">
      <div className="card p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-display font-bold text-primary-400">{decision.title}</h2>
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
        
        {/* Decision description */}
        <div className="mb-6">
          <p className="text-gray-300 leading-relaxed mb-4">{decision.description}</p>
          <div className="bg-dark-800 p-4 rounded-lg border-l-4 border-primary-600">
            <p className="text-gray-300 italic">{decision.context}</p>
          </div>
        </div>
        
        {/* Decision choices */}
        <div className="space-y-4 mb-6">
          <h3 className="text-lg font-semibold">Make Your Decision</h3>
          {decision.choices.map((choice) => (
            <div key={choice.id} className="space-y-2">
              <div 
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
                  
                  {/* Timeline impact */}
                  <div className={getTimelineColor(choice.timelineImpact)}>
                    <span className="font-medium">Timeline Stability: </span>
                    {choice.timelineImpact > 0 ? '+' : ''}{choice.timelineImpact}
                  </div>
                  
                  {/* View details button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowDetails(showDetails === choice.id ? null : choice.id);
                    }}
                    className="text-primary-500 hover:text-primary-400 transition-colors"
                  >
                    {showDetails === choice.id ? 'Hide Details' : 'View Details'}
                  </button>
                </div>
              </div>
              
              {/* Choice details */}
              {showDetails === choice.id && (
                <div className="bg-dark-800 p-3 rounded-lg ml-4 text-sm text-gray-300 border-l-2 border-dark-600">
                  {choice.description}
                </div>
              )}
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
            Postpone Decision
          </button>
          <button
            onClick={handleDecide}
            className="btn-primary"
            disabled={!selectedChoice || loading}
          >
            {loading ? 'Processing...' : 'Confirm Decision'}
          </button>
        </div>
        
        {/* Decision impact note */}
        <div className="mt-4 text-sm text-gray-500 italic">
          <p>Note: Your decision will have lasting consequences on the multiverse and may affect your karma score.</p>
        </div>
      </div>
    </div>
  );
};

export default DecisionModal;
