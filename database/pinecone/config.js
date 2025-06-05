/**
 * Pinecone Vector Database Configuration
 * For ChronoCore game's semantic search and AI embeddings
 */

const { PineconeClient } = require('@pinecone-database/pinecone');
const { OpenAIEmbeddings } = require('langchain/embeddings/openai');
const logger = require('../../backend/src/utils/logger');

class PineconeService {
  constructor() {
    this.client = new PineconeClient();
    this.indexName = process.env.PINECONE_INDEX || 'chronocore-ai';
    this.namespace = process.env.PINECONE_NAMESPACE || 'default';
    this.embeddings = new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY,
      modelName: 'text-embedding-ada-002',
    });
    this.initialized = false;
  }

  /**
   * Initialize the Pinecone client
   * @returns {Promise<boolean>} Success status
   */
  async initialize() {
    try {
      await this.client.init({
        apiKey: process.env.PINECONE_API_KEY,
        environment: process.env.PINECONE_ENVIRONMENT || 'us-west1-gcp',
      });

      // Check if index exists
      const indexList = await this.client.listIndexes();
      
      if (!indexList.includes(this.indexName)) {
        logger.info(`Creating Pinecone index: ${this.indexName}`);
        await this.client.createIndex({
          createRequest: {
            name: this.indexName,
            dimension: 1536, // OpenAI embedding dimension
            metric: 'cosine',
          },
        });
        
        // Wait for index to be ready
        await new Promise(resolve => setTimeout(resolve, 60000));
      }

      this.index = this.client.Index(this.indexName);
      this.initialized = true;
      logger.info('Pinecone service initialized successfully');
      return true;
    } catch (error) {
      logger.error('Failed to initialize Pinecone:', error);
      this.initialized = false;
      return false;
    }
  }

  /**
   * Create embeddings for text
   * @param {string} text - Text to create embeddings for
   * @returns {Promise<Array>} Embedding vector
   */
  async createEmbedding(text) {
    try {
      const embedding = await this.embeddings.embedQuery(text);
      return embedding;
    } catch (error) {
      logger.error('Error creating embedding:', error);
      throw error;
    }
  }

  /**
   * Store a vector in Pinecone
   * @param {string} id - Unique ID for the vector
   * @param {Array} vector - Embedding vector
   * @param {Object} metadata - Metadata for the vector
   * @returns {Promise<Object>} Upsert response
   */
  async storeVector(id, vector, metadata = {}) {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      const upsertResponse = await this.index.upsert({
        upsertRequest: {
          vectors: [
            {
              id,
              values: vector,
              metadata,
            },
          ],
          namespace: this.namespace,
        },
      });
      
      return upsertResponse;
    } catch (error) {
      logger.error('Error storing vector in Pinecone:', error);
      throw error;
    }
  }

  /**
   * Query vectors in Pinecone
   * @param {Array} vector - Query vector
   * @param {number} topK - Number of results to return
   * @param {Object} filter - Metadata filter
   * @returns {Promise<Array>} Query results
   */
  async queryVectors(vector, topK = 5, filter = {}) {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      const queryResponse = await this.index.query({
        queryRequest: {
          vector,
          topK,
          includeMetadata: true,
          includeValues: false,
          namespace: this.namespace,
          filter,
        },
      });
      
      return queryResponse.matches;
    } catch (error) {
      logger.error('Error querying vectors in Pinecone:', error);
      throw error;
    }
  }

  /**
   * Store a decision in Pinecone
   * @param {Object} decision - Decision object
   * @returns {Promise<Object>} Upsert response
   */
  async storeDecision(decision) {
    try {
      const text = `${decision.decisionText} Context: ${JSON.stringify(decision.context)}`;
      const vector = await this.createEmbedding(text);
      
      const metadata = {
        type: 'decision',
        playerId: decision.playerId,
        gameId: decision.gameId,
        turn: decision.turn,
        karmaImpact: decision.karmaImpact,
        decisionId: decision.id,
        timestamp: new Date().toISOString(),
      };
      
      return this.storeVector(`decision:${decision.id}`, vector, metadata);
    } catch (error) {
      logger.error('Error storing decision in Pinecone:', error);
      throw error;
    }
  }

  /**
   * Find similar decisions
   * @param {string} query - Query text
   * @param {Object} filter - Metadata filter
   * @param {number} topK - Number of results to return
   * @returns {Promise<Array>} Similar decisions
   */
  async findSimilarDecisions(query, filter = {}, topK = 5) {
    try {
      const vector = await this.createEmbedding(query);
      filter.type = 'decision';
      
      return this.queryVectors(vector, topK, filter);
    } catch (error) {
      logger.error('Error finding similar decisions in Pinecone:', error);
      throw error;
    }
  }

  /**
   * Delete vectors by filter
   * @param {Object} filter - Metadata filter
   * @returns {Promise<Object>} Delete response
   */
  async deleteVectors(filter = {}) {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      const deleteResponse = await this.index.delete({
        deleteRequest: {
          filter,
          namespace: this.namespace,
        },
      });
      
      return deleteResponse;
    } catch (error) {
      logger.error('Error deleting vectors from Pinecone:', error);
      throw error;
    }
  }
}

module.exports = new PineconeService();
