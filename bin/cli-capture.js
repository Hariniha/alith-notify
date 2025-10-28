#!/usr/bin/env node

import 'dotenv/config';
import { createOrchestrator } from '../src/orchestrator.js';
import readline from 'readline';

/**
 * New Alith Notify CLI - Captures terminal errors, summarizes, and sends to Copilot
 */
class AlithNotifyNewCLI {
  constructor() {
    this.orchestrator = null;
  }

  /**
   * Displays help information
   */
  showHelp() {
    console.log(`
╔═══════════════════════════════════════════════════════════════╗
║                   ALITH NOTIFY                                ║
║     Capture Errors → Summarize → Auto-Send to Copilot        ║
╚═══════════════════════════════════════════════════════════════╝

Usage:
  npm start              # Start error capture mode
  
How it works:
  1. Captures all terminal errors automatically
  2. Logs them to captured-errors.log
  3. Periodically summarizes using Alith Agent (GPT-4)
  4. Automatically sends to GitHub Copilot Chat for fixes!

Commands while running:
  - Press 'p' to process errors immediately
  - Press 'c' to clear error log
  - Press 'q' to quit

Environment:
  OPENAI_API_KEY    Required - Your OpenAI API key for Alith Agent

Example:
  $env:OPENAI_API_KEY = "sk-your-key-here"
  npm start
    `);
  }

  /**
   * Sets up keyboard input handling
   */
  setupKeyboardInput() {
    readline.emitKeypressEvents(process.stdin);
    
    if (process.stdin.isTTY) {
      process.stdin.setRawMode(true);
    }

    process.stdin.on('keypress', async (str, key) => {
      if (key.ctrl && key.name === 'c') {
        this.shutdown();
        return;
      }

      switch (key.name) {
        case 'q':
          this.shutdown();
          break;
        case 'p':
          console.log('\n🔄 Processing errors now...');
          await this.orchestrator.processNow();
          this.showMenu();
          break;
        case 'c':
          console.log('\n🗑️  Clearing error log manually...');
          this.orchestrator.clearErrors();
          console.log('✅ Error log cleared\n');
          this.showMenu();
          break;
        default:
          break;
      }
    });
  }

  /**
   * Shows the interactive menu
   */
  showMenu() {
    console.log('\n📋 Commands:');
    console.log('   [p] Process errors now');
    console.log('   [c] Clear error log manually');
    console.log('   [q] Quit');
    console.log('\n💡 Note: Errors are auto-cleared after processing');
    console.log();
    console.log('   [q] Quit');
    console.log();
  }

  /**
   * Starts the application
   */
  async start() {
    console.log(`
╔═══════════════════════════════════════════════════════════════╗
║                   ALITH NOTIFY                                ║
║     Capture Errors → Summarize → Auto-Send to Copilot        ║
╚═══════════════════════════════════════════════════════════════╝
`);

    // Check for API key
    if (!process.env.OPENAI_API_KEY) {
      console.error('❌ Error: OPENAI_API_KEY environment variable not set\n');
      console.log('Set it with:');
      console.log('  $env:OPENAI_API_KEY = "sk-your-key-here"\n');
      process.exit(1);
    }

    try {
      // Create orchestrator
      this.orchestrator = createOrchestrator({
        captureLogPath: './captured-errors.log',
        checkInterval: 30, // Check every 30 seconds
        minErrorsToProcess: 1
      });

      // Set up event handlers
      this.setupEventHandlers();

      // Start the orchestrator
      await this.orchestrator.start();

      // Set up keyboard input
      this.setupKeyboardInput();

      console.log('✅ System is now capturing terminal errors\n');
      console.log('💡 How to test:');
      console.log('   1. Open a new terminal');
      console.log('   2. Run commands that produce errors (or: npm run test:errors)');
      console.log('   3. Errors will be captured, summarized, and sent to Copilot!');
      console.log('   4. Check Copilot Chat panel for AI-powered fixes\n');

      this.showMenu();

      // Handle graceful shutdown
      process.on('SIGINT', () => {
        this.shutdown();
      });

      process.on('SIGTERM', () => {
        this.shutdown();
      });

    } catch (error) {
      console.error(`\n❌ Fatal error: ${error.message}\n`);
      process.exit(1);
    }
  }

  /**
   * Sets up event handlers for orchestrator
   */
  setupEventHandlers() {
    this.orchestrator.on('started', () => {
      // Already handled in start()
    });

    this.orchestrator.on('errorsProcessed', (data) => {
      console.log('✅ Errors processed and sent to Copilot!\n');
      console.log(`${'═'.repeat(70)}\n`);
    });

    this.orchestrator.on('stopped', () => {
      // Already handled in shutdown()
    });
  }

  /**
   * Gracefully shuts down the application
   */
  shutdown() {
    console.log('\n\n🛑 Shutting down...');
    
    if (this.orchestrator) {
      this.orchestrator.stop();
    }

    if (process.stdin.isTTY) {
      process.stdin.setRawMode(false);
    }

    console.log('👋 Goodbye!\n');
    process.exit(0);
  }
}

// Run the CLI
const cli = new AlithNotifyNewCLI();
cli.start().catch((error) => {
  console.error(`\n❌ Unexpected error: ${error.message}\n`);
  process.exit(1);
});
