"use server";

import { cookies, headers } from "next/headers";
import { incrementResourceView } from "@/lib/api/resource/endpoints";

interface PublicSession {
	ip: string;
	content: string[];
	gatedAccess: string[];
}

const COOKIE_NAME = "public-session";

export async function getPublicSession(): Promise<PublicSession | null> {
	const cookieStore = await cookies();
	const sessionData = cookieStore.get(COOKIE_NAME);

	if (!sessionData) return null;

	try {
		return JSON.parse(sessionData.value) as PublicSession;
	} catch {
		return null;
	}
}

export async function trackResourceVisit(resourceId: string) {
	const cookieStore = await cookies();
	const headersList = await headers();

	// Get IP (handling potential proxy headers)
	const ip =
		headersList.get("x-forwarded-for")?.split(",")[0] ||
		headersList.get("x-real-ip") ||
		"unknown";

	const currentSession = await getPublicSession();

	let newContent = currentSession?.content || [];
	let gatedAccess = currentSession?.gatedAccess || [];
	let isNewVisit = false;

	if (currentSession && currentSession.ip !== ip) {
		// If IP is different, we treat it as a new session
		newContent = [resourceId];
		gatedAccess = []; // Reset gated access for new session
		isNewVisit = true;
	} else if (!newContent.includes(resourceId)) {
		newContent.push(resourceId);
		isNewVisit = true;
	}

	if (isNewVisit) {
		try {
			// Increment view count in backend
			await incrementResourceView(resourceId);
		} catch (error) {
			console.error("Failed to increment resource view:", error);
		}
	}

	const sessionValue: PublicSession = {
		ip,
		content: newContent,
		gatedAccess,
	};

	cookieStore.set(COOKIE_NAME, JSON.stringify(sessionValue), {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "lax",
		maxAge: 60 * 60 * 24 * 7, // 1 week
		path: "/",
	});

	return sessionValue;
}

export async function hasGatedAccess(resourceId: string): Promise<boolean> {
	const session = await getPublicSession();
	if (!session) return false;
	return session.gatedAccess?.includes(resourceId) ?? false;
}

export async function grantGatedAccess(resourceId: string): Promise<void> {
	const cookieStore = await cookies();
	const headersList = await headers();

	// Get IP (handling potential proxy headers)
	const ip =
		headersList.get("x-forwarded-for")?.split(",")[0] ||
		headersList.get("x-real-ip") ||
		"unknown";

	const currentSession = await getPublicSession();

	const newContent = currentSession?.content || [];
	const gatedAccess = currentSession?.gatedAccess || [];

	// Add resourceId to gatedAccess if not already present
	if (!gatedAccess.includes(resourceId)) {
		gatedAccess.push(resourceId);
	}

	// Ensure the resource is also in content (visited)
	if (!newContent.includes(resourceId)) {
		newContent.push(resourceId);
	}

	const sessionValue: PublicSession = {
		ip: currentSession?.ip || ip,
		content: newContent,
		gatedAccess,
	};

	cookieStore.set(COOKIE_NAME, JSON.stringify(sessionValue), {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "lax",
		maxAge: 60 * 60 * 24 * 7, // 1 week
		path: "/",
	});
}
