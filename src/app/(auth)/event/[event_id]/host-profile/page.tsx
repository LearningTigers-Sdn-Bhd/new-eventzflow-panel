"use client";

import { use, useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ErrorState, LoadingState } from "@/components/data-state";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/auth/use-auth";
import { useEventPermissions } from "@/hooks/use-event-permissions";
import { getEventById } from "@/lib/api/event";
import { getHostProfile, updateHostProfile } from "@/lib/api/business-matching";
import { IconTitle } from "@/components/admin-ui/icon-heading";
import { User, Tag, FileText } from "lucide-react";

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
	const [offeringTagsInput, setOfferingTagsInput] = useState("");
	const [interestTagsInput, setInterestTagsInput] = useState("");

	// Fetch host profile
	const { data: profile, isLoading, error } = useQuery({
		queryKey: ["host-profile", event_id],
		queryFn: () => getHostProfile(event_id),
		enabled: isInitialized && !!user && isBusinessHost,
	});

	// Sync state when data is loaded
	useEffect(() => {
		if (profile) {
			setDescription(profile.description || "");
			setSourcingIntent(profile.sourcing_intent || "");
			setCapabilities(profile.capabilities || "");
			setOfferingTagsInput((profile.offering_tags || []).join(", "));
			setInterestTagsInput((profile.interest_tags || []).join(", "));
		}
	}, [profile]);

	const updateMutation = useMutation({
		mutationFn: (data: Parameters<typeof updateHostProfile>[1]) => updateHostProfile(event_id, data),
		onSuccess: (updatedProfile) => {
			queryClient.setQueryData(["host-profile", event_id], updatedProfile);
			queryClient.invalidateQueries({ queryKey: ["business-matching-events", event_id] });
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

		// Parse tags from comma-separated input
		const offering_tags = offeringTagsInput
			.split(",")
			.map((t) => t.trim())
			.filter((t) => t.length > 0);
		const interest_tags = interestTagsInput
			.split(",")
			.map((t) => t.trim())
			.filter((t) => t.length > 0);

		updateMutation.mutate({
			description,
			sourcing_intent: sourcingIntent,
			capabilities,
			offering_tags,
			interest_tags,
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
		<div className="space-y-6 max-w-4xl mx-auto py-2 px-4">
			<div className="page-header border-b pb-4 mb-4">
				<IconTitle
					icon={User}
					title="My Host Profile"
					description="Configure your capabilities, intent, and tags for business matchmaking."
				/>
			</div>

			<form onSubmit={handleSubmit} className="space-y-6">
				<Card className="border border-dashed shadow-none">
					<CardHeader>
						<CardTitle className="flex items-center gap-2 text-lg">
							<FileText className="h-5 w-5 text-primary" />
							Profile Information
						</CardTitle>
						<CardDescription>
							These details will be displayed to matching buyers and sellers when they click your name.
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
							<span className="text-xs text-muted-foreground">
								Brief summary of your professional background or organization's focus.
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
							<span className="text-xs text-muted-foreground">
								Help matching attendees understand exactly who or what you are looking to source.
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
							<span className="text-xs text-muted-foreground">
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
							Tags are used by the matching algorithm to score compatibility between you and visitors.
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="grid gap-2">
							<Label htmlFor="offeringTags" className="font-semibold text-sm">
								Offering Tags (Comma-separated)
							</Label>
							<Input
								id="offeringTags"
								value={offeringTagsInput}
								onChange={(e) => setOfferingTagsInput(e.target.value)}
								placeholder="SaaS Core, Generative AI, IoT, Cybersecurity"
							/>
							<span className="text-xs text-muted-foreground">
								Tags describing what you offer. Separate multiple tags with a comma.
							</span>
						</div>

						<div className="grid gap-2 border-t pt-4">
							<Label htmlFor="interestTags" className="font-semibold text-sm">
								Interest Tags (Comma-separated)
							</Label>
							<Input
								id="interestTags"
								value={interestTagsInput}
								onChange={(e) => setInterestTagsInput(e.target.value)}
								placeholder="Enterprise Clients, Distributors, Direct Buyers"
							/>
							<span className="text-xs text-muted-foreground">
								Tags describing what you are looking for. Separate multiple tags with a comma.
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
