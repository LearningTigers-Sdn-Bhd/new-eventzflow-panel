/**
 * Payment status constants and utility functions for pending tickets
 */

export const PAYMENT_STATUS = {
	PENDING: 0,
	PAID: 1,
	FAILED: 2,
	REFUNDED_PAYMENT: 3,
} as const;

export type PaymentStatusValue = (typeof PAYMENT_STATUS)[keyof typeof PAYMENT_STATUS];

export type PaymentStatusString = "pending" | "paid" | "completed" | "failed" | "refunded_payment" | "approval_pending" | "rejected";

/**
 * Maps string payment status to numeric value
 */
export function getPaymentStatusNumber(status: PaymentStatusString): number {
	const mapping: Record<PaymentStatusString, number> = {
		pending: PAYMENT_STATUS.PENDING,
		paid: PAYMENT_STATUS.PAID,
		completed: PAYMENT_STATUS.PAID, // Backwards compatibility
		failed: PAYMENT_STATUS.FAILED,
		refunded_payment: PAYMENT_STATUS.REFUNDED_PAYMENT,
		rejected: PAYMENT_STATUS.REFUNDED_PAYMENT, // Backwards compatibility
		approval_pending: PAYMENT_STATUS.PENDING, // Backwards compatibility
	};
	return mapping[status] ?? PAYMENT_STATUS.PENDING;
}

/**
 * Returns the display text for a payment status
 */
export function getPaymentStatusText(status: PaymentStatusString): string {
	const mapping: Record<PaymentStatusString, string> = {
		paid: "Paid",
		pending: "Pending",
		completed: "Completed",
		failed: "Failed",
		refunded_payment: "Refunded Payment",
		approval_pending: "Approval Pending",
		rejected: "Rejected",
	};
	return mapping[status] ?? status;
}

/**
 * Returns the color classes for a payment status badge
 */
export function getPaymentStatusColor(status: PaymentStatusString): string {
	const mapping: Record<PaymentStatusString, string> = {
		paid: "bg-green-100 text-green-800 hover:bg-green-100",
		completed: "bg-green-100 text-green-800 hover:bg-green-100",
		pending: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
		failed: "bg-red-100 text-red-800 hover:bg-red-100",
		refunded_payment: "bg-gray-100 text-gray-800 hover:bg-gray-100",
		approval_pending: "bg-blue-100 text-blue-800 hover:bg-blue-100",
		rejected: "bg-gray-100 text-gray-800 hover:bg-gray-100",
	};
	return mapping[status] ?? "bg-gray-100 text-gray-800 hover:bg-gray-100";
}

/**
 * Formats ticket price for display
 */
export function formatTicketPrice(value: number | string): string {
	const price = typeof value === "number" ? value : Number(value) || 0;
	return `RM${price.toFixed(2)}`;
}

/**
 * Custom field limit
 */
export const MAX_CUSTOM_FIELDS = 10;
