"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FileText, ImageIcon, Tag } from "lucide-react";
import { use, useEffect, useState } from "react";
import { toast } from "sonner";
import { ErrorState, LoadingState } from "@/components/data-state";
import ImageUpload from "@/components/file-upload/image-upload";
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
import { uploadFile } from "@/lib/api/upload/endpoints";
import { PROFILE_TEXT_FIELD_MAX_LENGTH } from "@/lib/constants/business-matching-constants";
import { API_BASE_URL } from "@/utils/rest-api";

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
	const [avatarFile, setAvatarFile] = useState<File | null>(null);
	const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

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

	const tagsLocked = profile?.tags_editable === false;

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

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		let avatarSignedId: string | undefined;
		if (avatarFile) {
			setIsUploadingAvatar(true);
			try {
				const uploaded = await uploadFile(avatarFile, "general");
				avatarSignedId = uploaded.signed_id;
			} catch (err) {
				toast.error("Failed to upload photo", {
					description:
						err instanceof Error ? err.message : "Please try again.",
				});
				setIsUploadingAvatar(false);
				return;
			}
			setIsUploadingAvatar(false);
		}

		updateMutation.mutate({
			description,
			sourcing_intent: sourcingIntent,
			capabilities,
			...(tagsLocked
				? {}
				: { offering_tags: offeringTags, interest_tags: interestTags }),
			...(avatarSignedId ? { avatar_signed_id: avatarSignedId } : {}),
		});
		setAvatarFile(null);
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
							<ImageIcon className="h-5 w-5 text-primary" />
							Profile Photo
						</CardTitle>
						<CardDescription>
							Take a photo or upload one to help buyers and sellers recognize
							you.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<ImageUpload
							value={
								avatarFile ??
								(profile?.avatar_url
									? `${API_BASE_URL}${profile.avatar_url}`
									: undefined)
							}
							onChange={setAvatarFile}
							maxSize={5 * 1024 * 1024}
							className="max-w-xs"
						/>
					</CardContent>
				</Card>

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
								maxLength={PROFILE_TEXT_FIELD_MAX_LENGTH}
								className="resize-y"
							/>
							<div className="flex items-center justify-between">
								<span className="text-muted-foreground text-xs">
									Brief summary of your professional background or
									organization's focus.
								</span>
								<span className="shrink-0 text-muted-foreground text-xs">
									{description.length}/{PROFILE_TEXT_FIELD_MAX_LENGTH}
								</span>
							</div>
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
								maxLength={PROFILE_TEXT_FIELD_MAX_LENGTH}
								className="resize-y"
							/>
							<div className="flex items-center justify-between">
								<span className="text-muted-foreground text-xs">
									Help matching attendees understand exactly who or what you
									are looking to source.
								</span>
								<span className="shrink-0 text-muted-foreground text-xs">
									{sourcingIntent.length}/{PROFILE_TEXT_FIELD_MAX_LENGTH}
								</span>
							</div>
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
								maxLength={PROFILE_TEXT_FIELD_MAX_LENGTH}
								className="resize-y"
							/>
							<div className="flex items-center justify-between">
								<span className="text-muted-foreground text-xs">
									List your systems, products, capabilities, or core solutions.
								</span>
								<span className="shrink-0 text-muted-foreground text-xs">
									{capabilities.length}/{PROFILE_TEXT_FIELD_MAX_LENGTH}
								</span>
							</div>
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
							{tagsLocked
								? "Your event organizer manages these tags for you."
								: "Tags are used by the matching algorithm to score compatibility between you and visitors."}
						</CardDescription>
					</CardHeader>
					<CardContent
						className={`space-y-4 ${tagsLocked ? "pointer-events-none opacity-60" : ""}`}
					>
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
						disabled={updateMutation.isPending || isUploadingAvatar}
						className="min-w-[120px]"
					>
						{updateMutation.isPending || isUploadingAvatar
							? "Saving..."
							: "Save Profile"}
					</Button>
				</div>
			</form>
		</div>
	);
}
