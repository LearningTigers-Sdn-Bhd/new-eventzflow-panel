"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Plug, XCircle } from "lucide-react";
import { useEffect, useId, useState } from "react";
import { toast } from "sonner";
import { FormGroupContainer } from "@/components/admin-ui/form/form-group-container";
import { InputLabel } from "@/components/admin-ui/form/input-label";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { hallKeys, useConnection } from "@/hooks/use-event-halls";
import {
	type ConnectionTestResult,
	deleteConnection,
	saveConnection,
	testConnection,
} from "@/lib/api/event/hall";

/** Where this event reads its people counts from: the counter service URL and an API key. Org owners only. */
export function ConnectionForm({ eventId }: { eventId: string }) {
	const id = useId();
	const queryClient = useQueryClient();
	const { data: connection, isLoading, error } = useConnection(eventId, true);

	const [baseUrl, setBaseUrl] = useState("");
	const [apiKey, setApiKey] = useState("");
	const [result, setResult] = useState<ConnectionTestResult | null>(null);
	const [confirmRemove, setConfirmRemove] = useState(false);

	// Start from the saved URL once it has loaded; the key is never sent back.
	useEffect(() => {
		if (connection?.source === "event" && connection.baseUrl) {
			setBaseUrl(connection.baseUrl);
		}
	}, [connection?.source, connection?.baseUrl]);

	const saved = connection?.source === "event";
	const urlChanged =
		saved && baseUrl.trim().replace(/\/$/, "") !== connection?.baseUrl;
	// A blank key keeps the saved one, but only for the same URL (the API enforces this too).
	const needsKey = !saved || urlChanged;
	const canSubmit =
		baseUrl.trim() !== "" && (!needsKey || apiKey.trim() !== "");

	const refresh = () => {
		queryClient.invalidateQueries({ queryKey: hallKeys.connection(eventId) });
		queryClient.invalidateQueries({ queryKey: hallKeys.headcount(eventId) });
		queryClient.invalidateQueries({
			queryKey: hallKeys.counterVenues(eventId),
		});
	};

	const test = useMutation({
		mutationFn: () => testConnection(eventId, { baseUrl, apiKey }),
		onSuccess: setResult,
		onError: (e: Error) =>
			setResult({ ok: false, reason: "unreachable", message: e.message }),
	});

	const save = useMutation({
		mutationFn: () => saveConnection(eventId, { baseUrl, apiKey }),
		onSuccess: () => {
			toast.success("Counter connection saved");
			setApiKey("");
			setResult(null);
			refresh();
		},
		onError: (e: Error) => toast.error(`Failed to save: ${e.message}`),
	});

	const remove = useMutation({
		mutationFn: () => deleteConnection(eventId),
		onSuccess: () => {
			toast.success("Counter connection removed");
			setBaseUrl("");
			setApiKey("");
			setResult(null);
			setConfirmRemove(false);
			refresh();
		},
		onError: (e: Error) => toast.error(`Failed to remove: ${e.message}`),
	});

	const busy = test.isPending || save.isPending || remove.isPending;

	const statusBadge = connection && (
		<Badge variant="secondary" className="rounded-none">
			{connection.source === "event"
				? `Saved · key ${connection.keyPrefix}…`
				: connection.source === "environment"
					? "Using the server default"
					: "Not set up"}
		</Badge>
	);

	return (
		<FormGroupContainer
			title={{
				icon: Plug,
				label: "Counter connection",
				description:
					"Where this event reads its people counts from. Create an API key in the counter service; it is shown only once.",
			}}
		>
			{statusBadge && <div>{statusBadge}</div>}
			{isLoading ? (
				<p className="text-muted-foreground text-sm">Loading...</p>
			) : error ? (
				<p className="text-destructive text-sm">
					Couldn't load the connection.
				</p>
			) : (
				<form
					className="flex flex-col gap-4"
					onSubmit={(e) => {
						e.preventDefault();
						if (canSubmit && !busy) save.mutate();
					}}
				>
					<div className="grid gap-4 md:grid-cols-2">
						<InputLabel
							label="Counter service URL"
							htmlFor={`${id}-url`}
							inputType="url"
							value={baseUrl}
							onChange={(value) => {
								setBaseUrl(value);
								setResult(null);
							}}
							placeholder="https://counters.example.com"
							disabled={busy}
							required
						/>
						<InputLabel
							label="API key"
							htmlFor={`${id}-key`}
							description={
								urlChanged
									? "You changed the URL, so enter the API key again."
									: saved
										? "Leave blank to keep the saved key."
										: "Paste the key you created in the counter service."
							}
							inputType="password"
							value={apiKey}
							onChange={(value) => {
								setApiKey(value);
								setResult(null);
							}}
							placeholder={
								saved && !urlChanged
									? `Saved (${connection?.keyPrefix}…)`
									: "Paste the API key"
							}
							disabled={busy}
						/>
					</div>

					{result && (
						<div
							role="status"
							className={
								result.ok
									? "flex items-start gap-2 border border-emerald-200 bg-emerald-50 p-3 text-emerald-700 text-sm dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300"
									: "flex items-start gap-2 border border-red-200 bg-red-50 p-3 text-red-700 text-sm dark:border-red-800 dark:bg-red-950/30 dark:text-red-300"
							}
						>
							{result.ok ? (
								<CheckCircle2 className="mt-0.5 size-4 shrink-0" />
							) : (
								<XCircle className="mt-0.5 size-4 shrink-0" />
							)}
							<span>
								{result.ok
									? `Connected. Found ${result.venues} counter${result.venues === 1 ? "" : "s"}.`
									: result.message}
							</span>
						</div>
					)}

					<div className="flex flex-wrap items-center justify-end gap-2">
						{saved && (
							<Button
								type="button"
								variant="ghost"
								className="rounded-none text-destructive hover:text-destructive"
								disabled={busy}
								onClick={() => setConfirmRemove(true)}
							>
								Remove
							</Button>
						)}
						<Button
							type="button"
							variant="outline"
							className="rounded-none"
							disabled={busy || baseUrl.trim() === "" || (needsKey && !apiKey)}
							onClick={() => test.mutate()}
						>
							{test.isPending ? "Testing..." : "Test connection"}
						</Button>
						<Button
							type="submit"
							className="rounded-none"
							disabled={busy || !canSubmit}
						>
							{save.isPending ? "Saving..." : "Save"}
						</Button>
					</div>
				</form>
			)}

			<AlertDialog open={confirmRemove} onOpenChange={setConfirmRemove}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Remove the counter connection?</AlertDialogTitle>
						<AlertDialogDescription>
							This event stops showing live counts until a connection is set up
							again. The counters and their recorded data are not affected.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={() => remove.mutate()}
							disabled={remove.isPending}
						>
							Remove
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</FormGroupContainer>
	);
}
