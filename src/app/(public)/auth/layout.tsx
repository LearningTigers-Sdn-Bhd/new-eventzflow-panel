import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "EventzFlow - Authentication",
	description: "Login or Signup to EventzFlow Panel",
};

export default function AuthLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return children;
}
