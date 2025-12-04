"use client";

import { useState } from "react";
import { Check, ChevronDown, ChevronRight, Copy } from "lucide-react";
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
			<pre className="bg-muted border rounded-none p-3 sm:p-4 overflow-x-auto text-xs sm:text-sm max-w-full">
				<code className="text-foreground whitespace-pre-wrap break-all sm:whitespace-pre sm:break-normal">
					{code}
				</code>
			</pre>
			<Button
				variant="ghost"
				size="icon"
				className="absolute top-1 right-1 sm:top-2 sm:right-2 size-7 sm:size-8 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity bg-muted/80"
				onClick={handleCopy}
			>
				{copied ? (
					<Check className="size-3 sm:size-4 text-green-500" />
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
						className="w-full flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-3 p-3 sm:p-4 hover:bg-muted/50 transition-colors text-left"
					>
						{isOpen ? (
							<ChevronDown className="size-4 text-muted-foreground shrink-0" />
						) : (
							<ChevronRight className="size-4 text-muted-foreground shrink-0" />
						)}
						<Badge
							variant={METHOD_VARIANTS[endpoint.method]}
							className="rounded-none text-[10px] sm:text-xs px-1.5 sm:px-2"
						>
							{endpoint.method}
						</Badge>
						<span className="font-medium text-sm sm:text-base">
							{endpoint.title}
						</span>
						<span className="text-muted-foreground text-xs sm:text-sm truncate hidden md:block ml-auto font-mono">
							{endpoint.endpoint}
						</span>
					</button>
				</CollapsibleTrigger>

				<CollapsibleContent>
					<div className="border-t border-dashed p-3 sm:p-4 space-y-4 sm:space-y-6 bg-card">
						<p className="text-xs sm:text-sm text-muted-foreground">
							{endpoint.description}
						</p>

						<div className="space-y-2 group">
							<h4 className="text-xs sm:text-sm font-medium">Endpoint</h4>
							<CodeBlock
								code={`${endpoint.method} ${API_BASE_URL}${endpoint.endpoint}`}
							/>
						</div>

						{endpoint.headers && (
							<div className="space-y-2 group">
								<h4 className="text-xs sm:text-sm font-medium">Headers</h4>
								<CodeBlock
									code={Object.entries(endpoint.headers)
										.map(([key, value]) => `${key}: ${value}`)
										.join("\n")}
								/>
							</div>
						)}

						{endpoint.requestBody && (
							<div className="space-y-2 group">
								<h4 className="text-xs sm:text-sm font-medium">Request Body</h4>
								<CodeBlock
									code={JSON.stringify(endpoint.requestBody, null, 2)}
								/>
							</div>
						)}

						<div className="space-y-2 group">
							<h4 className="text-xs sm:text-sm font-medium">cURL Example</h4>
							<CodeBlock code={generateCurlExample(endpoint)} />
						</div>

						{endpoint.response && (
							<div className="space-y-2 group">
								<h4 className="text-xs sm:text-sm font-medium">Response</h4>
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
			<p className="text-xs sm:text-base text-muted-foreground border-y border-dashed bg-accent p-2 text-center">
				Use your API key in the{" "}
				<code className="bg-background border px-1 sm:px-1.5 py-0.5 rounded-none text-[10px] sm:text-sm font-mono">
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
						<h3 className="text-xs sm:text-sm font-semibold text-muted-foreground uppercase tracking-wide">
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
