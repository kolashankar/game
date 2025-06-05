import apiClient from './apiClient';

interface StoryResponse {
  success: boolean;
  data: {
    story: string;
  };
}

interface QuestResponse {
  success: boolean;
  data: {
    quest: any; // Using any for now, would be better to define a Quest type
  };
}

interface EvaluationResponse {
  success: boolean;
  data: {
    evaluation: any;
    karma_impact: number;
  };
}

interface KarmaResponse {
  success: boolean;
  data: {
    karma: number;
  };
}

/**
 * Service for AI-related API calls
 */
export const aiService = {
  /**
   * Generate a story based on game state
   * @param gameId - Game ID
   * @returns Generated story
   */
  async generateStory(gameId: string): Promise<string> {
    const response = await apiClient.post<StoryResponse>('/ai/generate-story', {
      gameId
    });
    
    return response.data.story;
  },
  
  /**
   * Generate a quest for a player
   * @param gameId - Game ID
   * @param playerId - Player ID
   * @returns Generated quest
   */
  async generateQuest(gameId: string, playerId: string): Promise<any> {
    const response = await apiClient.post<QuestResponse>('/ai/generate-quest', {
      gameId,
      playerId
    });
    
    return response.data.quest;
  },
  
  /**
   * Evaluate a player's decision
   * @param playerId - Player ID
   * @param decision - Decision text
   * @param context - Decision context
   * @returns Evaluation and karma impact
   */
  async evaluateDecision(playerId: string, decision: string, context: any): Promise<{ evaluation: any; karmaImpact: number }> {
    const response = await apiClient.post<EvaluationResponse>('/ai/evaluate-decision', {
      playerId,
      decision,
      context
    });
    
    return {
      evaluation: response.data.evaluation,
      karmaImpact: response.data.karma_impact
    };
  },
  
  /**
   * Calculate karma for a player's actions
   * @param playerId - Player ID
   * @param actions - List of actions
   * @returns Calculated karma
   */
  async calculateKarma(playerId: string, actions: any[]): Promise<number> {
    const response = await apiClient.post<KarmaResponse>('/ai/calculate-karma', {
      playerId,
      actions
    });
    
    return response.data.karma;
  }
};
