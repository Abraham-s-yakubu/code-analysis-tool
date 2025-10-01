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
