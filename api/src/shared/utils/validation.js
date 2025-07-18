/**
 * Validates email format using regex
 * @param {string} email - Email to validate
 * @returns {boolean} - True if valid email format
 */
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validates password strength
 * Requirements: At least 8 characters, uppercase, lowercase, number, special character
 * @param {string} password - Password to validate
 * @returns {boolean} - True if password meets requirements
 */
const validatePassword = (password) => {
  if (!password || password.length < 8) {
    return false;
  }

  // Check for uppercase letter
  if (!/[A-Z]/.test(password)) {
    return false;
  }

  // Check for lowercase letter
  if (!/[a-z]/.test(password)) {
    return false;
  }

  // Check for number
  if (!/\d/.test(password)) {
    return false;
  }

  // Check for special character
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return false;
  }

  return true;
};

/**
 * Validates phone number format
 * @param {string} phone - Phone number to validate
 * @returns {boolean} - True if valid phone format
 */
const validatePhone = (phone) => {
  if (!phone) return true; // Phone is optional
  
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Check if it's a valid length (10-15 digits)
  return cleaned.length >= 10 && cleaned.length <= 15;
};

/**
 * Validates URL format
 * @param {string} url - URL to validate
 * @returns {boolean} - True if valid URL format
 */
const validateUrl = (url) => {
  if (!url) return true; // URL is optional
  
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Validates that a string is not empty and within length limits
 * @param {string} str - String to validate
 * @param {number} minLength - Minimum length (default: 1)
 * @param {number} maxLength - Maximum length (default: 255)
 * @returns {boolean} - True if valid
 */
const validateString = (str, minLength = 1, maxLength = 255) => {
  if (!str || typeof str !== 'string') {
    return false;
  }
  
  const trimmed = str.trim();
  return trimmed.length >= minLength && trimmed.length <= maxLength;
};

/**
 * Validates company name
 * @param {string} name - Company name to validate
 * @returns {boolean} - True if valid
 */
const validateCompanyName = (name) => {
  return validateString(name, 2, 100);
};

/**
 * Validates person name (first/last name)
 * @param {string} name - Name to validate
 * @returns {boolean} - True if valid
 */
const validatePersonName = (name) => {
  return validateString(name, 1, 50);
};

module.exports = {
  validateEmail,
  validatePassword,
  validatePhone,
  validateUrl,
  validateString,
  validateCompanyName,
  validatePersonName,
};