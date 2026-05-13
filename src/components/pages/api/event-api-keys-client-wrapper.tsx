"use client";

import { Check, Code, Copy, Key } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDialog } from "@/hooks/use-dialog";
import { useSetEventActions } from "@/hooks/use-set-event-actions";
import type { ApiKey } from "@/lib/api/api-keys";
import type { Event } from "@/lib/api/event/response";
import { EventApiDocumentation } from "./event-api-documentation";
import { EventApiKeyTable } from "./event-api-key-table";
import CreateEventApiKeyDialog from "./create-event-api-key-dialog";

interface EventApiKeysClientWrapperProps {
	eventId: number;
	event: Event;
	apiKeys: ApiKey[];
}

function EventIdBanner({ eventId }: { eventId: number }) {
	const [copied, setCopied] = useState(false);
	const handleCopy = async () => {
		await navigator.clipboard.writeText(String(eventId));
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};
	return (
		<div className="mb-4 flex items-center justify-between border border-dashed bg-muted/40 px-4 py-3">
			<div className="space-y-0.5">
				<p className="text-muted-foreground text-xs">Your Event ID</p>
				<p className="font-mono font-semibold text-sm">{eventId}</p>
			</div>
			<Button variant="outline" size="sm" className="rounded-none gap-2" onClick={handleCopy}>
				{copied ? <Check className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3" />}
				{copied ? "Copied" : "Copy"}
			</Button>
		</div>
	);
}

export default function EventApiKeysClientWrapper({
	eventId,
	event,
	apiKeys,
}: EventApiKeysClientWrapperProps) {
	const { openDialog, closeDialog } = useDialog();
	const [activeTab, setActiveTab] = useState("keys");

	const handleCreateApiKey = () => {
		openDialog({
			component: CreateEventApiKeyDialog,
			props: { eventId, onClose: closeDialog },
			config: {
				title: "Create API Key",
				description: "Generate a new API key scoped to this event.",
				size: "lg",
			},
		});
	};

	useSetEventActions(
		activeTab === "keys" ? (
			<Button onClick={handleCreateApiKey} className="w-full shrink-0 rounded-none">
				Create API Key
			</Button>
		) : null,
	);

	return (
		<Tabs defaultValue="keys" className="w-full" onValueChange={setActiveTab}>
			<div className="w-full border-y border-dashed">
				<TabsList className="flex h-12 w-full rounded-none">
					<TabsTrigger
						value="keys"
						className="flex flex-1 items-center justify-center gap-2 rounded-none"
					>
						<Key className="size-4" />
						API Keys
					</TabsTrigger>
					<TabsTrigger
						value="docs"
						className="flex flex-1 items-center justify-center gap-2 rounded-none"
					>
						<Code className="size-4" />
						API Reference
					</TabsTrigger>
				</TabsList>
			</div>

			<div className="mt-6">
				<TabsContent value="keys" className="mt-0">
					<EventIdBanner eventId={eventId} />
					<EventApiKeyTable eventId={eventId} data={apiKeys} />
				</TabsContent>

				<TabsContent value="docs" className="mt-0">
					<EventApiDocumentation event={event} eventId={eventId} />
				</TabsContent>
			</div>
		</Tabs>
	);
}
