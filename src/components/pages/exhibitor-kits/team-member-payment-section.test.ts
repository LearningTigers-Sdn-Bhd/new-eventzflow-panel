import { describe, expect, test } from "bun:test";
import {
	getRazorpayRedirectOptions,
	showsPendingGatewayAction,
	usesGatewayPaymentMode,
} from "./team-member-payment-section";

describe("usesGatewayPaymentMode", () => {
	test("returns true for payment_gateway mode", () => {
		expect(usesGatewayPaymentMode("payment_gateway")).toBe(true);
	});

	test("returns false for manual_bank_in mode", () => {
		expect(usesGatewayPaymentMode("manual_bank_in")).toBe(false);
	});

	test("returns false when mode is missing", () => {
		expect(usesGatewayPaymentMode(undefined)).toBe(false);
	});
});

describe("showsPendingGatewayAction", () => {
	test("returns true for pending payment gateway records", () => {
		expect(
			showsPendingGatewayAction({
				status: "pending",
				paymentSource: "payment_gateway",
			}),
		).toBe(true);
	});

	test("returns false for pending manual payments", () => {
		expect(
			showsPendingGatewayAction({
				status: "pending",
				paymentSource: "manual_bank_in",
			}),
		).toBe(false);
	});

	test("returns false for verified gateway payments", () => {
		expect(
			showsPendingGatewayAction({
				status: "verified",
				paymentSource: "payment_gateway",
			}),
		).toBe(false);
	});
});

describe("getRazorpayRedirectOptions", () => {
	test("returns redirect callback settings when callback_url is present", () => {
		expect(
			getRazorpayRedirectOptions({
				payment_id: 1,
				key_id: "rzp_test_key",
				order_id: "order_123",
				amount: 5000,
				currency: "MYR",
				callback_url: "http://localhost:3000/callback",
			}),
		).toEqual({
			callback_url: "http://localhost:3000/callback",
			redirect: true,
		});
	});

	test("returns empty settings when callback_url is missing", () => {
		expect(
			getRazorpayRedirectOptions({
				payment_id: 1,
				key_id: "rzp_test_key",
				order_id: "order_123",
				amount: 5000,
				currency: "MYR",
			}),
		).toEqual({});
	});
});
