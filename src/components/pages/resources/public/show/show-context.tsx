"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { trackResourceVisit } from "@/app/(public)/resources/[slug]/actions";

interface PublicSession {
	ip: string;
	content: string[]; // array of resource IDs
}

interface ShowContextType {
	session: PublicSession | null;
	isFirstVisitToResource: boolean;
	isLoading: boolean;
}

const ShowContext = createContext<ShowContextType | undefined>(undefined);

export function ShowProvider({
	children,
	resourceId,
	initialSession,
}: {
	children: React.ReactNode;
	resourceId: string;
	initialSession: PublicSession | null;
}) {
	const [session, setSession] = useState<PublicSession | null>(initialSession);
	const [isLoading, setIsLoading] = useState(!initialSession);

	useEffect(() => {
		async function handleTrack() {
			try {
				const updatedSession = await trackResourceVisit(resourceId);
				setSession(updatedSession);
			} catch (error) {
				console.error("Failed to track resource visit:", error);
			} finally {
				setIsLoading(false);
			}
		}

		handleTrack();
	}, [resourceId]);

	// Check if this is the first time the user is seeing THIS specific resource
	// Based on the initial session or the updated one
	const isFirstVisitToResource = !initialSession?.content.includes(resourceId);

	return (
		<ShowContext.Provider
			value={{
				session,
				isFirstVisitToResource,
				isLoading,
			}}
		>
			{children}
		</ShowContext.Provider>
	);
}

export function useShow() {
	const context = useContext(ShowContext);
	if (context === undefined) {
		throw new Error("useShow must be used within a ShowProvider");
	}
	return context;
}
