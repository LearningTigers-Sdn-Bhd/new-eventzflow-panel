import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	/* config options here */
	typedRoutes: true,
	logging: {
		fetches: {
			fullUrl: process.env.NODE_ENV === "development",
		},
	},
	// Suppress baseline browser mapping warnings
	onDemandEntries: {
		// period (in ms) where the server will keep pages in the buffer
		maxInactiveAge: 25 * 1000,
		// number of pages that should be kept simultaneously without being disposed
		pagesBufferLength: 2,
	},
};

export default nextConfig;
