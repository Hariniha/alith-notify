import fs from 'fs';
import path from 'path';

/**
 * ErrorCapture - Captures terminal errors and logs them to a file
 */
export class ErrorCapture {
  constructor(options = {}) {
    this.logFilePath = options.logFilePath || './captured-errors.log';
    this.captureStderr = options.captureStderr !== false;
    this.captureUncaught = options.captureUncaught !== false;
    this.captureRejections = options.captureRejections !== false;
    this.originalStderrWrite = null;
    this.originalConsoleError = null;
  }

  /**
   * Starts capturing errors from terminal
   */
  start() {
    console.log(`📝 Starting error capture to: ${this.logFilePath}`);

    // Ensure log file directory exists
    const dir = path.dirname(this.logFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Create/clear log file
    if (!fs.existsSync(this.logFilePath)) {
      fs.writeFileSync(this.logFilePath, '');
    }

    // Capture stderr
    if (this.captureStderr) {
      this.originalStderrWrite = process.stderr.write;
      const self = this;
      
      process.stderr.write = function(chunk, encoding, callback) {
        self.logError(`[STDERR] ${chunk.toString()}`);
        return self.originalStderrWrite.apply(process.stderr, arguments);
      };
    }

    // Capture console.error
    this.originalConsoleError = console.error;
    const self = this;
    
    console.error = function(...args) {
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ');
      self.logError(`[CONSOLE.ERROR] ${message}`);
      return self.originalConsoleError.apply(console, args);
    };

    // Capture uncaught exceptions
    if (this.captureUncaught) {
      process.on('uncaughtException', (error) => {
        this.logError(`[UNCAUGHT EXCEPTION] ${error.stack || error.message}`);
      });
    }

    // Capture unhandled rejections
    if (this.captureRejections) {
      process.on('unhandledRejection', (reason, promise) => {
        this.logError(`[UNHANDLED REJECTION] ${reason?.stack || reason}`);
      });
    }

    console.log('✅ Error capture started');
  }

  /**
   * Logs an error to the file
   * @param {string} message - Error message
   */
  logError(message) {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${message}\n`;
    
    try {
      fs.appendFileSync(this.logFilePath, logEntry, 'utf-8');
    } catch (err) {
      // Fallback to original console if logging fails
      if (this.originalConsoleError) {
        this.originalConsoleError('Failed to write to error log:', err.message);
      }
    }
  }

  /**
   * Reads all captured errors
   * @returns {string} All captured errors
   */
  readErrors() {
    if (!fs.existsSync(this.logFilePath)) {
      return '';
    }
    return fs.readFileSync(this.logFilePath, 'utf-8');
  }

  /**
   * Clears the error log
   */
  clearErrors() {
    if (fs.existsSync(this.logFilePath)) {
      fs.writeFileSync(this.logFilePath, '');
      console.log('🗑️  Error log cleared');
    }
  }

  /**
   * Stops capturing errors
   */
  stop() {
    if (this.originalStderrWrite) {
      process.stderr.write = this.originalStderrWrite;
    }
    if (this.originalConsoleError) {
      console.error = this.originalConsoleError;
    }
    console.log('🛑 Error capture stopped');
  }
}

/**
 * Creates and returns a new ErrorCapture instance
 * @param {object} options - Configuration options
 * @returns {ErrorCapture} New error capture instance
 */
export function createErrorCapture(options) {
  return new ErrorCapture(options);
}
