"use client";

import {
	AlertCircle,
	Camera,
	CameraOff,
	CheckCircle2,
	QrCode,
	Trash2,
	User,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useDrawScanner } from "@/hooks/surprise/roulette/use-draw-scanner";
import { getRouletteWinners } from "@/lib/api/roulette";
import type {
	RouletteParticipant,
	RouletteWinner,
} from "@/lib/api/roulette/response";
import { useRouletteParticipantQueueStore } from "@/stores/roulette-participant-queue-store";

interface DrawScannerDialogProps {
	eventId: string;
	sessionId: number;
	drawCounts: number;
	isMultiple?: boolean;
	onConfirmDraw?: (participant: RouletteParticipant) => void;
	onClose: () => void;
	onScanSuccess?: () => void;
}

export function DrawScannerDialog({
	eventId,
	sessionId,
	drawCounts,
	isMultiple = false,
	onConfirmDraw,
	onClose,
	onScanSuccess,
}: DrawScannerDialogProps) {
	const { queue, addParticipant } = useRouletteParticipantQueueStore();
	const [winners, setWinners] = useState<RouletteWinner[]>([]);

	// Fetch existing winners when dialog opens
	useEffect(() => {
		let isMounted = true;

		const fetchWinners = async () => {
			try {
				const fetchedWinners = await getRouletteWinners(eventId, sessionId);
				if (isMounted) {
					setWinners(fetchedWinners);
				}
			} catch (error) {
				console.error("Failed to fetch winners:", error);
				// Continue even if fetch fails - backend validation will catch duplicates
			}
		};

		fetchWinners();

		return () => {
			isMounted = false;
		};
	}, [eventId, sessionId]);

	// Create a set of winner IDs for quick lookup
	const winnerIds = useMemo(() => {
		const ids = new Set<number>();
		winners.forEach((winner) => {
			if (winner.ticket_id !== null) {
				ids.add(winner.ticket_id);
			}
			if (winner.visitor_id !== null) {
				ids.add(winner.visitor_id);
			}
		});
		return ids;
	}, [winners]);

	const validateScan = useCallback(
		(participant: RouletteParticipant) => {
			// Check if already in queue
			const isInQueue = queue.some(
				(item) => item.participant.publicId === participant.publicId,
			);
			if (isInQueue) {
				return "This participant is already in the queue.";
			}

			// Only check for duplicate winners if is_multiple is false
			// When is_multiple is true, same participant can win multiple times
			if (!isMultiple && winnerIds.has(participant.id)) {
				return `${participant.name} has already won a prize in this session.`;
			}

			return null;
		},
		[queue, winnerIds, isMultiple],
	);

	const {
		scannerId,
		isScanning,
		isTransitioning,
		scannedParticipants,
		scanError,
		startScanner,
		stopScanner,
		clearScanned,
		removeScanned,
		retry,
	} = useDrawScanner({
		eventId,
		sessionId,
		validateScan,
	});

	const handleConfirmDraw = useCallback(() => {
		if (scannedParticipants.length > 0) {
			// Add all to queue store
			for (const participant of scannedParticipants) {
				addParticipant(participant, drawCounts);
				// Call optional callback per participant if needed
				if (onConfirmDraw) {
					onConfirmDraw(participant);
				}
			}

			// Clear scanned participants
			clearScanned();

			// Handle success (close dialog and open sheet)
			if (onScanSuccess) {
				onScanSuccess();
			} else {
				onClose();
			}
		}
	}, [
		scannedParticipants,
		drawCounts,
		addParticipant,
		clearScanned,
		onConfirmDraw,
		onScanSuccess,
		onClose,
	]);

	// Handle Enter key for confirm
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Enter" && scannedParticipants.length > 0) {
				handleConfirmDraw();
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => {
			window.removeEventListener("keydown", handleKeyDown);
		};
	}, [scannedParticipants, handleConfirmDraw]);

	return (
		<div className="flex h-full w-full flex-col gap-6 p-6">
			{/* Content - Grid Layout */}
			<div className="grid flex-1 grid-cols-1 gap-6 overflow-hidden md:grid-cols-2">
				{/* Left Side - Scanner */}
				<div className="flex flex-col gap-6 overflow-auto">
					<Card className="rounded-none">
						<CardHeader>
							<CardTitle>Scan Participant</CardTitle>
							<CardDescription>
								Scan participant QR code to add to queue
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							{/* QR Scanner */}
							<div className="relative flex items-center justify-center">
								<div
									id={scannerId}
									className="aspect-square w-full max-w-sm rounded-none"
									style={{
										position: "relative",
										overflow: "hidden",
									}}
								/>

								{/* Camera Off State */}
								{!isScanning && (
									<div className="absolute inset-0 flex items-center justify-center rounded-none border border-primary/30 border-dashed">
										<div className="max-w-sm space-y-4 px-4 text-center">
											<div className="inline-flex rounded-none border border-primary/10 bg-primary/5 p-6">
												<QrCode className="h-16 w-16 text-primary/60" />
											</div>
											<div className="space-y-2">
												<h3 className="font-semibold text-foreground text-xl">
													Ready to Scan
												</h3>
												<p className="text-muted-foreground text-sm leading-relaxed">
													Click the button below to activate your camera
												</p>
											</div>
											<Button
												onClick={startScanner}
												size="lg"
												className="w-full gap-2 rounded-none"
												disabled={isTransitioning}
											>
												<Camera className="h-4 w-4" />
												Activate Scanner
											</Button>
										</div>
									</div>
								)}

								{/* Active Scanning Overlay */}
								{isScanning && (
									<>
										<div className="absolute top-4 left-1/2 z-20 -translate-x-1/2">
											<div className="flex items-center gap-2 rounded-full bg-primary px-3 py-1.5 shadow-lg">
												<span className="relative flex h-2 w-2">
													<span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
													<span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
												</span>
												<span className="font-medium text-primary-foreground text-xs">
													Scanning Active
												</span>
											</div>
										</div>
										<div className="absolute bottom-4 left-1/2 z-20 w-full -translate-x-1/2 px-4">
											<Button
												onClick={stopScanner}
												variant="destructive"
												size="default"
												className="w-full gap-2 rounded-none shadow-lg"
												disabled={isTransitioning}
											>
												<CameraOff className="h-4 w-4" />
												Stop Scanner
											</Button>
										</div>
									</>
								)}
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Right Side - Scanned Participants List */}
				<div className="flex flex-col gap-4 overflow-hidden">
					<Card className="flex h-full flex-col rounded-none">
						<CardHeader>
							<CardTitle>
								Scanned Participants ({scannedParticipants.length})
							</CardTitle>
							<CardDescription>
								List of participants ready to be added to queue
							</CardDescription>
						</CardHeader>
						<CardContent className="flex-1 overflow-hidden p-0">
							{/* Error State */}
							{scanError && (
								<div className="border-b border-destructive/50 bg-destructive/10 p-4">
									<div className="flex items-start gap-3">
										<AlertCircle className="mt-0.5 h-5 w-5 text-destructive" />
										<div className="flex-1">
											<p className="font-medium text-destructive text-sm">
												Scan Error
											</p>
											<p className="text-muted-foreground text-sm">
												{scanError}
											</p>
										</div>
										<Button
											variant="outline"
											size="sm"
											onClick={retry}
											className="h-auto border-destructive/50 py-1 text-destructive hover:bg-destructive/20"
										>
											Dismiss
										</Button>
									</div>
								</div>
							)}

							{scannedParticipants.length === 0 ? (
								<div className="flex h-full items-center justify-center p-6">
									<p className="text-center text-muted-foreground text-sm">
										Scan participants to see them here.
									</p>
								</div>
							) : (
								<ScrollArea className="h-full">
									<div className="flex flex-col gap-3 p-4">
										{scannedParticipants.map((participant, index) => (
											<Card
												key={`${participant.publicId}-${index}`}
												className="rounded-none border-primary/10 bg-primary/5"
											>
												<CardContent className="flex items-center justify-between gap-4 p-4">
													<div className="flex items-center gap-3">
														<div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
															<User className="h-5 w-5 text-primary" />
														</div>
														<div className="flex-1">
															<p className="font-bold text-sm">
																{participant.name}
															</p>
															<div className="mt-0.5 flex items-center gap-2">
																<Badge
																	variant="outline"
																	className="h-4 rounded-none px-1 text-[10px]"
																>
																	{participant.type === "ticket"
																		? "Ticket"
																		: "Visitor"}
																</Badge>
																<span className="text-muted-foreground text-xs">
																	{participant.publicId.slice(0, 8)}...
																</span>
															</div>
														</div>
													</div>
													<Button
														variant="ghost"
														size="sm"
														onClick={() => removeScanned(index)}
														className="h-8 w-8 rounded-none p-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
													>
														<Trash2 className="h-4 w-4" />
													</Button>
												</CardContent>
											</Card>
										))}
									</div>
								</ScrollArea>
							)}
						</CardContent>
					</Card>
				</div>
			</div>

			{/* Footer Actions */}
			<div className="flex items-center justify-end gap-4 border-t pt-4">
				<Button variant="outline" onClick={onClose} className="rounded-none">
					Cancel
				</Button>
				<Button
					onClick={handleConfirmDraw}
					disabled={scannedParticipants.length === 0}
					className="gap-2 rounded-none"
					size="lg"
				>
					<CheckCircle2 className="h-4 w-4" />
					Add {scannedParticipants.length}{" "}
					{scannedParticipants.length === 1 ? "Participant" : "Participants"} to
					Queue (Enter)
				</Button>
			</div>
		</div>
	);
}
