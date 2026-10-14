"use client";

import { useParams } from "next/navigation";
import { InviteHostContent } from "@/components/pages/invite/invite-host-content";

export default function InviteHostCodePage() {
	const { code } = useParams<{ code: string }>();
	return <InviteHostContent token={code} selfPath={`/invite/host/${code}`} />;
}
