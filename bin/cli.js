#!/usr/bin/env node

import 'dotenv/config';
import { loadConfig, createDefaultConfig } from '../src/config.js';
import { createWatcher } from '../src/watcher.js';
import { createSummarizer } from '../src/summarizer.js';

/**
 * Main CLI application
 */
class AlithNotifyCLI {
  constructor() {
    this.watcher = null;
    this.summarizer = null;
    this.config = null;
  }

  /**
   * Parses command line arguments
   * @returns {object} Parsed arguments
   */
  parseArgs() {
    const args = process.argv.slice(2);
    const parsed = {
      config: './alith.config.json',
      init: false,
      help: false
    };

    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      
      if (arg === '--config' || arg === '-c') {
        parsed.config = args[++i];
      } else if (arg === '--init') {
        parsed.init = true;
      } else if (arg === '--help' || arg === '-h') {
        parsed.help = true;
      }
    }

    return parsed;
  }

  /**
   * Displays help information
   */
  showHelp() {
    console.log(`
╔═══════════════════════════════════════════════════════════════╗
║                      ALITH NOTIFY                             ║
║       Monitor logs, AI-powered error analysis                 ║
╚═══════════════════════════════════════════════════════════════╝

Usage:
  alith-notify [options]

Options:
  --config, -c <path>    Path to configuration file (default: ./alith.config.json)
  --init                 Create a default configuration file
  --help, -h             Show this help message

Examples:
  # Start monitoring with default config
  alith-notify

  # Use custom config file
  alith-notify --config /path/to/config.json

  # Create default config file
  alith-notify --init

Configuration file format:
  {
    "logFile": "./server.log",
    "interval": 30,
    "alithApiKey": "YOUR_ALITH_API_KEY"
  }

For more information, visit: https://github.com/Hariniha/alith-notify
    `);
  }

  /**
   * Initializes the application
   * @param {object} args - Parsed arguments
   */
  async initialize(args) {
    // Handle special commands
    if (args.help) {
      this.showHelp();
      process.exit(0);
    }

    if (args.init) {
      createDefaultConfig(args.config);
      process.exit(0);
    }

    // Load configuration
    console.log(`📂 Loading configuration from: ${args.config}`);
    this.config = await loadConfig(args.config);
    console.log('✅ Configuration loaded successfully\n');

    // Initialize components
    this.summarizer = createSummarizer();

    this.watcher = createWatcher(
      this.config.logFile,
      this.config.interval
    );

    // Set up event handlers
    this.setupEventHandlers();
  }

  /**
   * Sets up event handlers for the watcher
   */
  setupEventHandlers() {
    this.watcher.on('ready', (data) => {
      console.log('✅ Watcher is ready and monitoring\n');
    });

    this.watcher.on('update', async (data) => {
      try {
        await this.handleLogUpdate(data);
      } catch (error) {
        console.error(`❌ Error handling log update: ${error.message}`);
      }
    });

    this.watcher.on('error', (error) => {
      console.error(`❌ Watcher error: ${error.message}`);
    });

    this.watcher.on('stopped', () => {
      console.log('👋 Watcher stopped');
    });
  }

  /**
   * Handles new log updates
   * @param {object} data - Update data from watcher
   */
  async handleLogUpdate(data) {
    const { content, lines, timestamp } = data;

    console.log(`\n${'═'.repeat(70)}`);
    console.log(`🆕 NEW ERRORS DETECTED - ${lines.length} line(s)`);
    console.log(`${'═'.repeat(70)}`);

    try {
      // Get AI analysis from Alith Agent
      const summaryResult = await this.summarizer.summarize(content);

      // Print beautiful console output
      this.printAnalysis({
        summary: summaryResult.summary,
        originalContent: content,
        timestamp: timestamp,
        metadata: summaryResult.metadata
      });

      console.log(`${'═'.repeat(70)}\n`);
    } catch (error) {
      console.error(`❌ Failed to process log update: ${error.message}\n`);
    }
  }

  /**
   * Prints AI analysis to console in a beautiful format
   * @param {object} data - Analysis data
   */
  printAnalysis(data) {
    const { summary, originalContent, timestamp, metadata } = data;
    
    console.log('\n🤖 AI ANALYSIS:');
    console.log(`${'─'.repeat(70)}`);
    console.log(summary);
    console.log(`${'─'.repeat(70)}`);
    
    console.log('\n📄 ORIGINAL LOGS:');
    console.log(`${'─'.repeat(70)}`);
    const lines = originalContent.split('\n').filter(l => l.trim());
    lines.forEach(line => {
      if (line.toLowerCase().includes('error')) {
        console.log(`🔴 ${line}`);
      } else if (line.toLowerCase().includes('warn')) {
        console.log(`🟡 ${line}`);
      } else {
        console.log(`⚪ ${line}`);
      }
    });
    console.log(`${'─'.repeat(70)}`);
    
    console.log('\n📊 METADATA:');
    console.log(`   ⏰ Time: ${new Date(timestamp).toLocaleString()}`);
    console.log(`   📏 Original: ${metadata.originalLength} chars`);
    console.log(`   📝 Summary: ${metadata.summaryLength} chars`);
    console.log(`   🤖 Model: ${metadata.model || 'N/A'}`);
  }

  /**
   * Starts the application
   */
  async start() {
    console.log(`
╔═══════════════════════════════════════════════════════════════╗
║                      ALITH NOTIFY                             ║
║          AI-Powered Log Monitoring & Analysis                ║
╚═══════════════════════════════════════════════════════════════╝
`);

    const args = this.parseArgs();

    try {
      await this.initialize(args);
      await this.watcher.start();

      // Handle graceful shutdown
      process.on('SIGINT', () => {
        console.log('\n\n🛑 Received shutdown signal...');
        this.shutdown();
      });

      process.on('SIGTERM', () => {
        console.log('\n\n🛑 Received termination signal...');
        this.shutdown();
      });

    } catch (error) {
      console.error(`\n❌ Fatal error: ${error.message}\n`);
      process.exit(1);
    }
  }

  /**
   * Gracefully shuts down the application
   */
  shutdown() {
    if (this.watcher) {
      this.watcher.stop();
    }
    console.log('👋 Goodbye!\n');
    process.exit(0);
  }
}

// Run the CLI
const cli = new AlithNotifyCLI();
cli.start().catch((error) => {
  console.error(`\n❌ Unexpected error: ${error.message}\n`);
  process.exit(1);
});
