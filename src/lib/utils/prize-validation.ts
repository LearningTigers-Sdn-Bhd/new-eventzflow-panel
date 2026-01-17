/**
 * Prize validation utilities
 * Shared validation logic for prize name and quantity
 */

export interface PrizeValidationResult {
	isValid: boolean;
	error?: string;
}

/**
 * Validates prize name
 */
export function validatePrizeName(name: string): PrizeValidationResult {
	if (!name || !name.trim()) {
		return {
			isValid: false,
			error: "Prize name is required",
		};
	}
	return { isValid: true };
}

/**
 * Validates prize quantity
 */
export function validatePrizeQuantity(quantity: number): PrizeValidationResult {
	if (quantity <= 0) {
		return {
			isValid: false,
			error: "Quantity must be greater than 0",
		};
	}
	return { isValid: true };
}

/**
 * Validates both prize name and quantity
 */
export function validatePrize(
	name: string,
	quantity: number,
): PrizeValidationResult {
	const nameValidation = validatePrizeName(name);
	if (!nameValidation.isValid) {
		return nameValidation;
	}

	const quantityValidation = validatePrizeQuantity(quantity);
	if (!quantityValidation.isValid) {
		return quantityValidation;
	}

	return { isValid: true };
}
