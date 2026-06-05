"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function EmailDeliveriesPage() {
	const router = useRouter();

	useEffect(() => {
		// @ts-ignore
		router.replace("/email-log");
	}, [router]);

	return null;
}
