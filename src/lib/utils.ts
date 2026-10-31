import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/** Hides all but the last 4 digits of a phone number; emails and short values pass through. */
export function maskPhone(contact: string): string {
	const digits = contact.replace(/\D/g, "");
	if (contact.includes("@") || digits.length <= 4) return contact;
	return `${"•".repeat(digits.length - 4)}${digits.slice(-4)}`;
}

/**
 * Merges Tailwind class names, resolving any conflicts.
 *
 * @param inputs - An array of class names to merge.
 * @returns A string of merged and optimized class names.
 */
export function cn(...inputs: ClassValue[]): string {
	return twMerge(clsx(inputs));
}
