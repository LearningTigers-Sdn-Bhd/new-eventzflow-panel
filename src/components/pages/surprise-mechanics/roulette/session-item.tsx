"use client";

import type { RouletteSession } from "@/lib/api/roulette/response";
import { BaseSessionItem } from "../shared/components/session-item";
import { ActionMenu } from "./session-config";

interface SessionItemProps {
	session: RouletteSession;
}

export function SessionItem({ session }: SessionItemProps) {
	return (
		<BaseSessionItem
			session={session}
			badgeConfig={{
				type: "multiple",
				value: session.is_multiple,
				label: "Multiple Winners",
			}}
			actionMenuComponent={ActionMenu}
		/>
	);
}
