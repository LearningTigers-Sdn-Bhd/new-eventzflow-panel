"use client";

import { useParams, useSearchParams } from "next/navigation";
import { GuestbookForm } from "@/components/pages/guestbook/guestbook-form";

export default function GuestbookPage() {
	const params = useParams();
	const searchParams = useSearchParams();
	const slug = params.slug as string;
	const visitor = searchParams.get("visitor") ?? undefined;

	return <GuestbookForm slug={slug} visitorPublicId={visitor} />;
}
