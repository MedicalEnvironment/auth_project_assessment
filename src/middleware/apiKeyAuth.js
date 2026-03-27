const APIKeyModel = require('../models/apiKeyModel');
const logger = require('../config/logger');

// Get client IP from request (take first address if x-forwarded-for contains a chain)
function getClientIP(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return req.socket.remoteAddress || 'Unknown';
}

const apiKeyAuth = async (req, res, next) => {
  // Get API key from header
  const apiKey = req.headers['x-api-key'];

  if (!apiKey) {
    logger.error(
      getClientIP(req),
      'Unknown',
      req.path,
      {}, // Avoid logging headers (may contain secrets)
      'Missing API key'
    );
    return res.status(401).json({
      success: false,
      message: 'API key is required'
    });
  }

  try {
    // Verify API key
    const keyData = await APIKeyModel.getAPIKey(apiKey);

    if (!keyData) {
      logger.error(
        getClientIP(req),
        'Unknown',
        req.path,
        { apiKey: apiKey.substring(0, 8) + '...' },
        'Invalid API key'
      );
      return res.status(401).json({
        success: false,
        message: 'Invalid API key'
      });
    }

    if (!keyData.is_active) {
      logger.error(
        getClientIP(req),
        keyData.client_name,
        req.path,
        { apiKey: apiKey.substring(0, 8) + '...' },
        'API key is inactive'
      );
      return res.status(401).json({
        success: false,
        message: 'API key is inactive'
      });
    }

    // Update last used
    await APIKeyModel.updateLastUsed(apiKey);

    // Attach only non-sensitive API key metadata to request
    req.apiKey = {
      clientName: keyData.client_name,
      clientIP: getClientIP(req)
    };

    next();
  } catch (error) {
    logger.error(
      getClientIP(req),
      'Unknown',
      req.path,
      { error: error.message },
      'API key verification error'
    );
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = apiKeyAuth;
