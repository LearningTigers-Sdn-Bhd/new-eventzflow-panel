"use client";

import { cva } from "class-variance-authority";
import {
	AlertTriangle,
	Check,
	ChevronDown,
	ChevronRight,
	Copy,
	Info,
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

						{endpoint.notes && endpoint.notes.length > 0 && (
							<div className="space-y-2">
								{endpoint.notes.map((note, i) => (
									<div
										key={i}
										className="flex items-start gap-2 rounded-none border border-sky-200 bg-sky-50 p-3 dark:border-sky-900/40 dark:bg-sky-950/30"
									>
										<Info className="mt-0.5 h-4 w-4 shrink-0 text-sky-600 dark:text-sky-400" />
										<p className="text-sky-800 text-xs dark:text-sky-200">{note}</p>
									</div>
								))}
							</div>
						)}

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
							code: "400",
							label: "Bad Request",
							desc: "Malformed parameters (e.g. invalid `updated_since` timestamp).",
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
						{
							code: "429",
							label: "Too Many Requests",
							desc: "Rate limit hit (300 requests/minute per IP).",
						},
					].map(({ code, label, desc }) => (
						<div key={code} className="flex items-start gap-3 px-3 py-2">
							<code className="w-10 shrink-0 font-mono font-semibold text-xs">
								{code}
							</code>
							<span className="w-28 shrink-0 font-medium text-xs">{label}</span>
							<span className="text-muted-foreground text-xs">{desc}</span>
						</div>
					))}
				</div>
			</div>

			{/* Error response shape */}
			<div className="space-y-2 px-2 sm:px-4">
				<h3 className="font-semibold text-muted-foreground text-xs uppercase tracking-wide sm:text-sm">
					Error Response Shape
				</h3>
				<p className="text-muted-foreground text-xs sm:text-sm">
					When a request fails, the API returns a JSON body with a stable shape so you can handle errors uniformly.
				</p>
				<CodeBlock
					code={`{
  "success": false,
  "message": "Validation Error",
  "errors": [
    { "field": "attendee_email", "message": "is invalid" }
  ]
}`}
				/>
			</div>

			{/* Enum reference */}
			<div className="space-y-2 px-2 sm:px-4">
				<h3 className="font-semibold text-muted-foreground text-xs uppercase tracking-wide sm:text-sm">
					Enum Reference
				</h3>
				<div className="space-y-3 text-xs sm:text-sm">
					<div>
						<p className="font-medium">
							<code className="rounded-none border bg-background px-1 py-0.5 font-mono text-[10px] sm:text-xs">
								ticket.status
							</code>
						</p>
						<p className="text-muted-foreground">
							<code>purchased</code> · <code>scanned</code> · <code>refunded</code> · <code>canceled</code> · <code>pending_payment</code>
						</p>
					</div>
					<div>
						<p className="font-medium">
							<code className="rounded-none border bg-background px-1 py-0.5 font-mono text-[10px] sm:text-xs">
								ticket.payment_status
							</code>
						</p>
						<p className="text-muted-foreground">
							<code>pending</code> · <code>paid</code> · <code>failed</code> · <code>refunded_payment</code>
						</p>
					</div>
					{!event.use_ticket && (
						<div>
							<p className="font-medium">
								<code className="rounded-none border bg-background px-1 py-0.5 font-mono text-[10px] sm:text-xs">
									visitor.rsvp_status
								</code>
							</p>
							<p className="text-muted-foreground">
								<code>pending</code> · <code>attending</code> · <code>declined</code>
							</p>
						</div>
					)}
					<div>
						<p className="font-medium">
							<code className="rounded-none border bg-background px-1 py-0.5 font-mono text-[10px] sm:text-xs">
								vendor.type
							</code>
						</p>
						<p className="text-muted-foreground">
							<code>Exhibitor</code> (when Exhibitor Kit enabled) · <code>Merchant</code> (otherwise)
						</p>
					</div>
				</div>
			</div>

			{/* Pagination example */}
			<div className="space-y-2 px-2 sm:px-4">
				<h3 className="font-semibold text-muted-foreground text-xs uppercase tracking-wide sm:text-sm">
					Paginating Through All Tickets
				</h3>
				<p className="text-muted-foreground text-xs sm:text-sm">
					For large events, fetch tickets in pages. Read the totals from the response headers and stop when
					{" "}<code className="rounded-none border bg-background px-1 py-0.5 font-mono text-[10px] sm:text-xs">X-Page</code>
					{" "}equals{" "}
					<code className="rounded-none border bg-background px-1 py-0.5 font-mono text-[10px] sm:text-xs">X-Total-Pages</code>.
				</p>
				<CodeBlock
					code={`# Fetch the first page (100 rows)
curl -i '${API_BASE_URL}/v1/events/${eventId}/tickets?page=1&per_page=100' \\
  -H 'Authorization: YOUR_EVENT_API_KEY'

# Response headers include:
#   X-Total-Count: 4170
#   X-Page: 1
#   X-Per-Page: 100
#   X-Total-Pages: 42

# Loop until X-Page == X-Total-Pages, incrementing page each call.`}
				/>
			</div>

			{/* Incremental sync example */}
			<div className="space-y-2 px-2 sm:px-4">
				<h3 className="font-semibold text-muted-foreground text-xs uppercase tracking-wide sm:text-sm">
					Incremental Sync
				</h3>
				<p className="text-muted-foreground text-xs sm:text-sm">
					Save the timestamp of your last successful sync and pass it as
					{" "}<code className="rounded-none border bg-background px-1 py-0.5 font-mono text-[10px] sm:text-xs">updated_since</code>
					{" "}on the next call. Only tickets changed since then are returned — much faster than re-pulling
					the full set.
				</p>
				<CodeBlock
					code={`curl '${API_BASE_URL}/v1/events/${eventId}/tickets?updated_since=2026-05-17T00:00:00+08:00&per_page=100&page=1' \\
  -H 'Authorization: YOUR_EVENT_API_KEY'`}
				/>
			</div>

			{/* QR generation */}
			<div className="space-y-2 px-2 sm:px-4">
				<h3 className="font-semibold text-muted-foreground text-xs uppercase tracking-wide sm:text-sm">
					Generating QR Codes
				</h3>
				<p className="text-muted-foreground text-xs sm:text-sm">
					Each ticket and visitor has a{" "}
					<code className="rounded-none border bg-background px-1 py-0.5 font-mono text-[10px] sm:text-xs">public_id</code>{" "}
					— that string is what gets encoded in the QR code, nothing more. Use any standard QR library:
				</p>
				<ul className="ml-4 list-disc space-y-1 text-muted-foreground text-xs sm:text-sm">
					<li>
						Node.js — <code className="rounded-none border bg-background px-1 py-0.5 font-mono text-[10px] sm:text-xs">qrcode</code>
					</li>
					<li>
						Python — <code className="rounded-none border bg-background px-1 py-0.5 font-mono text-[10px] sm:text-xs">qrcode</code>
					</li>
					<li>
						PHP — <code className="rounded-none border bg-background px-1 py-0.5 font-mono text-[10px] sm:text-xs">endroid/qr-code</code>
					</li>
					<li>
						Browser — <code className="rounded-none border bg-background px-1 py-0.5 font-mono text-[10px] sm:text-xs">qrcode.js</code>
					</li>
				</ul>
				<p className="text-muted-foreground text-xs sm:text-sm">
					When the QR is scanned, you'll get back the{" "}
					<code className="rounded-none border bg-background px-1 py-0.5 font-mono text-[10px] sm:text-xs">public_id</code>
					{" "}— pass it to the Check-In endpoint.
				</p>
			</div>

			{/* Conventions */}
			<div className="space-y-2 px-2 sm:px-4">
				<h3 className="font-semibold text-muted-foreground text-xs uppercase tracking-wide sm:text-sm">
					Conventions
				</h3>
				<ul className="ml-4 list-disc space-y-1 text-muted-foreground text-xs sm:text-sm">
					<li>
						All timestamps are ISO 8601 in Malaysia Time (MYT, UTC+8). Example:{" "}
						<code className="rounded-none border bg-background px-1 py-0.5 font-mono text-[10px] sm:text-xs">2026-08-01T09:00:00.000+08:00</code>
						. When passing timestamps as query params (e.g. <code className="rounded-none border bg-background px-1 py-0.5 font-mono text-[10px] sm:text-xs">updated_since</code>), both{" "}
						<code className="rounded-none border bg-background px-1 py-0.5 font-mono text-[10px] sm:text-xs">+08:00</code> and{" "}
						<code className="rounded-none border bg-background px-1 py-0.5 font-mono text-[10px] sm:text-xs">Z</code> (UTC) are accepted.
					</li>
					<li>
						Money fields (e.g.{" "}
						<code className="rounded-none border bg-background px-1 py-0.5 font-mono text-[10px] sm:text-xs">price</code>,{" "}
						<code className="rounded-none border bg-background px-1 py-0.5 font-mono text-[10px] sm:text-xs">amount_paid</code>
						) are returned as decimal strings (e.g.{" "}
						<code className="rounded-none border bg-background px-1 py-0.5 font-mono text-[10px] sm:text-xs">"99.00"</code>
						) to avoid floating-point loss.
					</li>
					<li>
						Rate limit: 300 requests / minute per IP across the whole API. A 429 response means you've
						exceeded that — back off and retry.
					</li>
					<li>
						This key is scoped to <strong>this event only</strong>. Calls referencing a different event
						are rejected with a 403.
					</li>
				</ul>
			</div>
		</div>
	);
}
