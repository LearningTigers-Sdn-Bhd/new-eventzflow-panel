import type { Metadata } from "next";
import AuthContent from "./auth-content";

export const metadata: Metadata = {
	title: "EventzFlow - Authentication",
	description: "Login or Signup to EventzFlow",
};

export default function AuthPage() {
	return <AuthContent />;
}