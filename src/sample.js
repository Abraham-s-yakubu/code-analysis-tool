/**
 * Sample JavaScript file to test the living documentation system
 */

/**
 * Calculate the area of a rectangle with validation
 * Now includes input validation for better error handling
 */
export function calculateArea(length, width) {
    if (typeof length !== 'number' || typeof width !== 'number') {
        throw new Error('Both length and width must be numbers');
    }
    if (length < 0 || width < 0) {
        throw new Error('Length and width must be positive numbers');
    }
    return length * width;
}

/**
 * Format a user's full name
 */
export function formatUserName(firstName, lastName) {
    return `${firstName} ${lastName}`;
}

/**
 * Async function to fetch user data
 */
export async function fetchUserData(userId) {
    // Simulate API call
    return new Promise(resolve => {
        setTimeout(() => {
            resolve({ id: userId, name: 'John Doe', email: 'john@example.com' });
        }, 1000);
    });
}

/**
 * Utility class for string operations
 */
export class StringUtils {
    static capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
    
    static reverse(str) {
        return str.split('').reverse().join('');
    }
}