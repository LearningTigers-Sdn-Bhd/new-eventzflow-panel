"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useIsTablet } from "@/hooks/use-tablet";
import { AuthProvider } from "@/providers/auth-provider";
import { queryClient } from "@/utils/rest-api";
import { ThemeProvider } from "./theme-provider";
import { Toaster } from "./ui/sonner";

export default function Providers({ children }: { children: React.ReactNode }) {
	// const enableDevtools =
	// 	process.env.NEXT_PUBLIC_ENABLE_DEVTOOLS === "true" ||
	// 	process.env.NODE_ENV === "development";

	const enableDevtools = false;
	const isTablet = useIsTablet();
	return (
		<ThemeProvider
			attribute="class"
			defaultTheme="system"
			enableSystem
			disableTransitionOnChange
		>
			<QueryClientProvider client={queryClient}>
				<AuthProvider>{children}</AuthProvider>
				{enableDevtools && <ReactQueryDevtools />}
			</QueryClientProvider>
			<Toaster richColors position={isTablet ? "top-center" : "bottom-right"} />
		</ThemeProvider>
	);
}
