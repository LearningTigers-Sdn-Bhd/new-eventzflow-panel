"use client";

import { useChunkErrorReload } from "@/hooks/use-chunk-error-reload";

// Replaces the root layout when it fails, so styles and providers are not
// available here — keep it dependency-free.
export default function GlobalError({
	error,
}: {
	error: Error & { digest?: string };
}) {
	const isChunkError = useChunkErrorReload(error);

	return (
		<html lang="en">
			<body
				style={{
					fontFamily: "system-ui, sans-serif",
					display: "flex",
					minHeight: "100vh",
					flexDirection: "column",
					alignItems: "center",
					justifyContent: "center",
					gap: 12,
					padding: 16,
					textAlign: "center",
				}}
			>
				<h1 style={{ fontSize: 24, margin: 0 }}>
					{isChunkError ? "A new version is available" : "Something went wrong"}
				</h1>
				<p style={{ maxWidth: 420, margin: 0, color: "#666" }}>
					{isChunkError
						? "We just updated the system. Reload to continue."
						: "An unexpected error occurred. Please reload the page."}
				</p>
				<button
					type="button"
					onClick={() => window.location.reload()}
					style={{ padding: "8px 16px", fontSize: 14, cursor: "pointer" }}
				>
					Reload page
				</button>
			</body>
		</html>
	);
}
