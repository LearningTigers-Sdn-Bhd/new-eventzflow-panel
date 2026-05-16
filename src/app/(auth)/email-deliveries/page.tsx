"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function EmailDeliveriesPage() {
	const router = useRouter();

	useEffect(() => {
		router.replace("/email-log");
	}, [router]);

	return null;
}
