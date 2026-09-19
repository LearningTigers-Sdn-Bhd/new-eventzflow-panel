"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function EmailDeliveriesPage() {
	const router = useRouter();

	useEffect(() => {
		// @ts-expect-error
		router.replace("/email-log");
	}, [router]);

	return null;
}
