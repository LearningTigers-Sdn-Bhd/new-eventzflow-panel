"use client";

import { Button } from "@/components/ui/button";
import { useDialog } from "@/hooks/use-dialog";
import type { ApiKey } from "@/lib/api/api-keys";
import { columns } from "./columns";
import CreateApiKeyDialog from "./create-api-key-dialog";
import { DataTable } from "./data-table";

interface ApiKeysClientWrapperProps {
	apiKeys: ApiKey[];
}

export default function ApiKeysClientWrapper({
	apiKeys,
}: ApiKeysClientWrapperProps) {
	const { openDialog, closeDialog } = useDialog();

	const handleCreateApiKey = () => {
		openDialog({
			component: CreateApiKeyDialog,
			props: {
				onClose: closeDialog,
			},
			config: {
				title: "Create API Key",
				description: "Generate a new API key for secure programmatic access.",
				size: "lg",
			},
		});
	};

	return (
		<div className="p-2">
			<div className="mb-8 flex items-center justify-between gap-4">
				<div className="min-w-0 flex-1">
					<h1 className="font-bold text-3xl tracking-tight">API Keys</h1>
					<p className="text-muted-foreground">
						Manage your personal API keys for secure programmatic access to your
						account.
					</p>
				</div>
				<Button onClick={handleCreateApiKey} className="shrink-0">
					<span className="hidden sm:inline">Create API Key</span>
					<span className="sm:hidden">Create</span>
				</Button>
			</div>
			<DataTable columns={columns} data={apiKeys} />
		</div>
	);
}
