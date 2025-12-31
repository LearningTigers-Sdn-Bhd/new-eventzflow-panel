import { extractErrorMessage } from "@/utils/error-handler";
import { restClient } from "@/utils/rest-api";
import {
	type CreatePaymentDetailRequest,
	type UpdatePaymentDetailRequest,
	createPaymentDetailRequestSchema,
	updatePaymentDetailRequestSchema,
} from "./request";
import {
	type PaymentDetailResponse,
	paymentDetailResponseSchema,
} from "./response";

export async function getPaymentDetail(): Promise<PaymentDetailResponse | null> {
	try {
		const response =
			await restClient.get<PaymentDetailResponse>("v1/payment_detail/me");
		return paymentDetailResponseSchema.parse(response);
	} catch (error) {
		if (error instanceof Error && error.message.includes("404")) {
			return null;
		}
		const errorMessage = await extractErrorMessage(error);
		throw new Error(errorMessage);
	}
}

export async function createPaymentDetail(
	data: CreatePaymentDetailRequest["payment_detail"],
): Promise<PaymentDetailResponse> {
	try {
		const payload = createPaymentDetailRequestSchema.parse({
			payment_detail: data,
		});
		const response = await restClient.post<PaymentDetailResponse>(
			"v1/payment_detail",
			payload,
		);
		return paymentDetailResponseSchema.parse(response);
	} catch (error) {
		const errorMessage = await extractErrorMessage(error);
		throw new Error(errorMessage);
	}
}

export async function updatePaymentDetail(
	data: UpdatePaymentDetailRequest["payment_detail"],
): Promise<PaymentDetailResponse> {
	try {
		const payload = updatePaymentDetailRequestSchema.parse({
			payment_detail: data,
		});
		const response = await restClient.patch<PaymentDetailResponse>(
			"v1/payment_detail",
			payload,
		);
		return paymentDetailResponseSchema.parse(response);
	} catch (error) {
		const errorMessage = await extractErrorMessage(error);
		throw new Error(errorMessage);
	}
}

export async function deletePaymentDetail(): Promise<void> {
	try {
		await restClient.delete("v1/payment_detail");
	} catch (error) {
		const errorMessage = await extractErrorMessage(error);
		throw new Error(errorMessage);
	}
}
