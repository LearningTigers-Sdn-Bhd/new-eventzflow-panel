"use client";

import { Bookmark, Clock, PenLine } from "lucide-react";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { EmailBlast } from "@/lib/api/email-blast";
import { ComposeTab } from "./compose-tab";
import { HistoryTab } from "./history-tab";
import { TemplatesTab } from "./templates-tab";

const TABS = [
	{ value: "compose", label: "Compose", icon: PenLine },
	{ value: "templates", label: "Templates", icon: Bookmark },
	{ value: "history", label: "History", icon: Clock },
] as const;

export function EmailBlastView({ eventId }: { eventId: string }) {
	const [tab, setTab] = useState("compose");
	// `key` remounts Compose with a fresh form whenever a draft/template is opened.
	const [seed, setSeed] = useState<{ draft: EmailBlast | null; key: number }>({
		draft: null,
		key: 0,
	});

	const openInCompose = (draft: EmailBlast | null) => {
		setSeed((s) => ({ draft, key: s.key + 1 }));
		setTab("compose");
	};

	return (
		<Tabs value={tab} onValueChange={setTab} className="w-full">
			<div className="w-full border-y border-dashed">
				<TabsList className="flex h-12 w-full rounded-none">
					{TABS.map(({ value, label, icon: Icon }) => (
						<TabsTrigger
							key={value}
							value={value}
							className="flex flex-1 items-center justify-center gap-2 rounded-none"
						>
							<Icon className="size-4" />
							{label}
						</TabsTrigger>
					))}
				</TabsList>
			</div>

			<div className="mt-6">
				{/* Kept mounted so peeking at History never loses an unsent email. */}
				<TabsContent
					value="compose"
					forceMount
					className="mt-0 data-[state=inactive]:hidden"
				>
					<ComposeTab
						key={seed.key}
						eventId={eventId}
						initial={seed.draft}
						onSent={() => {
							openInCompose(null);
							setTab("history");
						}}
					/>
				</TabsContent>
				<TabsContent value="templates" className="mt-0">
					<TemplatesTab eventId={eventId} onUse={openInCompose} />
				</TabsContent>
				<TabsContent value="history" className="mt-0">
					<HistoryTab
						eventId={eventId}
						onContinue={(draft) => openInCompose(draft)}
					/>
				</TabsContent>
			</div>
		</Tabs>
	);
}
