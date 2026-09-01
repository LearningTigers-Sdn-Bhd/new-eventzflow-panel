import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

// Origin that serves uploaded assets (Active Storage blobs, media, etc.). The
// panel and API run on different origins (e.g. :3001 vs :3000), so 'self' and
// the https: scheme alone don't cover API-hosted files — especially in dev
// where the API is plain http. Allow it explicitly for img/media/connect.
const apiOrigin = (
	process.env.NEXT_PUBLIC_API_URL ?? (isDev ? "http://localhost:3000" : "")
).replace(/\/$/, "");
const assetSources = ["'self'", "data:", "blob:", "https:", apiOrigin]
	.filter(Boolean)
	.join(" ");

// Content-Security-Policy.
// Note: 'unsafe-inline'/'unsafe-eval' are required by Next.js runtime + a few
// vendor libs. Kept as tight as the current stack allows; tighten further
// (nonces) in the Phase-3 hardening pass.
const csp = [
	"default-src 'self'",
	`script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
	"style-src 'self' 'unsafe-inline'",
	`img-src ${assetSources}`,
	"font-src 'self' data:",
	`connect-src 'self' ${apiOrigin} https: wss:${
		isDev ? " http://localhost:* ws://localhost:*" : ""
	}`.trim(),
	`media-src ${assetSources}`,
	"worker-src 'self' blob:",
	// Allow blob: documents (PDF previews) to render in an <iframe>, plus the
	// hosted Notion help embed. Object/embed stays blocked via object-src 'none'
	// below; images preview via <img> (img-src).
	"frame-src 'self' blob: https://eventzflow.notion.site",
	"frame-ancestors 'none'",
	"form-action 'self'",
	"base-uri 'self'",
	"object-src 'none'",
	// upgrade-insecure-requests rewrites every http:// subresource to https://.
	// That's correct in production (real TLS) but breaks local dev, where the
	// API on http://localhost:3000 has no TLS and the upgraded https:// request
	// fails with ERR_SSL_PROTOCOL_ERROR. Only enable it outside development.
	...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const securityHeaders = [
	{ key: "Content-Security-Policy", value: csp },
	{ key: "X-Frame-Options", value: "DENY" },
	{ key: "X-Content-Type-Options", value: "nosniff" },
	{ key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
	{ key: "Cross-Origin-Opener-Policy", value: "same-origin" },
	{ key: "X-DNS-Prefetch-Control", value: "on" },
	{
		key: "Permissions-Policy",
		value: "camera=(self), microphone=(), geolocation=(), payment=(self)",
	},
	...(isDev
		? []
		: [
				{
					key: "Strict-Transport-Security",
					value: "max-age=63072000; includeSubDomains; preload",
				},
			]),
];

const nextConfig: NextConfig = {
	/* config options here */
	output: "standalone",
	typedRoutes: true,
	// Strip console.* from production client bundles (keep error/warn).
	compiler: {
		removeConsole: isDev ? false : { exclude: ["error", "warn"] },
	},
	logging: {
		fetches: {
			fullUrl: isDev,
		},
	},
	// Suppress baseline browser mapping warnings
	onDemandEntries: {
		// period (in ms) where the server will keep pages in the buffer
		maxInactiveAge: 25 * 1000,
		// number of pages that should be kept simultaneously without being disposed
		pagesBufferLength: 2,
	},
	async headers() {
		return [
			{
				source: "/:path*",
				headers: securityHeaders,
			},
		];
	},
};

export default nextConfig;
