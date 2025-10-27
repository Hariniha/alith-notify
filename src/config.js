import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Reads and validates the configuration file
 * @param {string} configPath - Path to the config file
 * @returns {object} Validated configuration object
 */
export async function loadConfig(configPath) {
  try {
    // Resolve absolute path
    const absolutePath = path.resolve(configPath);
    
    // Check if file exists
    if (!fs.existsSync(absolutePath)) {
      throw new Error(`Configuration file not found: ${absolutePath}`);
    }

    // Read and parse JSON
    const configContent = fs.readFileSync(absolutePath, 'utf-8');
    const config = JSON.parse(configContent);

    // Validate required fields
    validateConfig(config);

    return config;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error(`Invalid JSON in configuration file: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Validates the configuration object
 * @param {object} config - Configuration object to validate
 */
function validateConfig(config) {
  const requiredFields = [
    'logFile'
  ];

  const missingFields = requiredFields.filter(field => !config[field]);

  if (missingFields.length > 0) {
    throw new Error(
      `Missing required configuration fields: ${missingFields.join(', ')}`
    );
  }

  // Validate interval (optional, default to 30 seconds)
  if (config.interval && (typeof config.interval !== 'number' || config.interval < 1)) {
    throw new Error('Interval must be a positive number (in seconds)');
  }

  // Set defaults
  config.interval = config.interval || 30;

  // Validate log file exists
  const logFilePath = path.resolve(config.logFile);
  if (!fs.existsSync(logFilePath)) {
    console.warn(`⚠️  Warning: Log file does not exist yet: ${logFilePath}`);
    console.warn('   The watcher will wait for the file to be created.');
  }
}

/**
 * Creates a default configuration file
 * @param {string} outputPath - Path where to create the config file
 */
export function createDefaultConfig(outputPath = './alith.config.json') {
  const defaultConfig = {
    logFile: './server.log',
    interval: 30
  };

  fs.writeFileSync(
    outputPath,
    JSON.stringify(defaultConfig, null, 2),
    'utf-8'
  );

  console.log(`✅ Created default configuration file: ${outputPath}`);
}
