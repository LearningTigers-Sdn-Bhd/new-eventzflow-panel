import type { Route } from "next";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { login, type RegisterRequestData, register } from "@/lib/api/auth";

interface AuthFormState {
	isLoading: boolean;
	error: string | null;
}

interface UseAuthFormReturn {
	isLoading: boolean;
	error: string | null;
	clearError: () => void;
	setError: (error: string) => void;
	handleLogin: (email: string, password: string) => Promise<void>;
	handleRegister: (userData: RegisterRequestData) => Promise<void>;
}

export function useAuthForm(): UseAuthFormReturn {
	const router = useRouter();
	const searchParams = useSearchParams();
	const redirectPath = searchParams.get("redirect");

	const [state, setState] = useState<AuthFormState>({
		isLoading: false,
		error: null,
	});

	const clearError = () => {
		setState((prev) => ({ ...prev, error: null }));
	};

	const setLoading = (isLoading: boolean) => {
		setState((prev) => ({ ...prev, isLoading }));
	};

	const setError = (error: string) => {
		setState((prev) => ({ ...prev, error }));
	};

	const handleLogin = async (
		email: string,
		password: string,
	): Promise<void> => {
		clearError();
		setLoading(true);

		try {
			await login(email, password);
			toast.success("Sign in successful");
			router.push((redirectPath as Route) || "/dashboard");
		} catch (error) {
			const errorMessage =
				error instanceof Error
					? error.message
					: "An error occurred during sign in";
			setError(errorMessage);
		} finally {
			setLoading(false);
		}
	};

	const handleRegister = async (
		userData: RegisterRequestData,
	): Promise<void> => {
		clearError();
		setLoading(true);

		try {
			// Extract invite token if redirectPath is an invite link or searchParams has it
			const inviteToken =
				searchParams.get("invite_token") ||
				redirectPath?.match(/\/invite\/host\/([^/?#]+)/)?.[1];

			const payload = inviteToken
				? { ...userData, invite_token: inviteToken }
				: userData;

			const response = await register(payload);
			toast.success("Sign up successful");

			// If redirected from an invite or specific return route, honor it directly!
			if (redirectPath) {
				router.push(redirectPath as Route);
			} else if (response.data.user.email_verified) {
				router.push("/dashboard" as Route);
			} else {
				router.push("/verify-email" as Route);
			}
		} catch (error) {
			const errorMessage =
				error instanceof Error
					? error.message
					: "An error occurred during sign up";
			setError(errorMessage);
		} finally {
			setLoading(false);
		}
	};

	return {
		isLoading: state.isLoading,
		error: state.error,
		clearError,
		setError,
		handleLogin,
		handleRegister,
	};
}
