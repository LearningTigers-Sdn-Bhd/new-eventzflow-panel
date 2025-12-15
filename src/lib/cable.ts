import { createConsumer } from "@rails/actioncable";
import { API_BASE_URL } from "@/utils/rest-api";

// Derive WebSocket URL from API_BASE_URL
const getWebSocketUrl = () => {
	const apiUrl = API_BASE_URL;
	// Replace http/https with ws/wss
	const wsUrl = apiUrl.replace(/^http/, "ws");
	// Ensure it ends with /cable
	return `${wsUrl}/cable`;
};

export const cable = createConsumer(getWebSocketUrl());
