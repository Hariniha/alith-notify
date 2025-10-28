import { Agent } from 'alith';

/**
 * Summarizer class handles communication with the Alith Agent API
 */
export class Summarizer {
  constructor(options = {}) {
    this.maxRetries = options.maxRetries || 3;
    this.retryDelay = options.retryDelay || 1000; // milliseconds
    
    // Get API key from environment
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY environment variable is not set');
    }
    
    // Initialize Alith Agent with API key
    this.agent = new Agent({
      model: options.model || 'gpt-4o-mini',
      apiKey: apiKey,
      preamble: options.preamble || 
        'You are an expert log analyzer. Your task is to analyze error logs and provide concise, actionable summaries. Focus on: 1) What went wrong, 2) Potential causes, 3) Recommended actions. Be specific and technical.'
    });
  }

  /**
   * Summarizes log content using the Alith Agent
   * @param {string} logContent - Log content to summarize
   * @returns {Promise<object>} Summary result
   */
  async summarize(logContent) {
    if (!logContent || logContent.trim().length === 0) {
      throw new Error('Cannot summarize empty log content');
    }

    console.log(`📊 Sending ${logContent.length} characters to Alith Agent for summarization...`);

    let lastError;
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const startTime = Date.now();
        const summary = await this.makeRequest(logContent);
        const duration = Date.now() - startTime;
        
        console.log(`✅ Successfully received summary from Alith Agent (${duration}ms)`);
        return summary;
      } catch (error) {
        lastError = error;
        console.error(`❌ Attempt ${attempt}/${this.maxRetries} failed: ${error.message}`);

        if (attempt < this.maxRetries) {
          const delay = this.retryDelay * attempt; // Exponential backoff
          console.log(`⏳ Retrying in ${delay}ms...`);
          await this.sleep(delay);
        }
      }
    }

    throw new Error(`Failed to get summary after ${this.maxRetries} attempts: ${lastError.message}`);
  }

  /**
   * Makes the actual API request using Alith Agent
   * @param {string} logContent - Log content
   * @returns {Promise<object>} API response
   */
  async makeRequest(logContent) {
    try {
      // Create a prompt for the agent to analyze the logs
      const prompt = `Analyze the following error logs and provide a concise summary:

--- START OF LOGS ---
${logContent}
--- END OF LOGS ---

Please provide:
1. A brief overview of the main errors
2. Potential root causes
3. Recommended actions to fix the issues

Keep the summary concise and actionable.`;

      // Use the Alith Agent to generate the summary
      const agentResponse = await this.agent.prompt(prompt);
      
      return {
        summary: agentResponse || 'No summary available',
        timestamp: new Date().toISOString(),
        metadata: {
          originalLength: logContent.length,
          summaryLength: (agentResponse || '').length,
          model: this.agent.model || 'gpt-4',
          agent: 'alith'
        }
      };
    } catch (error) {
      throw new Error(`Alith Agent request failed: ${error.message}`);
    }
  }

  /**
   * Helper to sleep for a given duration
   * @param {number} ms - Milliseconds to sleep
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Creates and returns a new Summarizer instance
 * @param {object} options - Optional configuration
 * @returns {Summarizer} New summarizer instance
 */
export function createSummarizer(options) {
  return new Summarizer(options);
}
