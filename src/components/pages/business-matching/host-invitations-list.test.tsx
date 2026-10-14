import { describe, expect, test } from "bun:test";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderToStaticMarkup } from "react-dom/server";
import type { HostInvitationStatus } from "@/lib/api/business-matching";
import HostInvitationsList, {
	AlreadyInvitedWarning,
	LastInviteStatus,
} from "./host-invitations-list";

const deliveryMessage =
	"We couldn't deliver this email. The address may have a typo, may not exist, the recipient's mailbox may be full, or their mail server may be blocking it. Please confirm the address with the recipient, then send again or use another email.";

describe("host invitation delivery guidance", () => {
	for (const Component of [
		HostInvitationsList,
		LastInviteStatus,
		AlreadyInvitedWarning,
	]) {
		for (const [status, message] of [
			["bounced", deliveryMessage],
			["suppressed", deliveryMessage],
			[
				"complained",
				"The recipient marked a previous email as spam. Please use another email.",
			],
			["failed", "We couldn't send this email. Please try sending it again."],
			["queued", null],
			["sending", null],
			["sent", null],
			["delivered", null],
			["skipped", null],
		] as const) {
			test(`${Component.name} shows appropriate guidance for ${status}`, () => {
				const client = new QueryClient();
				client.setQueryData(
					["host-invitations", "event", "session"],
					[
						{
							id: "invite",
							recipient: "host@example.com",
							created_at: "2026-10-14T02:00:00Z",
							status: status satisfies HostInvitationStatus,
							failure_reason: "provider_internal_reason",
						},
					],
				);
				const html = renderToStaticMarkup(
					<QueryClientProvider client={client}>
						<Component
							eventId="event"
							bmEventId="session"
							email=" HOST@example.com "
						/>
					</QueryClientProvider>,
				);
				const text = html.replace(/&#x27;|&#39;/g, "'");
				if (message) expect(text).toContain(message);
				else expect(text).not.toMatch(/Please (confirm|use|try)/);
				expect(text).not.toContain("provider internal reason");
				expect(text).not.toContain("provider_internal_reason");
				client.clear();
			});
		}
	}
});
