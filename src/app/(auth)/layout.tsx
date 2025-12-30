import type { Metadata } from "next";
import AuthLayoutClient from "@/components/admin-ui/layout/auth-layout-client";

export const metadata: Metadata = {
	title: {
		template: "%s | EventzFlow Panel",
		default: "EventzFlow Panel",
	},
};

export default function AuthLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <AuthLayoutClient>{children}</AuthLayoutClient>;
}
