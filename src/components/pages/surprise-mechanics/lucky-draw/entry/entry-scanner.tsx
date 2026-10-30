"use client";

import {
	keepPreviousData,
	useMutation,
	useQuery,
	useQueryClient,
} from "@tanstack/react-query";
import {
	Camera,
	CameraOff,
	CheckCircle2,
	ChevronLeft,
	ChevronRight,
	QrCode,
	ScanLine,
	Search,
	Trash2,
	Users,
	XCircle,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useBarcodeScanner } from "@/hooks/use-barcode-scanner";
import { useConfirmDialog } from "@/hooks/use-confirm-dialog";
import { useDebounce } from "@/hooks/use-debounce";
import { useScanner } from "@/hooks/use-scanner";
import {
	addLuckyDrawEntry,
	ENTRIES_PER_PAGE,
	getLuckyDrawEntries,
	type LuckyDrawEntry,
	removeLuckyDrawEntry,
	searchLuckyDrawEntries,
} from "@/lib/api/lucky-draw";
import { cn } from "@/lib/utils";

// A focused button would swallow the hardware scanner's trailing Enter as a click
const blurActive = () =>
	setTimeout(() => (document.activeElement as HTMLElement | null)?.blur(), 0);

const SCANNER_ID = "lucky-draw-entry-reader";
const DUPLICATE_SCAN_MS = 3000;

type ScanMode = "camera" | "hardware";
type ScanResult = { ok: boolean; message: string; title?: string };
type EntriesPage = {
	entries: LuckyDrawEntry[];
	total: number;
	totalPages: number;
};

interface EntryScannerProps {
	eventId: string;
	sessionId: number;
}

export function EntryScanner({ eventId, sessionId }: EntryScannerProps) {
	const queryClient = useQueryClient();
	const { openConfirm, closeDialog } = useConfirmDialog();
	const [isScanning, setIsScanning] = useState(false);
	const [isTransitioning, setIsTransitioning] = useState(false);
	const [mode, setMode] = useState<ScanMode>("hardware");
	const [result, setResult] = useState<ScanResult | null>(null);
	const lastScan = useRef({ value: "", at: 0 });
	const addedAny = useRef(false);

	const [page, setPage] = useState(1);
	const entriesBaseKey = ["lucky-draw-entries", eventId, sessionId];
	const { data, isFetching: isLoadingPage } = useQuery({
		queryKey: [...entriesBaseKey, page],
		queryFn: () => getLuckyDrawEntries(eventId, sessionId, page),
		placeholderData: keepPreviousData,
	});
	const entries = data?.entries ?? [];
	const total = data?.total ?? 0;
	const totalPages = Math.max(data?.totalPages ?? 1, 1);

	// Fallback for a ticket whose QR will not scan: find the person by name, phone or email
	const [query, setQuery] = useState("");
	const debouncedQuery = useDebounce(query.trim(), 300);
	const searching = debouncedQuery.length >= 2;
	const { data: matches = [], isFetching: isSearching } = useQuery({
		queryKey: ["lucky-draw-entry-search", eventId, sessionId, debouncedQuery],
		queryFn: () => searchLuckyDrawEntries(eventId, sessionId, debouncedQuery),
		enabled: searching,
	});

	const { mutate } = useMutation({
		mutationFn: (ref: { publicId: string } | { participantId: number }) =>
			addLuckyDrawEntry(eventId, sessionId, ref),
		onSuccess: (entry) => {
			addedAny.current = true;
			setQuery("");
			setResult({
				ok: true,
				message: entry.contact
					? `${entry.name} · ${entry.contact}`
					: entry.name,
			});
			// Prepend to page 1 locally instead of refetching: scans stay fast however many entries exist
			queryClient.setQueryData(
				[...entriesBaseKey, 1],
				(prev: EntriesPage | undefined) => {
					const nextTotal = (prev?.total ?? 0) + 1;
					return {
						entries: [entry, ...(prev?.entries ?? [])].slice(
							0,
							ENTRIES_PER_PAGE,
						),
						total: nextTotal,
						totalPages: Math.ceil(nextTotal / ENTRIES_PER_PAGE),
					};
				},
			);
			// Other pages shifted by one row: mark them stale, refetch only when visited
			queryClient.invalidateQueries({
				queryKey: entriesBaseKey,
				refetchType: "none",
			});
			setPage(1);
		},
		onError: (error: Error) => setResult({ ok: false, message: error.message }),
	});

	const { mutate: removeEntry } = useMutation({
		mutationFn: (entry: LuckyDrawEntry) =>
			removeLuckyDrawEntry(eventId, sessionId, entry.id),
		onSuccess: (_, entry) => {
			addedAny.current = true;
			closeDialog();
			blurActive();
			setResult({
				ok: true,
				title: "Removed from draw",
				message: entry.name,
			});
			// A removal can empty the last page: step back so the list is never blank
			const lastPage = Math.max(Math.ceil((total - 1) / ENTRIES_PER_PAGE), 1);
			setPage((p) => Math.min(p, lastPage));
			queryClient.invalidateQueries({ queryKey: entriesBaseKey });
		},
		onError: (error: Error) => {
			closeDialog();
			blurActive();
			setResult({ ok: false, message: error.message });
		},
	});

	const confirmRemove = (entry: LuckyDrawEntry) =>
		openConfirm({
			title: "Remove from draw?",
			message: `${entry.name} will no longer be in the draw. They can be scanned in again.`,
			confirmLabel: "Remove",
			type: "destructive",
			icon: "delete",
			onConfirm: () => removeEntry(entry),
		});

	const onScanSuccess = useCallback(
		(decodedText: string) => {
			const code = decodedText.trim();
			if (!code) return;
			const now = Date.now();
			const last = lastScan.current;
			if (code === last.value && now - last.at < DUPLICATE_SCAN_MS) return;
			lastScan.current = { value: code, at: now };
			mutate({ publicId: code });
		},
		[mutate],
	);

	// Physical (keyboard-emulating) scanner works alongside the camera, like check-in
	useBarcodeScanner({ onScanSuccess });

	const { startScanner, stopScanner } = useScanner({
		scannerId: SCANNER_ID,
		onScanSuccess,
	});

	const handleStart = async () => {
		setIsTransitioning(true);
		if (await startScanner()) setIsScanning(true);
		setIsTransitioning(false);
	};

	const handleStop = async () => {
		setIsTransitioning(true);
		if (await stopScanner()) setIsScanning(false);
		setIsTransitioning(false);
	};

	// In camera mode, start the camera once the DOM is ready
	// biome-ignore lint/correctness/useExhaustiveDependencies: restart only when the mode changes
	useEffect(() => {
		if (mode !== "camera") return;
		const timer = setTimeout(handleStart, 300);
		return () => clearTimeout(timer);
	}, [mode]);

	// The draw pool is refreshed once when the dialog closes, not on every scan
	// biome-ignore lint/correctness/useExhaustiveDependencies: cleanup-only effect
	useEffect(() => {
		return () => {
			if (!addedAny.current) return;
			queryClient.invalidateQueries({
				queryKey: ["lucky-draw", "participants", eventId, sessionId],
			});
		};
	}, []);

	const switchMode = async (next: ScanMode) => {
		if (next === mode) return;
		if (next === "hardware" && isScanning) await handleStop();
		setMode(next);
		// A focused button would swallow the scanner's trailing Enter as a click
		(document.activeElement as HTMLElement | null)?.blur();
	};

	return (
		<div className="grid gap-4 p-4 sm:px-6 sm:pb-6 lg:min-h-0 lg:flex-1 lg:grid-cols-[minmax(0,28rem)_minmax(0,1fr)] lg:grid-rows-[minmax(0,1fr)]">
			<div className="space-y-4 lg:overflow-y-auto">
				<div className="grid grid-cols-2 border">
					{(
						[
							{ value: "camera", label: "Camera", icon: Camera },
							{ value: "hardware", label: "Hardware Scanner", icon: ScanLine },
						] as const
					).map(({ value, label, icon: Icon }) => (
						<button
							key={value}
							type="button"
							onClick={() => switchMode(value)}
							className={cn(
								"flex items-center justify-center gap-2 px-3 py-2 font-medium text-sm transition-colors",
								mode === value
									? "bg-primary text-primary-foreground"
									: "bg-background text-muted-foreground hover:bg-muted",
							)}
						>
							<Icon className="h-4 w-4" />
							{label}
						</button>
					))}
				</div>

				<Card className="overflow-hidden rounded-none border-primary/20 border-dashed bg-accent p-2 shadow-none sm:p-3">
					{mode === "hardware" ? (
						<div className="mx-auto flex aspect-square w-full max-w-sm flex-col items-center justify-center gap-4 border border-primary/30 border-dashed bg-white px-4 text-center">
							<div className="relative inline-flex border border-primary/10 bg-primary/5 p-5">
								<ScanLine className="h-12 w-12 text-primary/60" />
								<span className="absolute top-2 right-2 flex h-2.5 w-2.5">
									<span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75" />
									<span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-500" />
								</span>
							</div>
							<div className="space-y-1">
								<h3 className="font-semibold text-foreground text-lg">
									Hardware Scanner Ready
								</h3>
								<p className="text-muted-foreground text-xs leading-relaxed">
									Scan a participant's ticket QR with your scanner. No camera
									needed.
								</p>
							</div>
						</div>
					) : (
						<div className="relative flex items-center justify-center bg-white">
							<div
								id={SCANNER_ID}
								className="aspect-square w-full max-w-sm rounded-none"
								style={{ position: "relative", overflow: "hidden" }}
							/>

							{!isScanning && (
								<div className="absolute inset-0 flex flex-col items-center justify-center rounded-none border border-primary/30 border-dashed">
									<div className="max-w-xs space-y-4 px-4 text-center">
										<div className="inline-flex rounded-none border border-primary/10 bg-primary/5 p-5">
											<QrCode className="h-12 w-12 text-primary/60" />
										</div>
										<div className="space-y-1">
											<h3 className="font-semibold text-foreground text-lg">
												Scanner Ready
											</h3>
											<p className="text-muted-foreground text-xs leading-relaxed">
												Activate the camera, then scan each participant's ticket
												QR
											</p>
										</div>
										<Button
											onClick={handleStart}
											className="w-full gap-2 rounded-none"
											disabled={isTransitioning}
										>
											<Camera className="h-4 w-4" />
											Activate Camera
										</Button>
									</div>
								</div>
							)}

							{isScanning && (
								<>
									<div className="absolute top-2 left-1/2 z-20 -translate-x-1/2">
										<div className="flex items-center gap-2 rounded-none bg-primary px-3 py-1.5 shadow-lg">
											<span className="relative flex h-2 w-2">
												<span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
												<span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
											</span>
											<span className="font-medium text-primary-foreground text-xs">
												Scanning Active
											</span>
										</div>
									</div>
									<div className="absolute bottom-2 left-1/2 z-20 -translate-x-1/2">
										<Button
											onClick={handleStop}
											variant="destructive"
											className="gap-2 rounded-none shadow-lg"
											disabled={isTransitioning}
										>
											<CameraOff className="h-4 w-4" />
											Stop Scanner
										</Button>
									</div>
								</>
							)}
						</div>
					)}
				</Card>

				<div className="space-y-2 rounded-none border p-3">
					<div className="relative">
						<Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
						<Input
							value={query}
							onChange={(e) => setQuery(e.target.value)}
							placeholder="QR not scanning? Find by name, phone or email"
							className="rounded-none pl-9"
							autoComplete="off"
						/>
					</div>
					{searching && (
						<ul className="max-h-56 divide-y overflow-y-auto border">
							{matches.length === 0 ? (
								<li className="px-3 py-4 text-center text-muted-foreground text-xs">
									{isSearching ? "Searching..." : "No one found"}
								</li>
							) : (
								matches.map((m) => (
									<li
										key={m.id}
										className="flex items-center gap-3 px-3 py-2 text-sm"
									>
										<div className="min-w-0 flex-1">
											<p className="truncate font-medium">{m.name}</p>
											<p className="truncate text-muted-foreground text-xs">
												{m.ineligible_reason ??
													m.contact ??
													"No phone or email"}
											</p>
										</div>
										{m.entered ? (
											<span className="text-muted-foreground text-xs">
												Entered
											</span>
										) : (
											<Button
												size="sm"
												className="rounded-none"
												disabled={!!m.ineligible_reason}
												onClick={() => mutate({ participantId: m.id })}
											>
												Enter
											</Button>
										)}
									</li>
								))
							)}
						</ul>
					)}
				</div>

				{result && (
					<div
						className={cn(
							"flex items-start gap-3 rounded-none border-y border-r border-l-4 p-3",
							result.ok
								? "border-green-600 bg-green-50 text-green-900 dark:bg-green-950 dark:text-green-100"
								: "border-destructive bg-destructive/5 text-destructive",
						)}
					>
						{result.ok ? (
							<CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
						) : (
							<XCircle className="mt-0.5 h-5 w-5 shrink-0" />
						)}
						<div className="min-w-0">
							<p className="font-semibold text-sm">
								{result.title ??
									(result.ok ? "Entered into draw" : "Not entered")}
							</p>
							<p className="truncate text-sm">{result.message}</p>
						</div>
					</div>
				)}
			</div>

			<div className="flex min-h-0 flex-col rounded-none border">
				<div className="flex items-center justify-between border-b bg-muted/40 px-3 py-2">
					<div className="flex items-center gap-2 font-semibold text-sm">
						<Users className="h-4 w-4 text-muted-foreground" />
						Entries
					</div>
					<span className="rounded-none border border-primary/20 bg-primary/5 px-2 py-0.5 font-medium text-primary text-xs">
						{total}
					</span>
				</div>
				{entries.length === 0 ? (
					<p className="px-3 py-6 text-center text-muted-foreground text-xs">
						No entries yet. Scanned participants will appear here.
					</p>
				) : (
					<div
						className={cn(
							"max-h-80 min-h-0 flex-1 overflow-y-auto lg:max-h-none",
							isLoadingPage && "opacity-60",
						)}
					>
						<table className="w-full text-sm">
							<thead className="sticky top-0 bg-background text-muted-foreground text-xs">
								<tr className="border-b">
									<th className="w-12 px-3 py-2 text-left font-medium">#</th>
									<th className="px-3 py-2 text-left font-medium">Name</th>
									<th className="px-3 py-2 text-left font-medium">Contact</th>
									<th className="px-3 py-2 text-right font-medium">Entered</th>
									<th className="w-10 px-2 py-2" />
								</tr>
							</thead>
							<tbody>
								{entries.map((e, i) => (
									<tr key={e.id} className="border-b">
										<td className="px-3 py-2 text-muted-foreground text-xs tabular-nums">
											{total - (page - 1) * ENTRIES_PER_PAGE - i}
										</td>
										<td className="px-3 py-2 font-medium">{e.name}</td>
										<td className="px-3 py-2 text-muted-foreground tabular-nums">
											{e.contact ?? "-"}
										</td>
										<td className="whitespace-nowrap px-3 py-2 text-right text-muted-foreground text-xs tabular-nums">
											{new Date(e.entered_at).toLocaleString([], {
												day: "numeric",
												month: "short",
												hour: "2-digit",
												minute: "2-digit",
											})}
										</td>
										<td className="px-2 py-1 text-right">
											<Button
												variant="ghost"
												size="icon"
												className="h-7 w-7 rounded-none text-muted-foreground hover:text-destructive"
												aria-label={`Remove ${e.name}`}
												onClick={() => confirmRemove(e)}
											>
												<Trash2 className="h-4 w-4" />
											</Button>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
				<div className="mt-auto flex items-center justify-between gap-2 px-3 py-2 text-xs">
					<span className="text-muted-foreground">
						Page {page} of {totalPages}
					</span>
					<div className="flex gap-1">
						<Button
							variant="outline"
							size="sm"
							className="h-7 rounded-none px-2"
							disabled={page <= 1}
							onClick={() => {
								setPage((p) => p - 1);
								blurActive();
							}}
						>
							<ChevronLeft className="h-4 w-4" />
							Prev
						</Button>
						<Button
							variant="outline"
							size="sm"
							className="h-7 rounded-none px-2"
							disabled={page >= totalPages}
							onClick={() => {
								setPage((p) => p + 1);
								blurActive();
							}}
						>
							Next
							<ChevronRight className="h-4 w-4" />
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}
