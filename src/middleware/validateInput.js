const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_REGEX = /^[a-zA-Z0-9_.-]{3,50}$/;
const MIN_PASSWORD_LENGTH = 8;

function validateUUID(paramName) {
  return (req, res, next) => {
    const value = req.params[paramName];
    if (!UUID_REGEX.test(value)) {
      return res.status(400).json({
        success: false,
        message: `Invalid ${paramName} format`,
      });
    }
    next();
  };
}

function validateEmail(email) {
  return typeof email === 'string' && EMAIL_REGEX.test(email);
}

function validateUsername(username) {
  return typeof username === 'string' && USERNAME_REGEX.test(username);
}

function validatePassword(password) {
  return typeof password === 'string' && password.length >= MIN_PASSWORD_LENGTH;
}

module.exports = { validateUUID, validateEmail, validateUsername, validatePassword };
