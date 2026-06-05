"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { HTTPError } from "ky";
import { Camera, QrCode, Scan } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { IconTitle } from "@/components/admin-ui/icon-heading";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/auth/use-auth";
import { useScanner } from "@/hooks/use-scanner";
import type { EventLeadWithDetails } from "@/lib/api/event-lead";
import {
	createGlobalLead as createGlobalLeadApi,
	getRecentGlobalLeads,
} from "@/lib/api/event-lead";

const SCANNER_ID = "main-lead-scan-scanner";
const DUPLICATE_SCAN_COOLDOWN = 5000;
const LATEST_SCAN_LIMIT = 10;

async function extractApiError(error: unknown): Promise<{
	message: string;
	code: string;
}> {
	// ky HTTP errors expose response body through error.response
	if (error instanceof HTTPError) {
		try {
			const body = (await error.response.clone().json()) as {
				message?: string;
				error?: string;
				code?: string;
			};
			return {
				message: body.message || body.error || "",
				code: body.code || "",
			};
		} catch {
			return { message: error.message || "", code: "" };
		}
	}

	const fallback = error as {
		response?: { data?: { message?: string; code?: string; error?: string } };
		message?: string;
	};
	return {
		message:
			fallback?.response?.data?.message ||
			fallback?.response?.data?.error ||
			fallback?.message ||
			"",
		code: fallback?.response?.data?.code || "",
	};
}

export default function LeadScanPageContent() {
	const { user } = useAuth();
	const queryClient = useQueryClient();
	const createGlobalLeadMutation = useMutation({
		mutationFn: createGlobalLeadApi,
		onSuccess: (lead) => {
			const eventId = String(lead.event_vendor.event_id);
			queryClient.invalidateQueries({ queryKey: ["event-leads", eventId] });
			queryClient.invalidateQueries({ queryKey: ["lead-analytics"] });
		},
	});
	const recentScansRef = useRef<Map<string, number>>(new Map());
	const [isScanning, setIsScanning] = useState(false);
	const [recentLeadsPreview, setRecentLeadsPreview] = useState<
		Array<{
			id: string;
			name: string;
			eventName: string;
			at: string;
			alreadyCaptured: boolean;
		}>
	>([]);
	const isAllowedRole = user?.role === "vendor" || user?.role === "exhibitor";

	const { data: recentLeadsDb = [] } = useQuery<EventLeadWithDetails[]>({
		queryKey: ["global-lead-history"],
		queryFn: () => getRecentGlobalLeads(LATEST_SCAN_LIMIT),
		enabled: isAllowedRole,
	});

	const handleScanSuccess = async (decodedText: string) => {
		if (createGlobalLeadMutation.isPending) return;

		const now = Date.now();
		const lastScanTime = recentScansRef.current.get(decodedText);
		if (lastScanTime && now - lastScanTime < DUPLICATE_SCAN_COOLDOWN) {
			return;
		}
		recentScansRef.current.set(decodedText, now);

		for (const [key, timestamp] of recentScansRef.current.entries()) {
			if (now - timestamp > DUPLICATE_SCAN_COOLDOWN) {
				recentScansRef.current.delete(key);
			}
		}

		try {
			const lead = await createGlobalLeadMutation.mutateAsync({
				public_id: decodedText,
			});
			const scannedAt = new Date().toLocaleTimeString();
			const eventName = lead.event_vendor.event_name || "Unknown Event";
			setRecentLeadsPreview((prev) =>
				[
					{
						id: lead.lead.public_id || decodedText,
						name: lead.lead.name || "Attendee",
						eventName: eventName,
						at: scannedAt,
						alreadyCaptured: !!lead.already_captured,
					},
					...prev,
				].slice(0, LATEST_SCAN_LIMIT),
			);
			queryClient.invalidateQueries({ queryKey: ["global-lead-history"] });

			if (lead.already_captured) {
				toast.warning(
					`Already captured: ${lead.lead.name || "Attendee"} (${eventName})`,
				);
			} else {
				toast.success(
					`Lead captured: ${lead.lead.name || "Attendee"} (${eventName})`,
				);
			}
		} catch (error: unknown) {
			const { message: errorMsg, code: errorCode } =
				await extractApiError(error);
			const normalizedErrorMsg = errorMsg.toLowerCase();
			if (errorMsg === "You are not authorized to scan this ticket.") {
				toast.error("You are not authorized to scan this ticket.");
				return;
			}
			if (
				errorCode === "event_leads_disabled" ||
				normalizedErrorMsg.includes("lead scan is disabled for this event") ||
				normalizedErrorMsg.includes(
					"event leads feature is not enabled for this event",
				)
			) {
				toast.error("Lead scan is disabled for this event.");
				return;
			}

			if (
				errorMsg.includes("not match any attendee") ||
				errorMsg.includes("not found")
			) {
				toast.error("Ticket not found.");
				return;
			}

			toast.error("Failed to scan ticket. Please try again.");
		}
	};

	const { startScanner, stopScanner } = useScanner({
		scannerId: SCANNER_ID,
		onScanSuccess: handleScanSuccess,
	});

	const handleToggleCamera = async () => {
		if (isScanning) {
			const stopped = await stopScanner();
			if (stopped) {
				setIsScanning(false);
			}
			return;
		}

		const started = await startScanner();
		if (started) {
			setIsScanning(true);
		}
	};

	useEffect(() => {
		return () => {
			if (isScanning) {
				stopScanner().catch(() => undefined);
			}
		};
	}, [isScanning, stopScanner]);

	if (!isAllowedRole) {
		return (
			<div className="p-0">
				<div className="page-header border-b border-dashed">
					<div className="px-3 sm:px-4">
						<IconTitle
							icon={QrCode}
							title="Lead Scan"
							description="Global lead scan for assigned vendors/exhibitors"
						/>
					</div>
				</div>
				<div className="p-3 sm:p-4">
					<Card className="rounded-none border-dashed p-6 text-center">
						<h3 className="font-semibold text-base">Access denied</h3>
						<p className="mt-2 text-muted-foreground text-sm">
							You do not have permission to use Lead Scan.
						</p>
					</Card>
				</div>
			</div>
		);
	}

	return (
		<div className="p-0">
			<div className="page-header border-b border-dashed">
				<div className="px-3 sm:px-4">
					<IconTitle
						icon={QrCode}
						title="Lead Scan"
						description="Scan attendee tickets and auto-capture leads for assigned events"
					/>
				</div>
			</div>

			<div className="space-y-4 p-3 sm:p-4">
				<div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-2">
					<Card className="self-start overflow-hidden rounded-none border-primary/20 border-x-0 border-y border-dashed bg-accent p-2 shadow-none sm:p-4">
						<div className="mx-auto w-full max-w-md">
							<div className="relative aspect-square w-full rounded-none bg-white">
								<div id={SCANNER_ID} className="h-full w-full" />
								{!isScanning && (
									<div className="absolute inset-0 flex flex-col items-center justify-center rounded-none border border-primary/30 border-dashed">
										<div className="max-w-sm space-y-4 px-3 text-center sm:space-y-6 sm:px-4">
											<div className="inline-flex rounded-none border border-primary/10 bg-primary/5 p-4 sm:p-6">
												<QrCode className="h-12 w-12 text-primary/60 sm:h-16 sm:w-16" />
											</div>
											<div className="space-y-1 sm:space-y-2">
												<h3 className="font-semibold text-foreground text-lg sm:text-xl">
													Scanner Ready
												</h3>
												<p className="text-muted-foreground text-xs leading-relaxed sm:text-sm">
													Activate your camera to scan OR simply scan with your
													physical hardware scanner anytime
												</p>
											</div>
											<Button
												onClick={handleToggleCamera}
												size="lg"
												className="w-full gap-2 rounded-none sm:w-auto"
											>
												<Camera className="h-4 w-4" />
												Activate Camera
											</Button>
										</div>
										<div className="absolute bottom-4 flex items-center gap-2 text-muted-foreground text-xs italic">
											<Scan className="h-3 w-3" />
											Hardware scanner active
										</div>
									</div>
								)}
							</div>
						</div>
						{isScanning && (
							<div className="mt-4">
								<Button
									type="button"
									variant="destructive"
									onClick={handleToggleCamera}
									className="w-full rounded-none"
								>
									Stop Camera
								</Button>
							</div>
						)}
					</Card>
					<Card className="self-start rounded-none border-dashed p-4">
						<h3 className="mb-3 font-semibold text-sm">
							Latest Scan Lead History
						</h3>
						<div className="space-y-2">
							{recentLeadsPreview.length === 0 && recentLeadsDb.length === 0 ? (
								<p className="text-muted-foreground text-sm">
									No leads scanned yet.
								</p>
							) : (
								[
									...recentLeadsPreview.map((lead) => ({
										key: `preview-${lead.id}-${lead.at}`,
										name: lead.name,
										eventName: lead.eventName,
										at: lead.at,
										alreadyCaptured: lead.alreadyCaptured,
									})),
									...recentLeadsDb.map((lead) => ({
										key: `db-${lead.id}`,
										name: lead.lead_name || "Attendee",
										eventName: lead.event_name || "Unknown Event",
										at: new Date(lead.created_at).toLocaleTimeString(),
										alreadyCaptured: false,
									})),
								]
									.slice(0, LATEST_SCAN_LIMIT)
									.map((lead) => (
										<div
											key={lead.key}
											className="rounded-none border border-dashed p-2"
										>
											<div className="font-medium text-sm">{lead.name}</div>
											<div className="text-muted-foreground text-xs">
												{lead.eventName} • {lead.at}
											</div>
											<div className="text-xs">
												{lead.alreadyCaptured ? "Already captured" : "Captured"}
											</div>
										</div>
									))
							)}
						</div>
					</Card>
				</div>
			</div>
		</div>
	);
}
