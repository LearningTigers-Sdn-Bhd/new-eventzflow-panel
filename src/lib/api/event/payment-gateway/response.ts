export type EventPaymentGateway = {
	id: number;
	provider: string;
	key_id: string;
	has_key_secret: boolean;
	has_webhook_secret: boolean;
	created_at: string;
	updated_at: string;
};

export type EventPaymentGatewayResponse = {
	data: EventPaymentGateway | null;
	payment_gateway_type: "custom" | "default";
};
