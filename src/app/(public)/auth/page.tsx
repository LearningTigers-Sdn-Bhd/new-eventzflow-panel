"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Loader from "@/components/loader";
import SignInForm from "@/components/sign-in-form";
import SignUpForm from "@/components/sign-up-form";

function AuthLogic() {
	const searchParams = useSearchParams();
	const router = useRouter();
	const pathname = usePathname();

	const isRegister = searchParams.has("register");

	const switchToRegister = () => {
		const params = new URLSearchParams(searchParams);
		params.delete("login");
		params.set("register", "");
		const search = params.toString().replace(/=(?=&|$)/g, "");

		router.replace(
			`${pathname}?${search}` as Parameters<typeof router.replace>[0],
		);
	};

	const switchToLogin = () => {
		const params = new URLSearchParams(searchParams);
		params.delete("register");
		params.set("login", "");
		const search = params.toString().replace(/=(?=&|$)/g, "");

		router.replace(
			`${pathname}?${search}` as Parameters<typeof router.replace>[0],
		);
	};

	return isRegister ? (
		<SignUpForm onSwitchToSignIn={switchToLogin} />
	) : (
		<SignInForm onSwitchToSignUp={switchToRegister} />
	);
}

export default function AuthPage() {
	return (
		<Suspense fallback={<Loader />}>
			<AuthLogic />
		</Suspense>
	);
}
