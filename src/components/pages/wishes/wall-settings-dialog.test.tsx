import { describe, expect, mock, test } from "bun:test";
import { readFileSync } from "node:fs";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";

type MockChildrenProps = {
	children?: ReactNode;
};

type MockAnchorProps = MockChildrenProps &
	Omit<ComponentPropsWithoutRef<"a">, "children">;

type MockButtonProps = MockChildrenProps & {
	asChild?: boolean;
} & Omit<ComponentPropsWithoutRef<"button">, "children">;

type MockSpanProps = MockChildrenProps &
	Omit<ComponentPropsWithoutRef<"span">, "children">;

type MockValueProps = {
	placeholder?: string;
};

type MockSelectItemProps = MockChildrenProps & {
	value: string;
};

mock.module("@tanstack/react-query", () => ({
	useMutation: () => ({
		mutate: () => {},
		isPending: false,
	}),
	useQueryClient: () => ({
		invalidateQueries: async () => {},
	}),
}));

mock.module("next/link", () => ({
	default: ({ children, href, ...props }: MockAnchorProps) => (
		<a href={href} {...props}>
			{children}
		</a>
	),
}));

mock.module("lucide-react", () => ({
	MonitorPlay: () => <svg aria-hidden="true" />,
}));

mock.module("sonner", () => ({
	toast: {
		success: () => {},
		error: () => {},
	},
}));

mock.module("@/utils/rest-api", () => ({
	API_BASE_URL: "http://localhost:3000",
	restClient: {
		patchFormData: async () => ({}),
	},
}));

mock.module("@/components/file-upload/image-upload", () => ({
	default: ({ value }: { value?: string | File }) => (
		<div data-testid="mock-image-upload">
			{value instanceof File ? value.name : value || "empty"}
		</div>
	),
}));

mock.module("@/components/ui/button", () => ({
	Button: ({ children, asChild, ...props }: MockButtonProps) => {
		if (asChild) return children;
		return <button {...props}>{children}</button>;
	},
}));

mock.module("@/components/ui/label", () => ({
	Label: ({ children, ...props }: MockSpanProps) => (
		<span {...props}>{children}</span>
	),
}));

mock.module("@/components/ui/select", () => ({
	Select: ({ children }: MockChildrenProps) => <div>{children}</div>,
	SelectContent: ({ children }: MockChildrenProps) => <div>{children}</div>,
	SelectItem: ({ children, value }: MockSelectItemProps) => (
		<div data-value={value}>{children}</div>
	),
	SelectTrigger: ({ children, ...props }: MockSpanProps) => (
		<div {...props}>{children}</div>
	),
	SelectValue: ({ placeholder }: MockValueProps) => <span>{placeholder}</span>,
}));

mock.module("next/font/google", () => ({
	Great_Vibes: () => ({ className: "great-vibes" }),
}));

describe("WishWallSettingsDialogContent", () => {
	test("renders style controls and preview using the event title", async () => {
		const { WishWallSettingsDialogContent } = await import(
			"./wall-settings-dialog"
		);

		const html = renderToStaticMarkup(
			<WishWallSettingsDialogContent
				eventId="1"
				event={{
					id: 1,
					title: "Aisyah & Faiz",
					slug: "aisyah-faiz",
					description: null,
					status: "published",
					visibility: true,
					multiple_scans: false,
					use_ticket: false,
					use_wedding: true,
					auto_approve_wishes: true,
					extra_guest_limit: null,
					use_seat_ticketing: false,
					use_exhibitor_kit: false,
					allow_contractor_printing_services: false,
					use_business_matching: false,
					use_sponsorship: false,
					use_event_leads: false,
					payment_receipt_email: null,
					event_email_setting: null,
					wish_wall_setting: {
						display_mode: "animation",
						animation_shape: "heart",
						animation_text: null,
						accent_color: "#AA7744",
						header_text_color: "#221A14",
						card_background_color: "#FFF7ED",
						background_image_url: "https://cdn.example.com/wall.webp",
					},
					start_date: "2026-03-17T00:00:00.000Z",
					end_date: "2026-03-17T01:00:00.000Z",
					webhook_url: null,
					business_matching_webhook_url: null,
					labels_data: {},
					booth_types: [],
					payment_status: "paid",
					price: "0.0",
					published: true,
					created_at: "2026-03-17T00:00:00.000Z",
					updated_at: "2026-03-17T00:00:00.000Z",
					deleted_at: null,
					logo_url: null,
				}}
			/>,
		);

		expect(html).toContain("Accent color");
		expect(html).toContain("Header text color");
		expect(html).toContain("Card background color");
		expect(html).toContain("Background image");
		expect(html).toContain("Champagne Gold");
		expect(html).toContain("Romantic Rose");
		expect(html).toContain("Mulberry Bloom");
		expect(html).toContain("Velvet Red");
		expect(html).toContain("Warm Charcoal");
		expect(html).toContain("Soft Ivory");
		expect(html).toContain("Aisyah &amp; Faiz");
		expect(html).toContain("Open Live Wall");
	});

	test("keeps the current animation presets and no dialog wrapper primitives", () => {
		const content = readFileSync(
			new URL("./wall-settings-dialog.tsx", import.meta.url),
			"utf8",
		);

		expect(content).toContain("Heart");
		expect(content).toContain("Infinity");
		expect(content).toContain("Butterfly");
		expect(content).not.toContain('{displayMode === "cards" ? (');
		expect(content).toContain("DEFAULT_ACCENT_COLOR");
		expect(content).toContain("DEFAULT_HEADER_TEXT_COLOR");
		expect(content).toContain("DEFAULT_CARD_BACKGROUND_COLOR");
		expect(content).toContain("ImageUpload");
		expect(content).not.toContain("<DialogContent");
		expect(content).not.toContain("<DialogHeader");
	});
});
