"use client";

import type { LuckyDrawSession } from "@/lib/api/lucky-draw/response";
import { BaseSessionItem } from "../shared/components/session-item";
import { ActionMenu } from "./session-config";

interface SessionItemProps {
	session: LuckyDrawSession;
}

export function SessionItem({ session }: SessionItemProps) {
	return (
		<BaseSessionItem
			session={session}
			badgeConfig={{
				type: "gifts",
				value: session.use_gifts,
				label: "Uses Gifts",
			}}
			actionMenuComponent={ActionMenu}
		/>
	);
}
