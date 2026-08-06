"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FileText, Tag } from "lucide-react";
import { use, useEffect, useState } from "react";
import { toast } from "sonner";
import { ErrorState, LoadingState } from "@/components/data-state";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { MultiSelectLegacy } from "@/components/ui/multi-select";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/auth/use-auth";
import { useBusinessMatchingTags } from "@/hooks/use-business-matching";
import { useEventPermissions } from "@/hooks/use-event-permissions";
import { getHostProfile, updateHostProfile } from "@/lib/api/business-matching";
import { getEventById } from "@/lib/api/event";

export default function HostProfilePage({
	params,
}: {
	params: Promise<{ event_id: string }>;
}) {
	const { event_id } = use(params);
	const { user, isInitialized } = useAuth();
	const queryClient = useQueryClient();

	// Fetch event details to check for host status
	const { data: event, isLoading: isEventLoading } = useQuery({
		queryKey: ["event", event_id],
		queryFn: () => getEventById(event_id),
		enabled: isInitialized && !!user,
	});

	const { isBusinessHost } = useEventPermissions(event_id, event);

	const [description, setDescription] = useState("");
	const [sourcingIntent, setSourcingIntent] = useState("");
	const [capabilities, setCapabilities] = useState("");
	const [offeringTags, setOfferingTags] = useState<string[]>([]);
	const [interestTags, setInterestTags] = useState<string[]>([]);

	// Fetch host profile
	const {
		data: profile,
		isLoading,
		error,
	} = useQuery({
		queryKey: ["host-profile", event_id],
		queryFn: () => getHostProfile(event_id),
		enabled: isInitialized && !!user && isBusinessHost,
	});

	// Fetch the event's admin-curated tag list — hosts may only pick from this
	const { data: availableTags, isLoading: isTagsLoading } =
		useBusinessMatchingTags(event_id);

	// Sync state when data is loaded
	useEffect(() => {
		if (profile) {
			setDescription(profile.description || "");
			setSourcingIntent(profile.sourcing_intent || "");
			setCapabilities(profile.capabilities || "");
			setOfferingTags(profile.offering_tags || []);
			setInterestTags(profile.interest_tags || []);
		}
	}, [profile]);

	const updateMutation = useMutation({
		mutationFn: (data: Parameters<typeof updateHostProfile>[1]) =>
			updateHostProfile(event_id, data),
		onSuccess: (updatedProfile) => {
			queryClient.setQueryData(["host-profile", event_id], updatedProfile);
			queryClient.invalidateQueries({
				queryKey: ["business-matching-events", event_id],
			});
			toast.success("Host profile updated successfully!");
		},
		onError: (err: any) => {
			toast.error("Failed to update host profile", {
				description: err.message || "Please check your inputs and try again.",
			});
		},
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		updateMutation.mutate({
			description,
			sourcing_intent: sourcingIntent,
			capabilities,
			offering_tags: offeringTags,
			interest_tags: interestTags,
		});
	};

	// Enforce page authorization
	if (isInitialized && !isEventLoading && event && !isBusinessHost) {
		return (
			<ErrorState
				title="Access Denied"
				description="This page is only accessible to designated business hosts."
				action={<Button onClick={() => window.history.back()}>Go Back</Button>}
			/>
		);
	}

	if (!isInitialized || isLoading || isEventLoading) {
		return (
			<LoadingState
				title="Loading Profile..."
				description="Please wait while we load your host details."
			/>
		);
	}

	if (error) {
		return (
			<ErrorState
				title="Failed to load profile"
				description="Could not load your business matching details. Please try again."
				action={<Button onClick={() => window.location.reload()}>Retry</Button>}
			/>
		);
	}

	return (
		<div className="mx-auto max-w-4xl space-y-6 px-4 py-2">
			<form onSubmit={handleSubmit} className="space-y-6">
				<Card className="border border-dashed shadow-none">
					<CardHeader>
						<CardTitle className="flex items-center gap-2 text-lg">
							<FileText className="h-5 w-5 text-primary" />
							Profile Information
						</CardTitle>
						<CardDescription>
							These details will be displayed to matching buyers and sellers
							when they click your name.
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="grid gap-2">
							<Label htmlFor="description" className="font-semibold text-sm">
								Bio / Description
							</Label>
							<Textarea
								id="description"
								value={description}
								onChange={(e) => setDescription(e.target.value)}
								placeholder="Describe yourself or your company..."
								rows={4}
								className="resize-y"
							/>
							<span className="text-muted-foreground text-xs">
								Brief summary of your professional background or organization's
								focus.
							</span>
						</div>

						<div className="grid gap-2 border-t pt-4">
							<Label htmlFor="sourcingIntent" className="font-semibold text-sm">
								Sourcing Intent
							</Label>
							<Textarea
								id="sourcingIntent"
								value={sourcingIntent}
								onChange={(e) => setSourcingIntent(e.target.value)}
								placeholder="What solutions or partners are you looking for?"
								rows={3}
								className="resize-y"
							/>
							<span className="text-muted-foreground text-xs">
								Help matching attendees understand exactly who or what you are
								looking to source.
							</span>
						</div>

						<div className="grid gap-2 border-t pt-4">
							<Label htmlFor="capabilities" className="font-semibold text-sm">
								Capabilities
							</Label>
							<Textarea
								id="capabilities"
								value={capabilities}
								onChange={(e) => setCapabilities(e.target.value)}
								placeholder="What are your core strengths or offerings?"
								rows={3}
								className="resize-y"
							/>
							<span className="text-muted-foreground text-xs">
								List your systems, products, capabilities, or core solutions.
							</span>
						</div>
					</CardContent>
				</Card>

				<Card className="border border-dashed shadow-none">
					<CardHeader>
						<CardTitle className="flex items-center gap-2 text-lg">
							<Tag className="h-5 w-5 text-primary" />
							Categories & Matching Tags
						</CardTitle>
						<CardDescription>
							Tags are used by the matching algorithm to score compatibility
							between you and visitors.
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="grid gap-2">
							<Label htmlFor="offeringTags" className="font-semibold text-sm">
								Offering Tags
							</Label>
							<MultiSelectLegacy
								options={(availableTags?.offering_tags || []).map((t) => ({
									label: t,
									value: t,
								}))}
								selected={offeringTags}
								onChange={setOfferingTags}
								placeholder={
									isTagsLoading
										? "Loading tags..."
										: (availableTags?.offering_tags || []).length === 0
											? "No tags configured yet by the event admin"
											: "Select offering tags"
								}
							/>
							<span className="text-muted-foreground text-xs">
								Tags describing what you offer, chosen from the event's approved
								list.
							</span>
						</div>

						<div className="grid gap-2 border-t pt-4">
							<Label htmlFor="interestTags" className="font-semibold text-sm">
								Interest Tags
							</Label>
							<MultiSelectLegacy
								options={(availableTags?.interest_tags || []).map((t) => ({
									label: t,
									value: t,
								}))}
								selected={interestTags}
								onChange={setInterestTags}
								placeholder={
									isTagsLoading
										? "Loading tags..."
										: (availableTags?.interest_tags || []).length === 0
											? "No tags configured yet by the event admin"
											: "Select interest tags"
								}
							/>
							<span className="text-muted-foreground text-xs">
								Tags describing what you are looking for, chosen from the
								event's approved list.
							</span>
						</div>
					</CardContent>
				</Card>

				<div className="flex justify-end gap-3 border-t pt-4">
					<Button
						type="submit"
						disabled={updateMutation.isPending}
						className="min-w-[120px]"
					>
						{updateMutation.isPending ? "Saving..." : "Save Profile"}
					</Button>
				</div>
			</form>
		</div>
	);
}
