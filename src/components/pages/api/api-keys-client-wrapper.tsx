"use client";

import { useState } from "react";
import { Code, Key } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IconTitle } from "@/components/ui/icon-heading";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDialog } from "@/hooks/use-dialog";
import type { ApiKey } from "@/lib/api/api-keys";
import { ApiDocumentation } from "./api-documentation";
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
	const [activeTab, setActiveTab] = useState("keys");

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
			<div className="page-header mb-6">
				<div className="px-2 md:px-4">
					<IconTitle
						icon={Key}
						title="API Keys"
						description="Manage your personal API keys for secure programmatic access to your account."
					/>
				</div>
				{activeTab === "keys" && (
					<div className="w-full px-0 md:w-auto md:px-4">
						<Button
							onClick={handleCreateApiKey}
							className="w-full shrink-0 rounded-none"
						>
							Create API Key
						</Button>
					</div>
				)}
			</div>

			<Tabs defaultValue="keys" className="w-full" onValueChange={setActiveTab}>
				<div className="w-full border-y border-dashed">
					<TabsList className="flex h-12 w-full rounded-none">
						<TabsTrigger
							value="keys"
							className="flex flex-1 items-center justify-center gap-2 rounded-none"
						>
							<Key className="size-4" />
							My Keys
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
						<DataTable columns={columns} data={apiKeys} />
					</TabsContent>

					<TabsContent value="docs" className="mt-0">
						<ApiDocumentation />
					</TabsContent>
				</div>
			</Tabs>
		</div>
	);
}
