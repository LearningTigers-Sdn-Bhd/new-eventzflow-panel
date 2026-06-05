import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
	return {
		name: "EventzFlow Panel",
		short_name: "EventzFlow",
		description:
			"EventzFlow - Manage events, scan tickets, and track attendance",
		start_url: "/",
		display: "standalone",
		background_color: "#ffffff",
		theme_color: "#000000",
		icons: [
			{
				src: "/favicon/kaamatan-logo.png",
				sizes: "192x192",
				type: "image/png",
			},
			{
				src: "/favicon/kaamatan-logo.png",
				sizes: "512x512",
				type: "image/png",
			},
		],
	};
}
