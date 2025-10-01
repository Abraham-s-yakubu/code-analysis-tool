/**
 * Calculates the final price of an item after applying a discount and adding tax.
 * This function ensures that the price does not fall below zero.
 *
 * @param {number} basePrice The initial price of the item before any adjustments.
 * @param {number} taxRate The tax rate to apply, expressed as a decimal (e.g., 0.05 for 5%).
 * @param {number} discount The discount rate to apply, expressed as a decimal (e.g., 0.1 for 10%). Defaults to 0.
 * @returns {number} The final calculated price, rounded to two decimal places.
 */
export function calculatePrice(basePrice, taxRate, discount = 0) {
  if (typeof basePrice !== 'number' || typeof taxRate !== 'number' || typeof discount !== 'number') {
    throw new Error('All arguments must be numbers.');
  }
  if (basePrice < 0 || taxRate < 0 || discount < 0 || discount > 1) {
    throw new Error('Price and tax must be non-negative, and discount must be between 0 and 1.');
  }

  const discountedPrice = basePrice * (1 - discount);
  const finalPrice = discountedPrice * (1 + taxRate);

  // Return the price rounded to 2 decimal places
  return Math.round(finalPrice * 100) / 100;
}

/**
 * Formats a JavaScript Date object into a more readable string format (YYYY-MM-DD).
 *
 * @param {Date} date The Date object to format.
 * @returns {string} The formatted date string (e.g., "2025-10-01").
 */
export function formatDate(date) {
  if (!(date instanceof Date) || isNaN(date)) {
    throw new Error('Invalid date provided.');
  }

  const year = date.getFullYear();
  // Pad month and day with a leading zero if they are single-digit
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

/**
 * Converts a string into a URL-friendly slug.
 * e.g., "My Awesome Post!" becomes "my-awesome-post".
 * @param {string} text The string to convert.
 * @returns {string} The URL-friendly slug.
 */
export function slugify(text) {
    const a = 'àáâäæãåāăąçćčđďèéêëēėęěğǵḧîïíīįìłḿñńǹňôöòóœøōõőṕŕřßśšşșťțûüùúūǘůűųẃẍÿýžźż·/_,:;'
    const b = 'aaaaaaaaaacccddeeeeeeeegghiiiiiilmnnnnoooooooooprrsssssttuuuuuuuuuwxyyzzz------'
    const p = new RegExp(a.split('').join('|'), 'g')

    return text.toString().toLowerCase()
        .replace(/\s+/g, '-') // Replace spaces with -
        .replace(p, c => b.charAt(a.indexOf(c))) // Replace special characters
        .replace(/&/g, '-and-') // Replace & with 'and'
        .replace(/[^\w\-]+/g, '') // Remove all non-word chars
        .replace(/\-\-+/g, '-') // Replace multiple - with single -
        .replace(/^-+/, '') // Trim - from start of text
        .replace(/-+$/, '') // Trim - from end of text
}

/**
 * Capitalizes the first letter of a string.
 * @param {string} text The string to capitalize.
 * @returns {string} The capitalized string.
 */
export function capitalize(text) {
  if (typeof text !== 'string' || text.length === 0) {
    return '';
  }
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/**
 * Generates a random integer between a minimum and maximum value (inclusive).
 *
 * @param {number} min The minimum possible value.
 * @param {number} max The maximum possible value.
 * @returns {number} A random integer within the specified range.
 */
export function generateRandomNumber(min, max) {
  if (typeof min !== 'number' || typeof max !== 'number') {
    throw new Error('Both min and max must be numbers.');
  }
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Truncates a string to a specified length and appends an ellipsis.
 *
 * @param {string} text The string to truncate.
 * @param {number} maxLength The maximum length of the string before truncating.
 * @returns {string} The truncated string with an ellipsis, or the original string if it's shorter than maxLength.
 */
export function truncate(text, maxLength) {
  if (typeof text !== 'string') {
    return '';
  }
  if (text.length <= maxLength) {
    return text;
  }
  return text.slice(0, maxLength) + '...';
}

/**
 * Checks if a given object is empty (has no own properties).
 * @param {object} obj The object to check.
 * @returns {boolean} True if the object is empty, false otherwise.
 */
export function isObjectEmpty(obj) {
  if (obj == null) {
    return true;
  }
  return Object.keys(obj).length === 0 && obj.constructor === Object;
}

/**
 * Parses a URL's query string and returns an object of key-value pairs.
 * @param {string} url The URL to parse.
 * @returns {object} An object containing the query parameters.
 */
export function getQueryParams(url) {
  try {
    const urlObj = new URL(url);
    return Object.fromEntries(urlObj.searchParams.entries());
  } catch (error) {
    console.error("Invalid URL provided:", error);
    return {};
  }
}

/**
 * Creates a debounced function that delays invoking the provided function
 * until after `wait` milliseconds have elapsed since the last time it was invoked.
 * @param {Function} func The function to debounce.
 * @param {number} wait The number of milliseconds to delay.
 * @returns {Function} The new debounced function.
 */
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

