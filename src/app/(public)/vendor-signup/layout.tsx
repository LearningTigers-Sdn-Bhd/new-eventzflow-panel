import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "EventzFlow - Vendor Signup",
	description: "Sign up as a vendor to manage the event via EventzFlow panel.",
	applicationName: "EventzFlow",
	authors: [{ name: "Jesselton Pixel Sdn. Bhd." }],
};

export default function VendorSignupLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <>{children}</>;
}
