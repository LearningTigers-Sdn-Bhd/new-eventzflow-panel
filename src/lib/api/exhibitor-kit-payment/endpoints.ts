import { restClient } from "@/utils/rest-api";
import {
  type GetExhibitorKitPaymentsRequest,
  type GetExhibitorKitPaymentRequest,
  getExhibitorKitPaymentsSchema,
  getExhibitorKitPaymentSchema,
  type UpdateExhibitorKitPaymentRequest,
  updateExhibitorKitPaymentSchema,
} from "./request";
import type {
  BackendExhibitorKitPayment,
  BackendExhibitorKitItem,
  BackendExhibitorKitPrinting,
  ExhibitorKitPayment,
  ExhibitorKitPaymentItem,
  ExhibitorKitPaymentPrinting,
  UpdateExhibitorKitPaymentResponse,
} from "./response";

// Transform backend item to frontend format
function transformItem(backendItem: BackendExhibitorKitItem): ExhibitorKitPaymentItem {
  return {
    id: backendItem.id,
    exhibitorKitId: backendItem.exhibitor_kit_id,
    rentableItemId: backendItem.rentable_item_id,
    quantity: backendItem.quantity,
    agreedPrice: Number.parseFloat(backendItem.agreed_price),
    notes: backendItem.notes,
    exhibitorKitPaymentId: backendItem.exhibitor_kit_payment_id,
    rentableItem: backendItem.rentable_item
      ? {
          id: backendItem.rentable_item.id,
          name: backendItem.rentable_item.name,
          description: backendItem.rentable_item.description,
          unitOfMeasure: backendItem.rentable_item.unit_of_measure,
          defaultPrice: Number.parseFloat(backendItem.rentable_item.default_price),
        }
      : undefined,
  };
}

// Transform backend printing to frontend format
function transformPrinting(
  backendPrinting: BackendExhibitorKitPrinting
): ExhibitorKitPaymentPrinting {
  return {
    id: backendPrinting.id,
    exhibitorKitId: backendPrinting.exhibitor_kit_id,
    printingServiceId: backendPrinting.printing_service_id,
    quantity: backendPrinting.quantity,
    agreedPrice: Number.parseFloat(backendPrinting.agreed_price),
    fileReference: backendPrinting.file_reference,
    notes: backendPrinting.notes,
    exhibitorKitPaymentId: backendPrinting.exhibitor_kit_payment_id,
    printingService: backendPrinting.printing_service
      ? {
          id: backendPrinting.printing_service.id,
          name: backendPrinting.printing_service.name,
          description: backendPrinting.printing_service.description,
          unitOfMeasure: backendPrinting.printing_service.unit_of_measure,
          defaultPrice: Number.parseFloat(backendPrinting.printing_service.default_price),
        }
      : undefined,
  };
}

// Transform backend payment to frontend format
function transformPayment(
  backendPayment: BackendExhibitorKitPayment
): ExhibitorKitPayment {
  return {
    id: backendPayment.id,
    exhibitorKitId: backendPayment.exhibitor_kit_id,
    payeeId: backendPayment.payee_id,
    payeeName: backendPayment.payee_name,
    amount: Number.parseFloat(backendPayment.amount),
    status: backendPayment.status,
    paymentSource: backendPayment.payment_source,
    paymentProofUrl: backendPayment.payment_proof_url,
    externalRef: backendPayment.external_ref,
    note: backendPayment.note,
    paidAt: backendPayment.paid_at,
    createdAt: backendPayment.created_at,
    updatedAt: backendPayment.updated_at,
    items: backendPayment.exhibitor_kit_items?.map(transformItem),
    printings: backendPayment.exhibitor_kit_printings?.map(transformPrinting),
  };
}

/**
 * Get all payments for an exhibitor kit
 */
export async function getExhibitorKitPayments(
  data: GetExhibitorKitPaymentsRequest
): Promise<ExhibitorKitPayment[]> {
  try {
    const validated = getExhibitorKitPaymentsSchema.parse(data);

    const response = await restClient.get<BackendExhibitorKitPayment[]>(
      `v1/events/${validated.eventId}/exhibitor_kits/${validated.exhibitorKitId}/exhibitor_kit_payments`
    );

    return response.map(transformPayment);
  } catch (error: any) {
    console.error("Error fetching exhibitor kit payments:", error);
    throw new Error(error.message || "Failed to fetch payments");
  }
}

/**
 * Get a single payment
 */
export async function getExhibitorKitPayment(
  data: GetExhibitorKitPaymentRequest
): Promise<ExhibitorKitPayment> {
  try {
    const validated = getExhibitorKitPaymentSchema.parse(data);

    const response = await restClient.get<BackendExhibitorKitPayment>(
      `v1/events/${validated.eventId}/exhibitor_kits/${validated.exhibitorKitId}/exhibitor_kit_payments/${validated.paymentId}`
    );

    return transformPayment(response);
  } catch (error: any) {
    console.error("Error fetching exhibitor kit payment:", error);
    throw new Error(error.message || "Failed to fetch payment");
  }
}

/**
 * Update a payment (submit proof or verify/reject)
 */
export async function updateExhibitorKitPayment(
  data: UpdateExhibitorKitPaymentRequest
): Promise<UpdateExhibitorKitPaymentResponse> {
  try {
    const validated = updateExhibitorKitPaymentSchema.parse(data);
    const { eventId, exhibitorKitId, paymentId, ...updateData } = validated;

    const response = await restClient.patch<BackendExhibitorKitPayment>(
      `v1/events/${eventId}/exhibitor_kits/${exhibitorKitId}/exhibitor_kit_payments/${paymentId}`,
      { exhibitor_kit_payment: updateData }
    );

    return transformPayment(response);
  } catch (error: any) {
    console.error("Error updating exhibitor kit payment:", error);
    throw new Error(error.message || "Failed to update payment");
  }
}

/**
 * Submit payment proof with file upload (Active Storage)
 */
export async function submitPaymentProof(data: {
  eventId: string;
  exhibitorKitId: string;
  paymentId: string;
  paymentProof: File;
  externalRef?: string;
  note?: string;
}): Promise<UpdateExhibitorKitPaymentResponse> {
  try {
    const { eventId, exhibitorKitId, paymentId, paymentProof, externalRef, note } = data;

    const formData = new FormData();
    formData.append("exhibitor_kit_payment[payment_proof]", paymentProof);
    formData.append("exhibitor_kit_payment[payment_source]", "manual_bank_in");
    if (externalRef) {
      formData.append("exhibitor_kit_payment[external_ref]", externalRef);
    }
    if (note) {
      formData.append("exhibitor_kit_payment[note]", note);
    }

    const response = await restClient.patchFormData<BackendExhibitorKitPayment>(
      `v1/events/${eventId}/exhibitor_kits/${exhibitorKitId}/exhibitor_kit_payments/${paymentId}`,
      formData
    );

    return transformPayment(response);
  } catch (error: any) {
    console.error("Error submitting payment proof:", error);
    throw new Error(error.message || "Failed to submit payment proof");
  }
}
