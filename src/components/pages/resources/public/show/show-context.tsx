"use client";

import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";
import {
	grantGatedAccess,
	trackResourceVisit,
} from "@/app/(public)/resources/[slug]/actions";

interface PublicSession {
	ip: string;
	content: string[]; // array of resource IDs
	gatedAccess: string[]; // array of resource IDs with granted access
}

interface ShowContextType {
	session: PublicSession | null;
	isFirstVisitToResource: boolean;
	hasGatedAccess: boolean;
	grantAccess: () => Promise<void>;
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
	const router = useRouter();
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

	// Check if user has gated access to this resource
	const hasGatedAccess = session?.gatedAccess?.includes(resourceId) ?? false;

	// Function to grant access to the current resource
	const grantAccess = async () => {
		try {
			await grantGatedAccess(resourceId);
			// Update local session state
			setSession((prev) => {
				if (!prev) return prev;
				return {
					...prev,
					gatedAccess: [...(prev.gatedAccess || []), resourceId],
				};
			});
			// Refresh the page to show the content
			router.refresh();
		} catch (error) {
			console.error("Failed to grant access:", error);
			throw error;
		}
	};

	return (
		<ShowContext.Provider
			value={{
				session,
				isFirstVisitToResource,
				hasGatedAccess,
				grantAccess,
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
