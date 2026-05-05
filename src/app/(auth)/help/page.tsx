"use client";

import { useMemo } from "react";
import { useAuth } from "@/hooks/auth/use-auth";

const ORG_OWNER_HELP_EMBED_URL =
	"https://eventzflow.notion.site/ebd/2ef6f6554406804b99ace89c8f2c0478";
const ORGANIZER_HELP_EMBED_URL =
	"https://eventzflow.notion.site/ebd//3576f65544068035b30eeac592f74177";
const EXHIBITOR_HELP_EMBED_URL =
	"https://eventzflow.notion.site/ebd//3576f65544068034b34ae68a3f50f589";

function isExhibitorAudienceRole(role?: string) {
	return role === "vendor" || role === "exhibitor";
}

export default function HelpPage() {
	const { user } = useAuth();

	const embedUrl = useMemo(() => {
		if (user?.role === "org_owner" || user?.role === "member") {
			return ORG_OWNER_HELP_EMBED_URL;
		}

		if (isExhibitorAudienceRole(user?.role)) {
			return EXHIBITOR_HELP_EMBED_URL;
		}

		return ORGANIZER_HELP_EMBED_URL;
	}, [user?.role]);

	return (
		<div className="size-full overflow-hidden">
			<iframe
				src={embedUrl}
				className="w-full h-[calc(100%+52px)] -mt-[52px] border-0"
				title="EventzFlow Documentation"
			/>
		</div>
	);
}
