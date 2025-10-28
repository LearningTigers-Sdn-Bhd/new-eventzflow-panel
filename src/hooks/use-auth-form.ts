import type { Route } from "next";
import { useRouter } from "next/navigation";
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
			router.push("/dashboard" as Route);
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
			await register(userData);
			toast.success("Sign up successful");
			router.push("/verify-email" as Route);
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
