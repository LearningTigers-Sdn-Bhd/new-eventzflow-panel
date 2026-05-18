"use client";

import { cva } from "class-variance-authority";
import {
	AlertTriangle,
	Check,
	ChevronDown,
	ChevronRight,
	Copy,
	Zap,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";
import type { Event } from "@/lib/api/event/response";
import { cn } from "@/lib/utils";
import {
	API_BASE_URL,
	type ApiEndpoint,
	EVENT_API_CATEGORIES,
	EVENT_API_ENDPOINTS,
} from "./event-api-endpoints-data";

const methodVariants = cva("rounded-none text-white", {
	variants: {
		method: {
			GET: "bg-sky-500",
			POST: "bg-emerald-500",
			PATCH: "bg-orange-500",
			DELETE: "bg-red-500",
		},
	},
	defaultVariants: { method: "GET" },
});

function CodeBlock({ code }: { code: string }) {
	const [copied, setCopied] = useState(false);
	const handleCopy = async () => {
		await navigator.clipboard.writeText(code);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};
	return (
		<div className="relative">
			<pre className="max-w-full overflow-x-auto rounded-none border bg-muted p-3 text-xs sm:p-4 sm:text-sm">
				<code className="whitespace-pre-wrap break-all text-foreground sm:whitespace-pre sm:break-normal">
					{code}
				</code>
			</pre>
			<Button
				variant="ghost"
				size="icon"
				className="absolute top-1 right-1 size-7 bg-muted/80 opacity-100 transition-opacity sm:top-2 sm:right-2 sm:size-8 sm:opacity-0 sm:group-hover:opacity-100"
				onClick={handleCopy}
			>
				{copied ? (
					<Check className="size-3 text-green-500 sm:size-4" />
				) : (
					<Copy className="size-3 sm:size-4" />
				)}
			</Button>
		</div>
	);
}

function ApiEndpointCard({
	endpoint,
	sub,
}: {
	endpoint: ApiEndpoint;
	sub: (s: string) => string;
}) {
	const [isOpen, setIsOpen] = useState(false);
	const resolvedEndpoint = sub(endpoint.endpoint);
	return (
		<Collapsible open={isOpen} onOpenChange={setIsOpen}>
			<div className="border border-dashed">
				<CollapsibleTrigger asChild>
					<button
						type="button"
						className="flex w-full flex-wrap items-center gap-2 p-3 text-left transition-colors hover:bg-muted/50 sm:flex-nowrap sm:gap-3 sm:p-4"
					>
						{isOpen ? (
							<ChevronDown className="size-4 shrink-0 text-muted-foreground" />
						) : (
							<ChevronRight className="size-4 shrink-0 text-muted-foreground" />
						)}
						<Badge
							className={cn(
								methodVariants({ method: endpoint.method as any }),
								"w-full max-w-18 px-1.5 text-[10px] sm:px-2 sm:text-xs",
							)}
						>
							{endpoint.method}
						</Badge>
						<span className="font-medium text-sm sm:text-base">
							{endpoint.title}
						</span>
						<span className="ml-auto hidden truncate font-mono text-muted-foreground text-xs sm:text-sm md:block">
							{resolvedEndpoint}
						</span>
					</button>
				</CollapsibleTrigger>
				<CollapsibleContent>
					<div className="space-y-4 border-t border-dashed bg-card p-3 sm:space-y-6 sm:p-4">
						<p className="text-muted-foreground text-xs sm:text-sm">
							{endpoint.description}
						</p>

						<div className="group space-y-2">
							<h4 className="font-medium text-xs sm:text-sm">Endpoint</h4>
							<CodeBlock
								code={`${endpoint.method} ${API_BASE_URL}${resolvedEndpoint}`}
							/>
						</div>

						{endpoint.headers && (
							<div className="group space-y-2">
								<h4 className="font-medium text-xs sm:text-sm">Headers</h4>
								<CodeBlock
									code={Object.entries(endpoint.headers)
										.map(([k, v]) => `${k}: ${v}`)
										.join("\n")}
								/>
							</div>
						)}

						{endpoint.queryParams && (
							<div className="space-y-2">
								<h4 className="font-medium text-xs sm:text-sm">
									Query Parameters
								</h4>
								<div className="divide-y rounded-none border text-sm">
									{Object.entries(endpoint.queryParams).map(([param, desc]) => (
										<div key={param} className="flex gap-3 px-3 py-2">
											<code className="shrink-0 font-mono text-sky-600 text-xs dark:text-sky-400">
												{param}
											</code>
											<span className="text-muted-foreground text-xs">
												{desc}
											</span>
										</div>
									))}
								</div>
							</div>
						)}

						{endpoint.requestBody && (
							<div className="group space-y-2">
								<h4 className="font-medium text-xs sm:text-sm">Request Body</h4>
								<CodeBlock
									code={JSON.stringify(endpoint.requestBody, null, 2)}
								/>
							</div>
						)}

						<div className="group space-y-2">
							<h4 className="font-medium text-xs sm:text-sm">cURL Example</h4>
							<CodeBlock
								code={(() => {
									const url = `${API_BASE_URL}${resolvedEndpoint}`;
									let curl = `curl -X ${endpoint.method} '${url}'`;
									if (endpoint.headers) {
										for (const [key, value] of Object.entries(
											endpoint.headers,
										)) {
											curl += ` \\\n  -H '${key}: ${value}'`;
										}
									}
									if (endpoint.requestBody) {
										curl += ` \\\n  -d '${JSON.stringify(endpoint.requestBody, null, 2)}'`;
									}
									return curl;
								})()}
							/>
						</div>

						{endpoint.response && (
							<div className="group space-y-2">
								<h4 className="font-medium text-xs sm:text-sm">Response</h4>
								<CodeBlock code={JSON.stringify(endpoint.response, null, 2)} />
							</div>
						)}
					</div>
				</CollapsibleContent>
			</div>
		</Collapsible>
	);
}

export function EventApiDocumentation({
	event,
	eventId,
}: {
	event: Event;
	eventId: number;
}) {
	const visibleEndpoints = EVENT_API_ENDPOINTS.filter(
		(e) => !e.visible || e.visible(event),
	);

	// Keep sub as identity — {event_id} stays as placeholder in docs
	const sub = (str: string) => str;
	return (
		<div className="space-y-4 sm:space-y-6">
			{/* Warm intro */}
			<div className="flex items-start gap-3 border border-dashed bg-gradient-to-br from-primary/5 to-primary/10 p-4">
				<Zap className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
				<div className="space-y-1">
					<p className="font-semibold text-sm">
						Welcome to the Eventzflow API 👋
					</p>
					<p className="text-muted-foreground text-xs leading-relaxed sm:text-sm">
						With your event API key, you can connect Eventzflow to your own
						systems — sync attendees, automate registrations, build custom
						check-in apps, and more. Everything here is scoped to{" "}
						<strong>this event only</strong>.
					</p>
				</div>
			</div>

			{/* Auth note */}
			<p className="border-y border-dashed bg-accent p-2 text-center text-muted-foreground text-xs sm:text-base">
				Pass your API key directly in the{" "}
				<code className="rounded-none border bg-background px-1 py-0.5 font-mono text-[10px] sm:px-1.5 sm:text-sm">
					Authorization
				</code>{" "}
				header — no{" "}
				<code className="rounded-none border bg-background px-1 py-0.5 font-mono text-[10px] sm:px-1.5 sm:text-sm">
					Bearer
				</code>{" "}
				prefix needed. Your event ID is{" "}
				<code className="rounded-none border bg-background px-1 py-0.5 font-mono text-[10px] sm:px-1.5 sm:text-sm">
					{eventId}
				</code>{" "}
				— replace{" "}
				<code className="rounded-none border bg-background px-1 py-0.5 font-mono text-[10px] sm:px-1.5 sm:text-sm">
					{"{event_id}"}
				</code>{" "}
				with it in all endpoints.
			</p>

			{/* Security warning */}
			<div className="flex items-start gap-3 border border-amber-200 border-dashed bg-amber-50 p-3 px-2 sm:px-4 dark:border-amber-900/40 dark:bg-amber-950/30">
				<AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
				<p className="text-amber-800 text-xs dark:text-amber-200">
					Keep your API key secret. Never expose it in client-side code or
					public repositories. If compromised, revoke it immediately from the
					API Keys tab.
				</p>
			</div>

			{/* Endpoints by category */}
			{EVENT_API_CATEGORIES.map((category) => {
				const endpoints = visibleEndpoints.filter(
					(e) => e.category === category,
				);
				if (endpoints.length === 0) return null;
				return (
					<div key={category} className="space-y-2 px-2 sm:px-4">
						<h3 className="font-semibold text-muted-foreground text-xs uppercase tracking-wide sm:text-sm">
							{category}
						</h3>
						<div className="space-y-2">
							{endpoints.map((endpoint) => (
								<ApiEndpointCard
									key={endpoint.id}
									endpoint={endpoint}
									sub={sub}
								/>
							))}
						</div>
					</div>
				);
			})}

			{/* Response codes */}
			<div className="space-y-2 px-2 sm:px-4">
				<h3 className="font-semibold text-muted-foreground text-xs uppercase tracking-wide sm:text-sm">
					Response Codes
				</h3>
				<div className="divide-y rounded-none border text-sm">
					{[
						{ code: "200", label: "OK", desc: "Request succeeded." },
						{
							code: "201",
							label: "Created",
							desc: "Resource was created successfully.",
						},
						{
							code: "204",
							label: "No Content",
							desc: "Succeeded with no body (e.g. delete).",
						},
						{
							code: "401",
							label: "Unauthorized",
							desc: "Missing or invalid API key.",
						},
						{
							code: "403",
							label: "Forbidden",
							desc: "Your key doesn't have access to this resource.",
						},
						{
							code: "404",
							label: "Not Found",
							desc: "The requested resource doesn't exist.",
						},
						{
							code: "422",
							label: "Unprocessable",
							desc: "Validation failed — check the errors field.",
						},
					].map(({ code, label, desc }) => (
						<div key={code} className="flex items-start gap-3 px-3 py-2">
							<code className="w-8 shrink-0 font-mono font-semibold text-xs">
								{code}
							</code>
							<span className="w-24 shrink-0 font-medium text-xs">{label}</span>
							<span className="text-muted-foreground text-xs">{desc}</span>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
