"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { queryClient } from "@/utils/rest-api";
import { ThemeProvider } from "./theme-provider";
import { Toaster } from "./ui/sonner";

export default function Providers({ children }: { children: React.ReactNode }) {
	const enableDevtools =
		process.env.NEXT_PUBLIC_ENABLE_DEVTOOLS === "true" ||
		process.env.NODE_ENV === "development";

	return (
		<ThemeProvider
			attribute="class"
			defaultTheme="system"
			enableSystem
			disableTransitionOnChange
		>
			<QueryClientProvider client={queryClient}>
				{children}
				{enableDevtools && <ReactQueryDevtools />}
			</QueryClientProvider>
			<Toaster richColors />
		</ThemeProvider>
	);
}
