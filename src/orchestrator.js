import { createErrorCapture } from './error-capture.js';
import { createSummarizer } from './summarizer.js';
import { createCopilotIntegration } from './copilot-integration.js';
import { EventEmitter } from 'events';
import fs from 'fs';

/**
 * ErrorOrchestrator - Orchestrates error capture, summarization, and Copilot integration
 */
export class ErrorOrchestrator extends EventEmitter {
  constructor(options = {}) {
    super();
    this.captureLogPath = options.captureLogPath || './captured-errors.log';
    this.checkInterval = (options.checkInterval || 30) * 1000; // Convert to ms
    this.minErrorsToProcess = options.minErrorsToProcess || 1; // Process after N errors
    this.errorCapture = null;
    this.summarizer = null;
    this.copilot = null;
    this.timer = null;
    this.lastProcessedSize = 0;
  }

  /**
   * Starts the error orchestration system
   */
  async start() {
    console.log('🚀 Starting Error Orchestration System...\n');

    // Initialize error capture
    this.errorCapture = createErrorCapture({
      logFilePath: this.captureLogPath,
      captureStderr: true,
      captureUncaught: true,
      captureRejections: true
    });

    // Initialize summarizer
    this.summarizer = createSummarizer();

    // Initialize Copilot integration
    this.copilot = createCopilotIntegration();

    // Start capturing errors
    this.errorCapture.start();

    console.log('⏱️  Will check for new errors every', this.checkInterval / 1000, 'seconds\n');

    // Start periodic checking
    this.timer = setInterval(() => {
      this.checkAndProcessErrors();
    }, this.checkInterval);

    this.emit('started');
  }

  /**
   * Checks for new errors and processes them
   */
  async checkAndProcessErrors() {
    try {
      // Check if log file exists and has new content
      if (!fs.existsSync(this.captureLogPath)) {
        return;
      }

      const stats = fs.statSync(this.captureLogPath);
      const currentSize = stats.size;

      // Check if there's new content
      if (currentSize <= this.lastProcessedSize || currentSize === 0) {
        return;
      }

      console.log(`\n${'═'.repeat(70)}`);
      console.log('🔍 NEW ERRORS DETECTED');
      console.log(`${'═'.repeat(70)}`);

      // Read the errors
      const allErrors = this.errorCapture.readErrors();
      const newErrors = allErrors.substring(this.lastProcessedSize);

      // Count error lines
      const errorLines = newErrors.split('\n').filter(line => line.trim().length > 0);
      console.log(`📊 Found ${errorLines.length} new error line(s)\n`);

      // Process the errors
      await this.processErrors(newErrors, allErrors);

      // Update last processed position
      this.lastProcessedSize = currentSize;

    } catch (error) {
      console.error('❌ Error during processing:', error.message);
    }
  }

  /**
   * Processes errors: summarize and send to Copilot
   * @param {string} newErrors - New errors since last check
   * @param {string} allErrors - All accumulated errors
   */
  async processErrors(newErrors, allErrors) {
    console.log('🤖 Step 1: Summarizing errors with Alith Agent...\n');

    try {
      // Summarize the errors
      const summaryResult = await this.summarizer.summarize(newErrors);
      const summary = summaryResult.summary;

      console.log('✅ Summary generated\n');
      console.log('📝 SUMMARY:');
      console.log('─'.repeat(70));
      console.log(summary);
      console.log('─'.repeat(70));
      console.log();

      // Send directly to Copilot
      console.log('🤖 Step 2: Sending to GitHub Copilot...\n');
      await this.copilot.sendToCopilot(summary, newErrors);

      // Clear the log file after successful processing
      console.log('🗑️  Clearing processed errors from log...\n');
      this.clearErrors();

      // Emit event with the data
      this.emit('errorsProcessed', {
        summary,
        originalErrors: newErrors,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('❌ Failed to process errors:', error.message);
    }
  }

  /**
   * Manually triggers error processing
   */
  async processNow() {
    console.log('🔄 Manually triggering error processing...\n');
    await this.checkAndProcessErrors();
  }

  /**
   * Clears captured errors
   */
  clearErrors() {
    if (this.errorCapture) {
      this.errorCapture.clearErrors();
      this.lastProcessedSize = 0;
    }
  }

  /**
   * Stops the orchestrator
   */
  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }

    if (this.errorCapture) {
      this.errorCapture.stop();
    }

    console.log('🛑 Error Orchestration System stopped');
    this.emit('stopped');
  }
}

/**
 * Creates and returns a new ErrorOrchestrator instance
 * @param {object} options - Configuration options
 * @returns {ErrorOrchestrator} New orchestrator instance
 */
export function createOrchestrator(options) {
  return new ErrorOrchestrator(options);
}
