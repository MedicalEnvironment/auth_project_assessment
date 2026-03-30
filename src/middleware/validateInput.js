const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const EMAIL_REGEX = /^[a-zA-Z0-9](?:[a-zA-Z0-9._%+-]*[a-zA-Z0-9])?@[a-zA-Z0-9](?:[a-zA-Z0-9.-]*[a-zA-Z0-9])?\.[a-zA-Z]{2,}$/;
const USERNAME_REGEX = /^[a-zA-Z0-9_.-]{3,50}$/;
const FULL_NAME_REGEX = /^[a-zA-Z\s'-]{1,100}$/;
const MOBILE_REGEX = /^\+?[0-9]{7,15}$/;
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
  if (typeof email !== 'string' || !EMAIL_REGEX.test(email)) return false;
  // Reject consecutive dots in local part or domain
  if (email.includes('..')) return false;
  return true;
}

function validateUsername(username) {
  return typeof username === 'string' && USERNAME_REGEX.test(username);
}

function validatePassword(password) {
  if (typeof password !== 'string' || password.length < MIN_PASSWORD_LENGTH) return false;
  if (!/[A-Z]/.test(password)) return false;
  if (!/[a-z]/.test(password)) return false;
  if (!/[0-9]/.test(password)) return false;
  if (!/[^A-Za-z0-9]/.test(password)) return false;
  return true;
}

function validateFullName(name) {
  return typeof name === 'string' && FULL_NAME_REGEX.test(name.trim());
}

function validateMobileNumber(mobile) {
  return typeof mobile === 'string' && MOBILE_REGEX.test(mobile);
}

module.exports = { validateUUID, validateEmail, validateUsername, validatePassword, validateFullName, validateMobileNumber };
