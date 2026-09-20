"use client";

import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { getAiIntegrations } from "@/lib/api/ai-integration";
import { AiProviderForm } from "./ai-provider-form";

export function AiIntegrationForm() {
	const [addingProvider, setAddingProvider] = useState(false);
	const { data: integrations = [], isLoading } = useQuery({
		queryKey: ["ai-integrations"],
		queryFn: getAiIntegrations,
	});

	if (isLoading) {
		return (
			<div className="flex items-center justify-center py-8">
				<Spinner className="size-6" />
			</div>
		);
	}

	return (
		<div className="space-y-4">
			<div className="flex items-start justify-between gap-3">
				<p className="text-muted-foreground text-sm">
					Configure providers, their available models, and the default model
					used for AI features.
				</p>
				<Button
					type="button"
					variant="outline"
					onClick={() => setAddingProvider(true)}
					disabled={addingProvider}
					className="rounded-none"
				>
					<Plus /> Add Provider
				</Button>
			</div>

			{integrations.length === 0 && !addingProvider && (
				<div className="border border-dashed p-6 text-center text-muted-foreground text-sm">
					No AI providers configured yet. Add one to get started.
				</div>
			)}

			{addingProvider && (
				<AiProviderForm onCancel={() => setAddingProvider(false)} />
			)}

			{integrations.map((integration) => (
				<AiProviderForm key={integration.id} integration={integration} />
			))}
		</div>
	);
}
