"use client";

import { Check, ChevronDown, ChevronRight, Copy } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
	API_BASE_URL,
	API_CATEGORIES,
	API_ENDPOINTS,
	type ApiEndpoint,
} from "./api-endpoints-data";

const METHOD_VARIANTS: Record<
	string,
	"default" | "secondary" | "destructive" | "outline"
> = {
	GET: "default",
	POST: "secondary",
	PUT: "secondary",
	PATCH: "outline",
	DELETE: "destructive",
};

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

function generateCurlExample(endpoint: ApiEndpoint): string {
	const url = `${API_BASE_URL}${endpoint.endpoint}`;
	let curl = `curl -X ${endpoint.method} '${url}'`;

	if (endpoint.headers) {
		for (const [key, value] of Object.entries(endpoint.headers)) {
			curl += ` \\\n  -H '${key}: ${value}'`;
		}
	}

	if (endpoint.requestBody) {
		curl += ` \\\n  -d '${JSON.stringify(endpoint.requestBody, null, 2)}'`;
	}

	return curl;
}

function ApiEndpointCard({ endpoint }: { endpoint: ApiEndpoint }) {
	const [isOpen, setIsOpen] = useState(false);

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
							variant={METHOD_VARIANTS[endpoint.method]}
							className="rounded-none px-1.5 text-[10px] sm:px-2 sm:text-xs"
						>
							{endpoint.method}
						</Badge>
						<span className="font-medium text-sm sm:text-base">
							{endpoint.title}
						</span>
						<span className="ml-auto hidden truncate font-mono text-muted-foreground text-xs sm:text-sm md:block">
							{endpoint.endpoint}
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
								code={`${endpoint.method} ${API_BASE_URL}${endpoint.endpoint}`}
							/>
						</div>

						{endpoint.headers && (
							<div className="group space-y-2">
								<h4 className="font-medium text-xs sm:text-sm">Headers</h4>
								<CodeBlock
									code={Object.entries(endpoint.headers)
										.map(([key, value]) => `${key}: ${value}`)
										.join("\n")}
								/>
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
							<CodeBlock code={generateCurlExample(endpoint)} />
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

export function ApiDocumentation() {
	return (
		<div className="space-y-4 sm:space-y-6">
			<p className="border-y border-dashed bg-accent p-2 text-center text-muted-foreground text-xs sm:text-base">
				Use your API key in the{" "}
				<code className="rounded-none border bg-background px-1 py-0.5 font-mono text-[10px] sm:px-1.5 sm:text-sm">
					Authorization
				</code>{" "}
				header to authenticate requests.
			</p>

			{API_CATEGORIES.map((category) => {
				const categoryEndpoints = API_ENDPOINTS.filter(
					(e) => e.category === category,
				);
				return (
					<div key={category} className="space-y-2 px-2 sm:px-4">
						<h3 className="font-semibold text-muted-foreground text-xs uppercase tracking-wide sm:text-sm">
							{category}
						</h3>
						<div className="space-y-2">
							{categoryEndpoints.map((endpoint) => (
								<ApiEndpointCard key={endpoint.id} endpoint={endpoint} />
							))}
						</div>
					</div>
				);
			})}
		</div>
	);
}
