"use client";

import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { ExternalLink, Globe, Image } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { PatternedLayout } from "@/components/patterned-layout";
import { Button } from "@/components/ui/button";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
} from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import { API_BASE_URL } from "@/utils/rest-api";
import { ExhibitorKitSection } from "./exhibitor-kit-section";
import { TeamMembersSection } from "./team-members-section";
import { VendorSignupEventSidebar } from "./vendor-signup-event-sidebar";

interface EventInfo {
	id: number;
	title: string;
	description: string | null;
	start_date: string | null;
	end_date: string | null;
}

interface GroupInfo {
	id: number;
	name: string;
}

interface JoinEventFormProps {
	event: EventInfo | undefined;
	group?: GroupInfo | null;
	vendorType?: "Exhibitor" | "Merchant";
	useExhibitorKit?: boolean;
	guidelinesPdfUrl?: string | null;
	teamMemberLimit?: number | null;
	extraTeamMemberFee?: number | null;
	token: string;
	accessToken: string;
	onSuccess: () => void;
}

interface ExhibitorKitData {
	booth_number?: string;
	booth_type?: string;
	booth_dimensions?: string;
	side_wall_left_required?: boolean;
	side_wall_right_required?: boolean;
	name_on_fascia?: string;
	fascia_upgrade_required?: boolean;
	company_name?: string;
	company_address?: string;
	pic_full_name: string;
	pic_contact_number: string;
	pic_email_address?: string;
	exhibitor_team_members_attributes?: { full_name: string }[];
}

async function joinEventAsVendor(
	token: string,
	accessToken: string,
	eventVendor: { redirect_url?: string; poster_url?: string },
	exhibitorKit?: ExhibitorKitData,
) {
	const body: Record<string, unknown> = {
		token,
		event_vendor: eventVendor,
	};

	if (exhibitorKit) {
		body.exhibitor_kit = exhibitorKit;
	}

	const response = await fetch(
		`${API_BASE_URL}/v1/auth/join_event_as_vendor`,
		{
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${accessToken}`,
			},
			body: JSON.stringify(body),
		},
	);

	if (!response.ok) {
		const error = await response.json();
		throw new Error(error.message || "Failed to join event");
	}

	return response.json();
}

export function JoinEventForm({
	event,
	group,
	vendorType,
	useExhibitorKit,
	guidelinesPdfUrl,
	teamMemberLimit,
	extraTeamMemberFee,
	token,
	accessToken,
	onSuccess,
}: JoinEventFormProps) {
	// Team members state for exhibitor kit
	const [teamMembers, setTeamMembers] = useState<{ full_name: string }[]>([]);

	const joinMutation = useMutation({
		mutationFn: (data: {
			eventVendor: { redirect_url?: string; poster_url?: string };
			exhibitorKit?: ExhibitorKitData;
		}) =>
			joinEventAsVendor(
				token,
				accessToken,
				data.eventVendor,
				data.exhibitorKit,
			),
		onSuccess: () => {
			toast.success("Successfully joined!", {
				description: `You are now a vendor for ${event?.title}.`,
			});
			onSuccess();
		},
		onError: (error: Error) => {
			toast.error("Failed to join event", {
				description: error.message || "Please try again.",
			});
		},
	});

	const form = useForm({
		defaultValues: {
			redirect_url: "",
			poster_url: "",
			// Exhibitor kit fields
			booth_number: "",
			booth_type: "",
			booth_dimensions: "",
			side_wall_left_required: false,
			side_wall_right_required: false,
			name_on_fascia: "",
			fascia_upgrade_required: false,
			company_name: "",
			company_address: "",
			pic_full_name: "",
			pic_contact_number: "",
			pic_email_address: "",
		},
		onSubmit: async ({ value }) => {
			// Validate exhibitor kit required fields
			if (useExhibitorKit) {
				if (!value.pic_full_name || !value.pic_contact_number) {
					toast.error("Please fill in required PIC details");
					return;
				}
			}

			await joinMutation.mutateAsync({
				eventVendor: {
					redirect_url: value.redirect_url || undefined,
					poster_url: value.poster_url || undefined,
				},
				...(useExhibitorKit && {
					exhibitorKit: {
						booth_number: value.booth_number || undefined,
						booth_type: value.booth_type || undefined,
						booth_dimensions: value.booth_dimensions || undefined,
						side_wall_left_required: value.side_wall_left_required || undefined,
						side_wall_right_required: value.side_wall_right_required || undefined,
						name_on_fascia: value.name_on_fascia || undefined,
						fascia_upgrade_required: value.fascia_upgrade_required || undefined,
						company_name: value.company_name || undefined,
						company_address: value.company_address || undefined,
						pic_full_name: value.pic_full_name,
						pic_contact_number: value.pic_contact_number,
						pic_email_address: value.pic_email_address || undefined,
						exhibitor_team_members_attributes:
							teamMembers.length > 0 ? teamMembers : undefined,
					},
				}),
			});
		},
	});

	return (
		<div className="flex min-h-screen flex-col lg:flex-row">
			<VendorSignupEventSidebar
				event={event}
				group={group}
				vendorType={vendorType}
				useExhibitorKit={useExhibitorKit}
			/>

			<PatternedLayout>
				<div className="w-full max-w-7xl space-y-4">
					{/* Header */}
					<div className="rounded-none border bg-background p-5 text-center">
						<p className="mb-1 font-medium text-[10px] text-muted-foreground uppercase tracking-wider">
							Final Step
						</p>
						<h1 className="font-bold text-2xl tracking-tight">Almost there!</h1>
						<p className="mt-2 text-muted-foreground text-sm">
							Configure your settings for {event?.title}
						</p>
					</div>

					{/* Form */}
					<form
						onSubmit={(e) => {
							e.preventDefault();
							e.stopPropagation();
							form.handleSubmit();
						}}
						className="space-y-4"
					>
						<div className="rounded-none border bg-background p-5">
							<div className="mb-4 flex items-center gap-2 border-b pb-2">
								<Globe className="h-5 w-5 text-primary" />
								<h3 className="font-semibold text-lg">Event Settings</h3>
								<span className="text-muted-foreground text-sm">
									(Optional)
								</span>
							</div>

							<p className="mb-4 text-muted-foreground text-xs">
								You can configure these now or update them later at event page.
							</p>

							<div className="space-y-4">
								<form.Field name="redirect_url">
									{(field) => (
										<div className="space-y-2">
											<Label htmlFor={field.name}>Redirect URL</Label>
											<InputGroup className="h-11 border-input bg-background">
												<InputGroupAddon>
													<ExternalLink className="h-4 w-4" />
												</InputGroupAddon>
												<InputGroupInput
													id={field.name}
													type="url"
													placeholder="https://your-website.com"
													value={field.state.value}
													onChange={(e) => field.handleChange(e.target.value)}
												/>
											</InputGroup>
											<p className="text-muted-foreground text-xs">
												Where visitors will be redirected after scanning your QR
												code
											</p>
										</div>
									)}
								</form.Field>

								<form.Field name="poster_url">
									{(field) => (
										<div className="space-y-2">
											<Label htmlFor={field.name}>Poster URL</Label>
											<InputGroup className="h-11 border-input bg-background">
												<InputGroupAddon>
													<Image className="h-4 w-4" />
												</InputGroupAddon>
												<InputGroupInput
													id={field.name}
													type="url"
													placeholder="https://example.com/poster.jpg"
													value={field.state.value}
													onChange={(e) => field.handleChange(e.target.value)}
												/>
											</InputGroup>
											<p className="text-muted-foreground text-xs">
												Your promotional poster for this event
											</p>
										</div>
									)}
								</form.Field>
							</div>
						</div>

						{/* Exhibitor Kit Section - Only when event uses exhibitor kit */}
						{useExhibitorKit && (
							<div className="rounded-none border bg-background p-5">
						<ExhibitorKitSection
							form={form}
							guidelinesPdfUrl={guidelinesPdfUrl}
						/>
					</div>
				)}

						{/* Team Members Section - Only when event uses exhibitor kit */}
						{useExhibitorKit && (
							<div className="rounded-none border bg-background p-5">
								<TeamMembersSection
									teamMembers={teamMembers}
									onTeamMembersChange={setTeamMembers}
									teamMemberLimit={teamMemberLimit}
									extraTeamMemberFee={extraTeamMemberFee}
								/>
							</div>
						)}

						{/* Submit Button */}
						<Button
							type="submit"
							className="h-12 w-full rounded-none font-medium text-base"
							size="lg"
							disabled={joinMutation.isPending}
						>
							{joinMutation.isPending ? "Joining..." : "Join Event"}
						</Button>
					</form>
				</div>
			</PatternedLayout>
		</div>
	);
}
