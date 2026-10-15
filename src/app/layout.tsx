import type { Metadata } from "next";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import "../index.css";
import Providers from "@/components/providers";
import { UniversalConfirmDialog } from "@/components/universal-confirm-dialog";
import { UniversalDialog } from "@/components/universal-dialog";

const getBaseUrl = () => {
	if (process.env.NEXT_PUBLIC_APP_URL) {
		return process.env.NEXT_PUBLIC_APP_URL;
	}
	if (process.env.VERCEL_URL) {
		return `https://${process.env.VERCEL_URL}`;
	}
	return "http://localhost:3001";
};

export const metadata: Metadata = {
	metadataBase: new URL(getBaseUrl()),
	icons: {
		icon: "/favicon/kaamatan-logo.png",
		shortcut: "/favicon/kaamatan-logo.png",
		apple: "/favicon/kaamatan-logo.png",
	},
	manifest: "/manifest.webmanifest",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body className="antialiased" suppressHydrationWarning>
				<NuqsAdapter>
					<Providers>
						{children}
						<UniversalDialog />
						<UniversalConfirmDialog />
					</Providers>
				</NuqsAdapter>
			</body>
		</html>
	);
}
