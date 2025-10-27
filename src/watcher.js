import fs from 'fs';
import path from 'path';
import { EventEmitter } from 'events';

/**
 * LogWatcher monitors a log file for new content
 */
export class LogWatcher extends EventEmitter {
  constructor(logFilePath, interval = 30) {
    super();
    this.logFilePath = path.resolve(logFilePath);
    this.interval = interval * 1000; // Convert to milliseconds
    this.lastPosition = 0;
    this.lastSize = 0;
    this.timer = null;
    this.isWatching = false;
  }

  /**
   * Starts watching the log file
   */
  async start() {
    if (this.isWatching) {
      console.log('⚠️  Watcher is already running');
      return;
    }

    this.isWatching = true;
    console.log(`👀 Watching log file: ${this.logFilePath}`);
    console.log(`⏱️  Check interval: ${this.interval / 1000} seconds`);

    // Wait for file to exist if it doesn't
    await this.waitForFile();

    // Initialize position
    await this.initializePosition();

    // Start periodic checking
    this.timer = setInterval(() => {
      this.checkForUpdates();
    }, this.interval);

    // Emit ready event
    this.emit('ready', { filePath: this.logFilePath });
  }

  /**
   * Waits for the log file to exist
   */
  async waitForFile() {
    while (!fs.existsSync(this.logFilePath)) {
      console.log(`⏳ Waiting for log file to be created: ${this.logFilePath}`);
      await this.sleep(5000);
    }
    console.log(`✅ Log file found: ${this.logFilePath}`);
  }

  /**
   * Initializes the file position to the current end
   */
  async initializePosition() {
    try {
      const stats = fs.statSync(this.logFilePath);
      this.lastPosition = stats.size;
      this.lastSize = stats.size;
      console.log(`📍 Starting from position: ${this.lastPosition} bytes`);
    } catch (error) {
      console.error(`❌ Error initializing position: ${error.message}`);
      this.lastPosition = 0;
      this.lastSize = 0;
    }
  }

  /**
   * Checks for new content in the log file
   */
  async checkForUpdates() {
    try {
      // Check if file still exists
      if (!fs.existsSync(this.logFilePath)) {
        console.warn('⚠️  Log file no longer exists, waiting for it to be recreated...');
        await this.waitForFile();
        await this.initializePosition();
        return;
      }

      const stats = fs.statSync(this.logFilePath);
      const currentSize = stats.size;

      // Check if file was truncated (rotated)
      if (currentSize < this.lastSize) {
        console.log('🔄 Log file appears to have been rotated, resetting position...');
        this.lastPosition = 0;
        this.lastSize = 0;
      }

      // Check if there's new content
      if (currentSize > this.lastPosition) {
        const newContent = await this.readNewContent(this.lastPosition, currentSize);
        
        if (newContent && newContent.trim().length > 0) {
          const lines = newContent.split('\n').filter(line => line.trim().length > 0);
          console.log(`🆕 New content detected: ${lines.length} new line(s)`);
          
          // Emit update event with new content
          this.emit('update', {
            content: newContent,
            lines: lines,
            startPosition: this.lastPosition,
            endPosition: currentSize,
            timestamp: new Date().toISOString()
          });
        }

        // Update position
        this.lastPosition = currentSize;
        this.lastSize = currentSize;
      }
    } catch (error) {
      console.error(`❌ Error checking for updates: ${error.message}`);
      this.emit('error', error);
    }
  }

  /**
   * Reads new content from the file
   * @param {number} start - Start position
   * @param {number} end - End position
   * @returns {string} New content
   */
  async readNewContent(start, end) {
    return new Promise((resolve, reject) => {
      const stream = fs.createReadStream(this.logFilePath, {
        start: start,
        end: end - 1,
        encoding: 'utf-8'
      });

      let content = '';

      stream.on('data', (chunk) => {
        content += chunk;
      });

      stream.on('end', () => {
        resolve(content);
      });

      stream.on('error', (error) => {
        reject(error);
      });
    });
  }

  /**
   * Stops watching the log file
   */
  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.isWatching = false;
    console.log('🛑 Stopped watching log file');
    this.emit('stopped');
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
 * Creates and returns a new LogWatcher instance
 * @param {string} logFilePath - Path to the log file
 * @param {number} interval - Check interval in seconds
 * @returns {LogWatcher} New watcher instance
 */
export function createWatcher(logFilePath, interval) {
  return new LogWatcher(logFilePath, interval);
}
