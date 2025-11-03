"use client";

import { Key } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IconTitle } from "@/components/ui/icon-heading";
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
		<div className="p-0">
			<div className="page-header mb-8">
				<div className="px-2 md:px-4">
					<IconTitle
						icon={Key}
						title="API Keys"
						description="Manage your personal API keys for secure programmatic access to your account."
					/>
				</div>
				<div className="w-full px-0 md:w-auto md:px-4">
					<Button onClick={handleCreateApiKey} className="w-full shrink-0">
						<span className="hidden sm:inline">Create API Key</span>
						<span className="sm:hidden">Create</span>
					</Button>
				</div>
			</div>
			<DataTable columns={columns} data={apiKeys} />
		</div>
	);
}
