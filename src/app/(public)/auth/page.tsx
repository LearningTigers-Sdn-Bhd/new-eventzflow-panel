"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import Loader from "@/components/loader";
import SignInForm from "@/components/sign-in-form";
import SignUpForm from "@/components/sign-up-form";

function AuthLogic() {
	const searchParams = useSearchParams();
	const router = useRouter();
	const pathname = usePathname();

	const isRegister = searchParams.has("register");
	const urlEmail = searchParams.get("email") || "";
	const [activeEmail, setActiveEmail] = useState<string>(urlEmail);
	const [existingAccountNotice, setExistingAccountNotice] = useState<
		string | null
	>(
		searchParams.has("existing")
			? "An account with this email already exists. Please enter your password to sign in."
			: null,
	);

	const switchToRegister = () => {
		setExistingAccountNotice(null);
		const params = new URLSearchParams(searchParams);
		params.delete("login");
		params.delete("existing");
		params.set("register", "");
		const search = params.toString().replace(/=(?=&|$)/g, "");

		router.replace(
			`${pathname}?${search}` as Parameters<typeof router.replace>[0],
		);
	};

	const switchToLogin = (email?: string, notice?: string) => {
		const targetEmail = email !== undefined ? email : activeEmail;
		if (targetEmail) {
			setActiveEmail(targetEmail);
		}
		if (notice !== undefined) {
			setExistingAccountNotice(notice);
		}

		const params = new URLSearchParams(searchParams);
		params.delete("register");
		params.set("login", "");
		if (targetEmail) {
			params.set("email", targetEmail);
		}
		if (notice) {
			params.set("existing", "true");
		} else {
			params.delete("existing");
		}
		const search = params.toString().replace(/=(?=&|$)/g, "");

		router.replace(
			`${pathname}?${search}` as Parameters<typeof router.replace>[0],
		);
	};

	const handleExistingAccount = (email: string) => {
		const notice =
			"An account with this email already exists. Please enter your password to sign in.";
		switchToLogin(email, notice);
	};

	return isRegister ? (
		<SignUpForm
			onSwitchToSignIn={() => switchToLogin()}
			onExistingAccount={handleExistingAccount}
			initialEmail={activeEmail}
		/>
	) : (
		<SignInForm
			onSwitchToSignUp={switchToRegister}
			initialEmail={activeEmail}
			existingAccountNotice={existingAccountNotice}
		/>
	);
}

export default function AuthPage() {
	return (
		<Suspense fallback={<Loader />}>
			<AuthLogic />
		</Suspense>
	);
}
