/**
 * CopilotIntegration - Sends summarized errors directly to GitHub Copilot Chat
 */
export class CopilotIntegration {
  constructor(options = {}) {
    this.autoOpen = options.autoOpen !== false;
  }

  /**
   * Sends error summary directly to Copilot Chat
   * @param {string} summary - Error summary from Alith Agent
   * @param {string} originalErrors - Original error logs
   * @returns {Promise<void>}
   */
  async sendToCopilot(summary, originalErrors) {
    console.log('🤖 Sending directly to GitHub Copilot Chat...');

    const prompt = this.buildPrompt(summary, originalErrors);

    try {
      // Try to use VS Code extension API to open Copilot Chat
      // This will work if running inside VS Code
      const vscode = await this.getVSCodeAPI();
      
      if (vscode) {
        // Open Copilot Chat with the prompt
        await vscode.commands.executeCommand('workbench.panel.chat.view.copilot.focus');
        
        // Small delay to ensure chat is open
        await this.sleep(500);
        
        // Send the prompt to chat input
        await vscode.commands.executeCommand('workbench.action.chat.open', {
          query: prompt
        });

        console.log('✅ Successfully sent to GitHub Copilot Chat!');
        console.log('💡 Check the Copilot Chat panel for AI-powered fixes\n');
      } else {
        // Fallback: Show instructions to copy manually
        this.showManualInstructions(prompt);
      }
    } catch (error) {
      console.log('⚠️  Could not auto-send to Copilot (running outside VS Code)');
      this.showManualInstructions(prompt);
    }
  }

  /**
   * Attempts to get VS Code API (only works when running in VS Code integrated terminal)
   * @returns {Promise<any>} VS Code API or null
   */
  async getVSCodeAPI() {
    try {
      // Check if we're running in VS Code's integrated terminal
      if (process.env.VSCODE_IPC_HOOK_CLI || process.env.TERM_PROGRAM === 'vscode') {
        // We're in VS Code, try to use the CLI to execute commands
        return null; // For now, return null and use manual method
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Shows manual instructions with copyable prompt
   * @param {string} prompt - The prompt to display
   */
  showManualInstructions(prompt) {
    console.log('\n📋 GITHUB COPILOT PROMPT:');
    console.log('═'.repeat(70));
    console.log(prompt);
    console.log('═'.repeat(70));
    console.log('\n💡 TO USE WITH COPILOT:');
    console.log('1. Copy the prompt above (select and Ctrl+C)');
    console.log('2. Open GitHub Copilot Chat (Ctrl+Alt+I or Cmd+Shift+I)');
    console.log('3. Paste the prompt (Ctrl+V)');
    console.log('4. Press Enter and let Copilot fix the issues!\n');
  }

  /**
   * Builds a prompt for Copilot
   * @param {string} summary - Error summary
   * @param {string} originalErrors - Original errors
   * @returns {string} Formatted prompt
   */
  buildPrompt(summary, originalErrors) {
    return `# Fix These Terminal Errors

I captured errors from my terminal and used AI to summarize them. Please help me fix these issues.

## AI-Generated Summary (from Alith Agent)
${summary}

## Original Error Logs
\`\`\`
${originalErrors.substring(0, 2000)}${originalErrors.length > 2000 ? '\n... (truncated)' : ''}
\`\`\`

## What I Need
1. **Root Cause Analysis**: What's causing these errors?
2. **Specific Fixes**: Which files need to be modified?
3. **Code Changes**: Show me the exact code changes needed
4. **Step-by-Step**: Guide me through fixing this

Please be specific and actionable. If you need to see more code, let me know which files.`;
  }

  /**
   * Helper to sleep
   * @param {number} ms - Milliseconds
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Creates and returns a new CopilotIntegration instance
 * @param {object} options - Configuration options
 * @returns {CopilotIntegration} New copilot integration instance
 */
export function createCopilotIntegration(options) {
  return new CopilotIntegration(options);
}
