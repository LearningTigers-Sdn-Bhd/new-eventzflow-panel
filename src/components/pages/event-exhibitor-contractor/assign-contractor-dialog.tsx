"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { HardHat, Loader2, Check, Building2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { getContractors } from "@/lib/api/contractor";
import { assignEventExhibitionContractor } from "@/lib/api/event-exhibition-contractor";

interface AssignContractorDialogProps {
	eventId: number;
	onClose?: () => void;
}

export function AssignContractorDialog({ eventId, onClose }: AssignContractorDialogProps) {
	const queryClient = useQueryClient();
	const [selectedContractorId, setSelectedContractorId] = useState<number | null>(null);

	// Fetch all contractors
	const { data: contractors, isLoading } = useQuery({
		queryKey: ["contractors"],
		queryFn: () => getContractors(),
	});

	// Filter only active contractors
	const activeContractors = contractors?.filter((c) => c.status === "active") || [];

	// Assign contractor mutation
	const assignMutation = useMutation({
		mutationFn: (profileId: number) =>
			assignEventExhibitionContractor(eventId, {
				exhibition_contractor_profile_id: profileId,
			}),
		onSuccess: () => {
			toast.success("Exhibitor contractor assigned successfully!");
			queryClient.invalidateQueries({
				queryKey: ["event", String(eventId), "exhibition-contractor"],
			});
			onClose?.();
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to assign contractor");
		},
	});

	const handleAssign = () => {
		if (!selectedContractorId) {
			toast.error("Please select a contractor");
			return;
		}
		assignMutation.mutate(selectedContractorId);
	};

	if (isLoading) {
		return (
			<div className="flex h-48 items-center justify-center">
				<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
			</div>
		);
	}

	if (activeContractors.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center gap-4 py-8 text-center">
				<HardHat className="h-12 w-12 text-muted-foreground" />
				<div>
					<p className="font-medium">No Active Contractors</p>
					<p className="text-sm text-muted-foreground">
						There are no active exhibitor contractors available. Please add contractors from the Exhibitor Contractors page first.
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			<ScrollArea className="h-[300px] pr-4">
				<div className="space-y-2">
					{activeContractors.map((contractor) => {
						const profile = contractor.exhibition_contractor_profile;
						const isSelected = selectedContractorId === profile?.id;

						return (
							<button
								key={contractor.id}
								type="button"
								onClick={() => setSelectedContractorId(profile?.id || null)}
								className={cn(
									"w-full rounded-none border border-dashed p-4 text-left transition-colors",
									isSelected
										? "border-primary bg-primary/5"
										: "hover:border-muted-foreground/50 hover:bg-muted/30"
								)}
							>
								<div className="flex items-start justify-between gap-3">
									<div className="flex items-start gap-3">
										<div className={cn(
											"flex h-10 w-10 shrink-0 items-center justify-center rounded-none",
											isSelected ? "bg-primary/10" : "bg-muted"
										)}>
											<Building2 className={cn(
												"h-5 w-5",
												isSelected ? "text-primary" : "text-muted-foreground"
											)} />
										</div>
										<div className="space-y-1">
											<p className="font-medium">
												{profile?.company_name || contractor.full_name}
											</p>
											{profile?.contact_person && (
												<p className="text-sm text-muted-foreground">
													{profile.contact_person}
												</p>
											)}
											<p className="text-xs text-muted-foreground">
												{profile?.contact_email || contractor.email}
											</p>
										</div>
									</div>
									{isSelected && (
										<div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary">
											<Check className="h-4 w-4 text-primary-foreground" />
										</div>
									)}
								</div>
							</button>
						);
					})}
				</div>
			</ScrollArea>

			<div className="flex justify-end gap-2 border-t pt-4">
				<Button
					variant="outline"
					onClick={onClose}
					className="rounded-none"
				>
					Cancel
				</Button>
				<Button
					onClick={handleAssign}
					disabled={!selectedContractorId || assignMutation.isPending}
					className="rounded-none"
				>
					{assignMutation.isPending && (
						<Loader2 className="mr-2 h-4 w-4 animate-spin" />
					)}
					Assign Contractor
				</Button>
			</div>
		</div>
	);
}

