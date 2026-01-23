import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Help & Documentation",
};

export default function HelpLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<div className="h-svh w-full">
			{children}
		</div>
	);
}
