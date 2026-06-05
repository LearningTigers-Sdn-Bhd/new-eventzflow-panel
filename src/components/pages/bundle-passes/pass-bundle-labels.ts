import type {
	PassBundlePaymentMode,
	PassBundlePaymentStatus,
	PassBundleStatus,
} from "@/lib/api/pass-bundle";

export const paymentModeLabel: Record<PassBundlePaymentMode, string> = {
	free: "Free",
	pay_offline: "Pay Offline",
};

export const paymentStatusLabel: Record<PassBundlePaymentStatus, string> = {
	not_required: "Not Required",
	unpaid: "Unpaid",
	paid: "Paid",
	sponsored: "Sponsored",
};

export const passBundleStatusLabel: Record<PassBundleStatus, string> = {
	active: "Active",
	paused: "Paused",
};
