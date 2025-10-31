/**
 * Phone number utility functions
 * Handles phone number cleaning, formatting, and normalization
 * Works globally with any country's phone number format
 */

/**
 * Clean phone number by removing all non-digit characters except the leading +
 * @param phoneNumber - Raw phone number input
 * @returns Cleaned phone number with only digits and optional leading +
 * @example
 * cleanPhoneNumber("+60 12-345 6789") // "+60123456789"
 * cleanPhoneNumber("+1 (945) 487-5001") // "+19454875001"
 * cleanPhoneNumber("012-345 6789") // "0123456789"
 */
export function cleanPhoneNumber(phoneNumber: string): string {
	if (!phoneNumber) return "";
	// Remove all non-digit characters except the leading +
	return phoneNumber.replace(/[^\d+]/g, "");
}

/**
 * Add standard spacing to phone number for better readability
 * Formats as: +XX XX XXXX XXXX (groups of 2-4 digits)
 * @param phoneNumber - Phone number to format (can be formatted or unformatted)
 * @returns Formatted phone number with spacing
 * @example
 * formatPhoneNumber("+60123456789") // "+60 12 345 6789"
 * formatPhoneNumber("+19454875001") // "+1 945 487 5001"
 * formatPhoneNumber("0123456789") // "012 345 6789"
 */
export function formatPhoneNumber(phoneNumber: string): string {
	if (!phoneNumber) return "";
	
	const cleaned = cleanPhoneNumber(phoneNumber);
	
	// If it has country code (+), format it
	if (cleaned.startsWith("+")) {
		// Extract country code (1-3 digits after +)
		const match = cleaned.match(/^(\+\d{1,3})(\d+)$/);
		if (match) {
			const countryCode = match[1];
			const number = match[2];
			
			// Split number into groups for readability
			// Common pattern: XX XXX XXXX or similar
			const formatted = number.match(/.{1,4}/g)?.join(" ") || number;
			return `${countryCode} ${formatted}`;
		}
	}
	
	// For local numbers without country code, just add spacing
	const formatted = cleaned.match(/.{1,4}/g)?.join(" ") || cleaned;
	return formatted;
}

/**
 * Add country-specific formatting based on detected country code
 * @param phoneNumber - Phone number to format
 * @returns Formatted phone number with country-specific format
 * @example
 * formatWithCountryStyle("+60123456789") // "+60 12-345 6789" (Malaysia)
 * formatWithCountryStyle("+19454875001") // "+1 (945) 487-5001" (US)
 */
export function formatWithCountryStyle(phoneNumber: string): string {
	if (!phoneNumber) return "";
	
	const cleaned = cleanPhoneNumber(phoneNumber);
	
	// Malaysian format: +60 XX-XXX XXXX
	let match = cleaned.match(/^\+?60(\d{2})(\d{3,4})(\d{4})$/);
	if (match) {
		return `+60 ${match[1]}-${match[2]} ${match[3]}`;
	}
	
	// US/Canada format: +1 (XXX) XXX-XXXX
	match = cleaned.match(/^\+?1(\d{3})(\d{3})(\d{4})$/);
	if (match) {
		return `+1 (${match[1]}) ${match[2]}-${match[3]}`;
	}
	
	// UK format: +44 XXXX XXXXXX
	match = cleaned.match(/^\+?44(\d{4})(\d{6})$/);
	if (match) {
		return `+44 ${match[1]} ${match[2]}`;
	}
	
	// Singapore format: +65 XXXX XXXX
	match = cleaned.match(/^\+?65(\d{4})(\d{4})$/);
	if (match) {
		return `+65 ${match[1]} ${match[2]}`;
	}
	
	// Australia format: +61 XXX XXX XXX
	match = cleaned.match(/^\+?61(\d{3})(\d{3})(\d{3})$/);
	if (match) {
		return `+61 ${match[1]} ${match[2]} ${match[3]}`;
	}
	
	// Default: use generic formatting
	return formatPhoneNumber(phoneNumber);
}

/**
 * Validate if a phone number has a valid format (basic check)
 * @param phoneNumber - Phone number to validate
 * @returns True if valid phone number format, false otherwise
 * @example
 * isValidPhoneNumber("+60123456789") // true
 * isValidPhoneNumber("+19454875001") // true
 * isValidPhoneNumber("123") // false
 */
export function isValidPhoneNumber(phoneNumber: string): boolean {
	if (!phoneNumber) return false;
	
	const cleaned = cleanPhoneNumber(phoneNumber);
	
	// Valid phone: At least 7 digits, optionally with + at start
	return /^\+?\d{7,15}$/.test(cleaned);
}

/**
 * Get multiple format variations of a phone number
 * Useful for fallback searches when exact format is unknown
 * @param phoneNumber - Phone number to get variations for
 * @returns Array of phone number variations
 * @example
 * getPhoneVariations("0123456789")
 * // ["+60123456789", "+60 12-345 6789", "0123456789"]
 */
export function getPhoneVariations(phoneNumber: string): string[] {
	if (!phoneNumber) return [];
	
	const cleaned = cleanPhoneNumber(phoneNumber);
	const formatted = formatPhoneNumber(phoneNumber);
	const countryStyled = formatWithCountryStyle(phoneNumber);
	
	// Return unique variations
	const variations = [cleaned, formatted, countryStyled];
	return [...new Set(variations)].filter(Boolean);
}
