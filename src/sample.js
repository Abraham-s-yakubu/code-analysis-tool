/**
 * Sample JavaScript file to test the living documentation system
 */

/**
 * Calculate the area of a rectangle
 */
export function addThreeNumber(a, b, c) {
    return a+b+c;
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