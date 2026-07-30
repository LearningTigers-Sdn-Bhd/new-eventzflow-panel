"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	Ban,
	CheckCircle2,
	ChevronLeft,
	ChevronRight,
	Loader2,
	RotateCcw,
	Trash2,
} from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
	bulkCreateExhibitorBooths,
	createExhibitorBooth,
	deleteExhibitorBooth,
	type ExhibitorBoothStatus,
	getExhibitorBooths,
	releaseExhibitorBooth,
	updateExhibitorBooth,
} from "@/lib/api/exhibitor-booth";
import {
	type ExhibitorBoothPrice,
	getExhibitorBoothPrices,
} from "@/lib/api/exhibitor-booth-price";
import { getExhibitorZones } from "@/lib/api/exhibitor-zone";
import { extractErrorMessage } from "@/utils/error-handler";
import {
	generateBoothRange,
	parsePastedBoothNumbers,
} from "./booth-inventory-utils";

interface BoothInventoryDialogProps {
	eventId: number;
	trigger?: React.ReactNode;
}

type EntryMode = "single" | "range" | "paste";

const PAGE_SIZE = 50;
const STATUS_OPTIONS: ExhibitorBoothStatus[] = [
	"available",
	"reserved",
	"booked",
	"blocked",
];

const statusLabel = (status: ExhibitorBoothStatus) =>
	status.charAt(0).toUpperCase() + status.slice(1);

const formatBoothType = (value: string) =>
	value
		.split("_")
		.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
		.join(" ");

const priceLabel = (price: ExhibitorBoothPrice) =>
	[price.zone, formatBoothType(price.boothType), price.label]
		.filter(Boolean)
		.join(" · ");

export function BoothInventoryDialog({
	eventId,
	trigger,
}: BoothInventoryDialogProps) {
	const queryClient = useQueryClient();
	const [isOpen, setIsOpen] = React.useState(false);
	const [entryMode, setEntryMode] = React.useState<EntryMode>("single");
	const [boothPriceId, setBoothPriceId] = React.useState("");
	const [entryStatus, setEntryStatus] =
		React.useState<ExhibitorBoothStatus>("available");
	const [singleNumber, setSingleNumber] = React.useState("");
	const [rangePrefix, setRangePrefix] = React.useState("");
	const [rangeFrom, setRangeFrom] = React.useState("1");
	const [rangeTo, setRangeTo] = React.useState("");
	const [pastedNumbers, setPastedNumbers] = React.useState("");
	const [statusFilter, setStatusFilter] = React.useState("all");
	const [priceFilter, setPriceFilter] = React.useState("all");
	const [zoneFilter, setZoneFilter] = React.useState("all");
	const [page, setPage] = React.useState(1);

	const { data: boothPrices = [] } = useQuery({
		queryKey: ["exhibitor-booth-prices", eventId],
		queryFn: () => getExhibitorBoothPrices(eventId),
		enabled: isOpen,
	});

	const { data: zones = [] } = useQuery({
		queryKey: ["exhibitor-zones", eventId],
		queryFn: () => getExhibitorZones(eventId),
		enabled: isOpen,
	});

	const boothFilters = React.useMemo(
		() => ({
			event_id: eventId,
			...(statusFilter !== "all"
				? { status: statusFilter as ExhibitorBoothStatus }
				: {}),
			...(priceFilter !== "all"
				? { exhibitor_booth_price_id: Number(priceFilter) }
				: {}),
			...(zoneFilter !== "all"
				? { exhibitor_zone_id: Number(zoneFilter) }
				: {}),
		}),
		[eventId, priceFilter, statusFilter, zoneFilter],
	);

	const { data: booths = [], isLoading } = useQuery({
		queryKey: ["exhibitor-booths", boothFilters],
		queryFn: () => getExhibitorBooths(boothFilters),
		enabled: isOpen,
	});

	const invalidateBooths = () =>
		queryClient.invalidateQueries({ queryKey: ["exhibitor-booths"] });

	const createMutation = useMutation({
		mutationFn: createExhibitorBooth,
		onSuccess: () => {
			invalidateBooths();
			setSingleNumber("");
			toast.success("Booth added");
		},
		onError: async (error: unknown) =>
			toast.error(await extractErrorMessage(error)),
	});

	const bulkMutation = useMutation({
		mutationFn: bulkCreateExhibitorBooths,
		onSuccess: ({ booths: created }) => {
			invalidateBooths();
			setPastedNumbers("");
			toast.success(`${created.length} booths created`);
		},
		onError: async (error: unknown) => {
			const message = await extractErrorMessage(error);
			toast.error(`Nothing was created. ${message}`);
		},
	});

	const updateMutation = useMutation({
		mutationFn: updateExhibitorBooth,
		onSuccess: () => {
			invalidateBooths();
			toast.success("Booth updated");
		},
		onError: async (error: unknown) =>
			toast.error(await extractErrorMessage(error)),
	});

	const releaseMutation = useMutation({
		mutationFn: releaseExhibitorBooth,
		onSuccess: () => {
			invalidateBooths();
			toast.success("Booth released");
		},
		onError: async (error: unknown) =>
			toast.error(await extractErrorMessage(error)),
	});

	const deleteMutation = useMutation({
		mutationFn: deleteExhibitorBooth,
		onSuccess: () => {
			invalidateBooths();
			toast.success("Booth deleted");
		},
		onError: async (error: unknown) =>
			toast.error(await extractErrorMessage(error)),
	});

	React.useEffect(() => {
		if (!boothPriceId && boothPrices[0]) {
			setBoothPriceId(String(boothPrices[0].id));
		}
	}, [boothPriceId, boothPrices]);

	const rangePreview = React.useMemo(
		() =>
			generateBoothRange({
				prefix: rangePrefix,
				from: Number(rangeFrom),
				to: Number(rangeTo),
			}),
		[rangeFrom, rangePrefix, rangeTo],
	);
	const pastePreview = React.useMemo(
		() => parsePastedBoothNumbers(pastedNumbers),
		[pastedNumbers],
	);
	const bulkPreview = entryMode === "range" ? rangePreview : pastePreview;

	const pageCount = Math.max(1, Math.ceil(booths.length / PAGE_SIZE));
	const visibleBooths = booths.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

	const submitSingle = (event: React.FormEvent) => {
		event.preventDefault();
		if (!boothPriceId) {
			toast.error("Select a booth price");
			return;
		}
		createMutation.mutate({
			event_id: eventId,
			exhibitor_booth_price_id: Number(boothPriceId),
			number: singleNumber,
			status: entryStatus,
		});
	};

	const submitBulk = () => {
		if (!boothPriceId || bulkPreview.length === 0) {
			toast.error("Select a booth price and add at least one booth number");
			return;
		}
		bulkMutation.mutate({
			event_id: eventId,
			exhibitor_booth_price_id: Number(boothPriceId),
			numbers: bulkPreview,
			status: entryStatus,
		});
	};

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger asChild>{trigger}</DialogTrigger>
			<DialogContent className="flex h-[92vh] max-w-[96vw] flex-col gap-0 overflow-hidden rounded-none p-0 sm:max-w-[96vw]">
				<DialogHeader className="border-b px-6 py-5">
					<DialogTitle>Manage Exhibitor Booths</DialogTitle>
					<DialogDescription>
						Create and manage the physical booths exhibitors can reserve.
					</DialogDescription>
				</DialogHeader>

				<div className="grid min-h-0 flex-1 lg:grid-cols-[360px_minmax(0,1fr)]">
					<div className="overflow-y-auto border-r bg-muted/20 p-5">
						<div className="grid grid-cols-3 gap-1">
							{(["single", "range", "paste"] as EntryMode[]).map((mode) => (
								<Button
									key={mode}
									type="button"
									size="sm"
									variant={entryMode === mode ? "default" : "outline"}
									className="rounded-none"
									onClick={() => setEntryMode(mode)}
								>
									{mode === "single"
										? "Add booth"
										: mode === "range"
											? "Generate range"
											: "Paste numbers"}
								</Button>
							))}
						</div>

						<div className="mt-5 space-y-4">
							<div className="space-y-2">
								<Label>Booth price</Label>
								<Select value={boothPriceId} onValueChange={setBoothPriceId}>
									<SelectTrigger className="w-full rounded-none">
										<SelectValue placeholder="Select booth price" />
									</SelectTrigger>
									<SelectContent className="rounded-none">
										{boothPrices.map((price) => (
											<SelectItem key={price.id} value={String(price.id)}>
												{priceLabel(price)}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
							<div className="space-y-2">
								<Label>Status</Label>
								<Select
									value={entryStatus}
									onValueChange={(value) =>
										setEntryStatus(value as ExhibitorBoothStatus)
									}
								>
									<SelectTrigger className="w-full rounded-none">
										<SelectValue />
									</SelectTrigger>
									<SelectContent className="rounded-none">
										{STATUS_OPTIONS.map((status) => (
											<SelectItem key={status} value={status}>
												{statusLabel(status)}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							{entryMode === "single" && (
								<form className="space-y-4" onSubmit={submitSingle}>
									<div className="space-y-2">
										<Label htmlFor="booth-number">Booth number</Label>
										<Input
											id="booth-number"
											value={singleNumber}
											onChange={(event) => setSingleNumber(event.target.value)}
											placeholder="S045"
											className="rounded-none"
											required
										/>
									</div>
									<Button
										type="submit"
										className="w-full rounded-none"
										disabled={createMutation.isPending}
									>
										{createMutation.isPending && (
											<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										)}
										Add booth
									</Button>
								</form>
							)}

							{entryMode === "range" && (
								<div className="space-y-4">
									<div className="grid grid-cols-3 gap-2">
										<div className="space-y-2">
											<Label htmlFor="range-prefix">Prefix</Label>
											<Input
												id="range-prefix"
												value={rangePrefix}
												onChange={(event) => setRangePrefix(event.target.value)}
												placeholder="S"
												className="rounded-none"
											/>
										</div>
										<div className="space-y-2">
											<Label htmlFor="range-from">From</Label>
											<Input
												id="range-from"
												type="number"
												min="0"
												value={rangeFrom}
												onChange={(event) => setRangeFrom(event.target.value)}
												className="rounded-none"
											/>
										</div>
										<div className="space-y-2">
											<Label htmlFor="range-to">To</Label>
											<Input
												id="range-to"
												type="number"
												min="0"
												value={rangeTo}
												onChange={(event) => setRangeTo(event.target.value)}
												className="rounded-none"
											/>
										</div>
									</div>
								</div>
							)}

							{entryMode === "paste" && (
								<div className="space-y-2">
									<Label htmlFor="paste-numbers">Booth numbers</Label>
									<Textarea
										id="paste-numbers"
										value={pastedNumbers}
										onChange={(event) => setPastedNumbers(event.target.value)}
										placeholder={"S045, S046\nK101"}
										className="min-h-32 rounded-none"
									/>
								</div>
							)}

							{entryMode !== "single" && (
								<div className="space-y-3">
									<div className="rounded-none border bg-background p-3">
										<p className="font-medium text-sm">
											Preview ({bulkPreview.length})
										</p>
										<p className="mt-2 max-h-28 overflow-y-auto text-muted-foreground text-xs">
											{bulkPreview.length > 0
												? bulkPreview.join(", ")
												: "Add numbers to preview the all-or-nothing batch."}
										</p>
									</div>
									<Button
										type="button"
										className="w-full rounded-none"
										disabled={
											bulkMutation.isPending || bulkPreview.length === 0
										}
										onClick={submitBulk}
									>
										{bulkMutation.isPending && (
											<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										)}
										Create {bulkPreview.length || ""} booths
									</Button>
								</div>
							)}
						</div>
					</div>

					<div className="flex min-h-0 flex-col p-5">
						<div className="grid gap-2 border-b pb-4 sm:grid-cols-3">
							<Select
								value={zoneFilter}
								onValueChange={(value) => {
									setZoneFilter(value);
									setPage(1);
								}}
							>
								<SelectTrigger className="rounded-none">
									<SelectValue placeholder="All zones" />
								</SelectTrigger>
								<SelectContent className="rounded-none">
									<SelectItem value="all">All zones</SelectItem>
									{zones.map((zone) => (
										<SelectItem key={zone.id} value={String(zone.id)}>
											{zone.zone}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							<Select
								value={priceFilter}
								onValueChange={(value) => {
									setPriceFilter(value);
									setPage(1);
								}}
							>
								<SelectTrigger className="rounded-none">
									<SelectValue placeholder="All booth prices" />
								</SelectTrigger>
								<SelectContent className="rounded-none">
									<SelectItem value="all">All booth prices</SelectItem>
									{boothPrices.map((price) => (
										<SelectItem key={price.id} value={String(price.id)}>
											{priceLabel(price)}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							<Select
								value={statusFilter}
								onValueChange={(value) => {
									setStatusFilter(value);
									setPage(1);
								}}
							>
								<SelectTrigger className="rounded-none">
									<SelectValue placeholder="All statuses" />
								</SelectTrigger>
								<SelectContent className="rounded-none">
									<SelectItem value="all">All statuses</SelectItem>
									{STATUS_OPTIONS.map((status) => (
										<SelectItem key={status} value={status}>
											{statusLabel(status)}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						<div className="min-h-0 flex-1 overflow-auto">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Number</TableHead>
										<TableHead>Zone</TableHead>
										<TableHead>Booth type</TableHead>
										<TableHead>Label</TableHead>
										<TableHead>Status</TableHead>
										<TableHead>Held by</TableHead>
										<TableHead>Held since</TableHead>
										<TableHead className="text-right">Actions</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{isLoading ? (
										<TableRow>
											<TableCell colSpan={8} className="py-12 text-center">
												<Loader2 className="mx-auto h-5 w-5 animate-spin" />
											</TableCell>
										</TableRow>
									) : visibleBooths.length === 0 ? (
										<TableRow>
											<TableCell
												colSpan={8}
												className="py-12 text-center text-muted-foreground"
											>
												No booths match these filters.
											</TableCell>
										</TableRow>
									) : (
										visibleBooths.map((booth) => (
											<TableRow key={booth.id}>
												<TableCell className="font-medium">
													{booth.number}
												</TableCell>
												<TableCell>{booth.zone || "—"}</TableCell>
												<TableCell>
													{formatBoothType(booth.boothType)}
												</TableCell>
												<TableCell>{booth.label}</TableCell>
												<TableCell>
													<Badge variant="outline" className="rounded-none">
														{statusLabel(booth.status)}
													</Badge>
												</TableCell>
												<TableCell>{booth.heldBy || "—"}</TableCell>
												<TableCell>
													{booth.heldSince
														? new Date(booth.heldSince).toLocaleString()
														: "—"}
												</TableCell>
												<TableCell>
													<div className="flex justify-end gap-1">
														{booth.status === "reserved" && (
															<Button
																type="button"
																size="sm"
																variant="outline"
																className="h-8 rounded-none"
																onClick={() =>
																	releaseMutation.mutate({ id: booth.id })
																}
															>
																<RotateCcw className="mr-1 h-3.5 w-3.5" />
																Release
															</Button>
														)}
														{(booth.status === "available" ||
															booth.status === "blocked") && (
															<Button
																type="button"
																size="sm"
																variant="outline"
																className="h-8 rounded-none"
																onClick={() =>
																	updateMutation.mutate({
																		id: booth.id,
																		status:
																			booth.status === "blocked"
																				? "available"
																				: "blocked",
																	})
																}
															>
																{booth.status === "blocked" ? (
																	<CheckCircle2 className="mr-1 h-3.5 w-3.5" />
																) : (
																	<Ban className="mr-1 h-3.5 w-3.5" />
																)}
																{booth.status === "blocked"
																	? "Unblock"
																	: "Block"}
															</Button>
														)}
														{(booth.status === "available" ||
															booth.status === "blocked") && (
															<Button
																type="button"
																size="icon"
																variant="ghost"
																className="h-8 w-8 rounded-none text-destructive"
																onClick={() =>
																	deleteMutation.mutate({ id: booth.id })
																}
															>
																<Trash2 className="h-4 w-4" />
																<span className="sr-only">Delete</span>
															</Button>
														)}
													</div>
												</TableCell>
											</TableRow>
										))
									)}
								</TableBody>
							</Table>
						</div>

						<div className="flex items-center justify-between border-t pt-4 text-sm">
							<span className="text-muted-foreground">
								{booths.length} booths · Page {page} of {pageCount}
							</span>
							<div className="flex gap-1">
								<Button
									type="button"
									size="sm"
									variant="outline"
									className="rounded-none"
									disabled={page === 1}
									onClick={() => setPage((current) => Math.max(1, current - 1))}
								>
									<ChevronLeft className="h-4 w-4" />
									Previous
								</Button>
								<Button
									type="button"
									size="sm"
									variant="outline"
									className="rounded-none"
									disabled={page === pageCount}
									onClick={() =>
										setPage((current) => Math.min(pageCount, current + 1))
									}
								>
									Next
									<ChevronRight className="h-4 w-4" />
								</Button>
							</div>
						</div>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
