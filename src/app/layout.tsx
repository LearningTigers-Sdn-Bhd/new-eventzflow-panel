import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import "../index.css";
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

export const metadata: Metadata = {
	title: "EventzFlow Event Admin",
	description: "EventzFlow Event Admin Panel",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased`}
				suppressHydrationWarning
			>
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
