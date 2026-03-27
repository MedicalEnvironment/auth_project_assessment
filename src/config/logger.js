const fs = require('fs');
const path = require('path');
const os = require('os');

const logsDir = path.join(__dirname, '../logs');

// Sanitize sensitive data from logs.
// Goal: ensure plaintext passwords and API keys never end up in daily log files.
function sanitizeData(value, depth = 0) {
  const REDACT_KEY_RE = /(password|passphrase|api[-_ ]?key|x[-_ ]?api[-_ ]?key|authorization|bearer|token|secret)/i;
  const MAX_DEPTH = 6;
  const MAX_ARRAY_LEN = 25;
  const MAX_STRING_LEN = 500;

  if (value === null || value === undefined) return value;
  if (depth > MAX_DEPTH) return '[TRUNCATED]';

  if (Array.isArray(value)) {
    return value.slice(0, MAX_ARRAY_LEN).map(v => sanitizeData(v, depth + 1));
  }

  if (typeof value === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(value)) {
      if (REDACT_KEY_RE.test(k)) out[k] = '[REDACTED]';
      else out[k] = sanitizeData(v, depth + 1);
    }
    return out;
  }

  if (typeof value === 'string') {
    if (value.length > MAX_STRING_LEN) return value.slice(0, MAX_STRING_LEN) + '...[TRUNCATED]';
    return value;
  }

  return value;
}

// Ensure logs directory exists
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Get current date in YYYY-MM-DD format
function getLogFileName() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}.log`;
}

// Get current time in HH:MM:SS format
function getCurrentTime() {
  const date = new Date();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
}

class Logger {
  constructor() {
    this.hostname = os.hostname();
  }

  formatLog(logLevel, clientIP, clientName, apiMethod, params, message) {
    const timestamp = getCurrentTime();
    const sanitizedParams = sanitizeData(params);
    const logEntry = {
      timestamp,
      logLevel,
      clientIP,
      clientName: clientName || 'Unknown',
      hostname: this.hostname,
      apiMethod,
      params: JSON.stringify(sanitizedParams),
      message
    };
    return JSON.stringify(logEntry);
  }

  log(logLevel, clientIP, clientName, apiMethod, params, message) {
    const logFileName = getLogFileName();
    const logFilePath = path.join(logsDir, logFileName);
    const logMessage = this.formatLog(logLevel, clientIP, clientName, apiMethod, params, message);

    try {
      fs.appendFileSync(logFilePath, logMessage + '\n');
    } catch (err) {
      // Don't crash the request handler if logging fails.
      console.error('Error writing to log file:', err);
    }

    // Also log to console
    console.log(logMessage);
  }

  info(clientIP, clientName, apiMethod, params, message) {
    this.log('INFO', clientIP, clientName, apiMethod, params, message);
  }

  error(clientIP, clientName, apiMethod, params, message) {
    this.log('ERROR', clientIP, clientName, apiMethod, params, message);
  }
}

module.exports = new Logger();
