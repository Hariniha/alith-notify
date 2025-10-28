/**
 * Alith Notify - Main entry point
 * Capture terminal errors, summarize with AI, and send to Copilot for fixing
 */

export { loadConfig, createDefaultConfig } from './config.js';
export { Summarizer, createSummarizer } from './summarizer.js';
export { ErrorCapture, createErrorCapture } from './error-capture.js';
export { ErrorOrchestrator, createOrchestrator } from './orchestrator.js';
export { CopilotIntegration, createCopilotIntegration } from './copilot-integration.js';
