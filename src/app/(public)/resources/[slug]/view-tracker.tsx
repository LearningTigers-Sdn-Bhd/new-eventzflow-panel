"use client";

import { useEffect } from "react";
import { incrementResourceView } from "@/lib/api/resource/endpoints";

export default function ResourceViewTracker({
	resourceId,
}: {
	resourceId: string;
}) {
	useEffect(() => {
		const cookieName = `resource-viewed-${resourceId}`;
		const hasViewed = document.cookie
			.split(";")
			.some((item) => item.trim().startsWith(`${cookieName}=`));

		if (!hasViewed) {
			incrementResourceView(resourceId)
				.then(() => {
					// Set cookie for 1 day (or session?) Prompt said "if-else IP address is same", usually implies standard session or persistent.
					// I'll set it for 1 hour to prevent spamming but allow re-count eventually? Or 1 day.
					const d = new Date();
					d.setTime(d.getTime() + 24 * 60 * 60 * 1000);
					const expires = `expires=${d.toUTCString()}`;
					document.cookie = `${cookieName}=true;${expires};path=/`;
				})
				.catch((err) => console.error("Failed to increment view count", err));
		}
	}, [resourceId]);

	return null;
}
