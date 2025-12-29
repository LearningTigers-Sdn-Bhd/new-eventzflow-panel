"use client";

import { parseAsStringEnum, useQueryState } from "nuqs";
import SignInForm from "@/components/sign-in-form";
import SignUpForm from "@/components/sign-up-form";

const authModeParser = parseAsStringEnum(["login", "signup"]).withDefault(
	"signup",
);

export default function AuthContent() {
	const [mode, setMode] = useQueryState("mode", authModeParser);

	return mode === "login" ? (
		<SignInForm onSwitchToSignUp={() => setMode("signup")} />
	) : (
		<SignUpForm onSwitchToSignIn={() => setMode("login")} />
	);
}
