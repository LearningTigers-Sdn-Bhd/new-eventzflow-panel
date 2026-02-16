import type { Metadata } from "next";
import { Geist, Geist_Mono, Playfair_Display } from "next/font/google";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import "../index.css";
import { Clarity } from "@/components/clarity";
import Providers from "@/components/providers";
import { UniversalConfirmDialog } from "@/components/universal-confirm-dialog";
import { UniversalDialog } from "@/components/universal-dialog";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

const playfair = Playfair_Display({
	variable: "--font-playfair",
	subsets: ["latin"],
	weight: ["400", "500", "600", "700"],
});

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
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body
				className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} antialiased`}
				suppressHydrationWarning
			>
				<Clarity />
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
