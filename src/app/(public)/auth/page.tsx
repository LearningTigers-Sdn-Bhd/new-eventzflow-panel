"use client";

import Head from "next/head";
import { parseAsStringEnum, useQueryState } from "nuqs";
import SignInForm from "@/components/sign-in-form";
import SignUpForm from "@/components/sign-up-form";

const authModeParser = parseAsStringEnum(["login", "signup"]).withDefault(
	"signup",
);

export default function AuthPage() {
	const [mode, setMode] = useQueryState("mode", authModeParser);

	return mode === "login" ? (
		<>
			<Head>
				<title>EventzFlow - Login</title>
				<meta name="description" content="Login to your EventzFlow account" />
			</Head>
			<SignInForm onSwitchToSignUp={() => setMode("signup")} />
		</>
	) : (
		<>
			<Head>
				<title>EventzFlow - Signup</title>
				<meta
					name="description"
					content="Signup for a new EventzFlow account"
				/>
			</Head>
			<SignUpForm onSwitchToSignIn={() => setMode("login")} />
		</>
	);
}
