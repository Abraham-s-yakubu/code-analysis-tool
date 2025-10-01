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
	if (
		typeof basePrice !== "number" ||
		typeof taxRate !== "number" ||
		typeof discount !== "number"
	) {
		throw new Error("All arguments must be numbers.");
	}
	if (basePrice < 0 || taxRate < 0 || discount < 0 || discount > 1) {
		throw new Error(
			"Price and tax must be non-negative, and discount must be between 0 and 1."
		);
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
		throw new Error("Invalid date provided.");
	}

	const year = date.getFullYear();
	// Pad month and day with a leading zero if they are single-digit
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");

	return `${year}-${month}-${day}`;
}

/**
 * Converts a string into a URL-friendly "slug".
 * This involves making the string lowercase, removing special characters,
 * and replacing spaces with hyphens.
 *
 * @param {string} text The string to convert into a slug.
 * @returns {string} The URL-friendly slug.
 */
export function slugify(text) {
	if (typeof text !== "string") {
		return "";
	}

	return text
		.toString()
		.toLowerCase()
		.trim()
		.replace(/\s+/g, "-") // Replace spaces with -
		.replace(/[^\w\-]+/g, "") // Remove all non-word chars
		.replace(/\-\-+/g, "-") // Replace multiple - with single -
		.replace(/^-+/, "") // Trim - from start of text
		.replace(/-+$/, ""); // Trim - from end of text
}

/**
 * Capitalizes the first letter of a given string.
 *
 * @param {string} text The string to capitalize.
 * @returns {string} The string with the first letter in uppercase.
 */
export function capitalize(text) {
	if (typeof text !== "string" || text.length === 0) {
		return "";
	}
	return text.charAt(0).toUpperCase() + text.slice(1);
}
