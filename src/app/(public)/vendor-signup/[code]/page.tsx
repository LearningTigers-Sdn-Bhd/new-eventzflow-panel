"use client";

import { useParams } from "next/navigation";
import { VendorSignupContent } from "@/components/pages/vendor-signup/vendor-signup-content";

export default function VendorSignupCodePage() {
	const { code } = useParams<{ code: string }>();
	return <VendorSignupContent token={code} />;
}
