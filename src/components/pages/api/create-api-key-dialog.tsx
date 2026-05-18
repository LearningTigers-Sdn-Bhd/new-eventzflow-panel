"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, Check, Copy } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { createApiKey, getApiKeys } from "@/lib/api/api-keys";

interface CreateApiKeyDialogProps {
	onClose: () => void;
}

export default function CreateApiKeyDialog({
	onClose,
}: CreateApiKeyDialogProps) {
	const [createdKey, setCreatedKey] = useState<string | null>(null);
	const [copied, setCopied] = useState(false);
	const [keyName, setKeyName] = useState("");
	const queryClient = useQueryClient();

	const { data: existingApiKeys, isLoading: loadingKeys } = useQuery({
		queryKey: ["api-keys"],
		queryFn: getApiKeys,
	});

	const hasExistingKey = (existingApiKeys?.length ?? 0) > 0;

	const createMutation = useMutation({
		mutationFn: createApiKey,
		onSuccess: (data) => {
			setCreatedKey(data.apiKey.rawKey);
			toast.success("API Key Created", {
				description:
					data.apiKey.message || "Your API key has been created successfully.",
			});
			queryClient.invalidateQueries({ queryKey: ["api-keys"] });
		},
		onError: (error: Error) => {
			toast.error("Failed to create API key", {
				description:
					error.message || "An error occurred while creating the API key.",
			});
		},
	});

	const handleCopy = async () => {
		if (createdKey) {
			try {
				await navigator.clipboard.writeText(createdKey);
				setCopied(true);
				toast.success("Copied to clipboard");
				setTimeout(() => setCopied(false), 2000);
			} catch {
				toast.error("Failed to copy", {
					description: "Please copy the key manually.",
				});
			}
		}
	};

	const handleCreate = () => {
		if (!keyName.trim()) {
			toast.error("API Key name is required");
			return;
		}
		createMutation.mutate({ name: keyName.trim() });
	};

	return (
		<div className="space-y-6">
			{!createdKey ? (
				<>
					<div className="flex flex-col items-center gap-4 py-4">
						<div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-950/40">
							<AlertTriangle
								className="h-6 w-6 text-amber-600 dark:text-amber-300"
								strokeWidth={2}
							/>
						</div>
						<div className="space-y-2 text-center">
							<h4 className="font-semibold text-sm">Important</h4>
							<p className="text-muted-foreground text-sm">
								Once created, the API key will only be shown once. Make sure to
								copy and store it securely.
							</p>
						</div>
					</div>

					<div className="space-y-2">
						<Label htmlFor="keyName">API Key Name</Label>
						<Input
							id="keyName"
							type="text"
							placeholder="e.g., Production API Key, Mobile App Key"
							value={keyName}
							onChange={(e) => setKeyName(e.target.value)}
							maxLength={255}
							disabled={createMutation.isPending}
						/>
						<p className="text-muted-foreground text-xs">
							Give your API key a descriptive name to identify it later.
						</p>
					</div>

					{hasExistingKey && (
						<div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/40 dark:bg-amber-950/40">
							<div className="flex gap-3">
								<AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
								<div className="space-y-1">
									<p className="font-semibold text-amber-900 text-sm dark:text-amber-100">
										Active API Key Exists
									</p>
									<p className="text-amber-800 text-sm dark:text-amber-200">
										You already have an active API key. Creating a new one will
										not revoke your existing key.
									</p>
								</div>
							</div>
						</div>
					)}

					<Separator />

					<div className="flex justify-end gap-3">
						<Button
							type="button"
							variant="outline"
							onClick={onClose}
							disabled={createMutation.isPending}
						>
							Cancel
						</Button>
						<Button
							type="button"
							onClick={handleCreate}
							disabled={
								createMutation.isPending || loadingKeys || !keyName.trim()
							}
						>
							{createMutation.isPending ? "Creating..." : "Generate API Key"}
						</Button>
					</div>
				</>
			) : (
				<>
					<div className="flex flex-col items-center gap-4 py-4">
						<div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/40">
							<Check
								className="h-6 w-6 text-emerald-600 dark:text-emerald-300"
								strokeWidth={2}
							/>
						</div>
						<div className="space-y-2 text-center">
							<h4 className="font-semibold text-sm">
								API Key Created Successfully
							</h4>
							<p className="text-muted-foreground text-sm">
								Copy this key now. You won't be able to see it again!
							</p>
						</div>
					</div>

					<div className="space-y-2">
						<p className="font-medium text-sm">Your API Key:</p>
						<div className="flex gap-2">
							<div className="flex-1 break-all rounded-md border bg-muted p-3 font-mono text-sm">
								{createdKey}
							</div>
							<Button
								type="button"
								variant="outline"
								size="icon"
								onClick={handleCopy}
								className="shrink-0"
							>
								{copied ? (
									<Check className="h-4 w-4 text-green-600" />
								) : (
									<Copy className="h-4 w-4" />
								)}
							</Button>
						</div>
					</div>

					<div className="flex flex-col items-center gap-4 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900/40 dark:bg-red-950/40">
						<div className="flex gap-3">
							<AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-600 dark:text-red-400" />
							<div className="space-y-1">
								<p className="font-semibold text-red-900 text-sm dark:text-red-100">
									Warning
								</p>
								<p className="text-red-800 text-sm dark:text-red-200">
									This is the only time you will see this key. Make sure to copy
									it now and store it securely.
								</p>
							</div>
						</div>
					</div>

					<Separator />

					<div className="flex justify-end">
						<Button type="button" onClick={onClose}>
							Done
						</Button>
					</div>
				</>
			)}
		</div>
	);
}
