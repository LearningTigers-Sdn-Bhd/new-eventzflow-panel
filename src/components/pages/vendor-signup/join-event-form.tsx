"use client";

import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { ExternalLink, Image, Globe } from "lucide-react";
import { toast } from "sonner";
import { PatternedLayout } from "@/components/patterned-layout";
import { Button } from "@/components/ui/button";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
} from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import { VendorSignupEventSidebar } from "./vendor-signup-event-sidebar";

interface EventInfo {
	id: number;
	title: string;
	description: string | null;
	start_date: string | null;
	end_date: string | null;
}

interface JoinEventFormProps {
	event: EventInfo | undefined;
	token: string;
	accessToken: string;
	onSuccess: () => void;
}

async function joinEventAsVendor(
	token: string,
	accessToken: string,
	eventVendor: { redirect_url?: string; poster_url?: string },
) {
	const response = await fetch(
		`${process.env.NEXT_PUBLIC_API_URL}/v1/auth/join_event_as_vendor`,
		{
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${accessToken}`,
			},
			body: JSON.stringify({
				token,
				event_vendor: eventVendor,
			}),
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
	token,
	accessToken,
	onSuccess,
}: JoinEventFormProps) {
	const joinMutation = useMutation({
		mutationFn: (data: { redirect_url?: string; poster_url?: string }) =>
			joinEventAsVendor(token, accessToken, data),
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
		},
		onSubmit: async ({ value }) => {
			await joinMutation.mutateAsync({
				redirect_url: value.redirect_url || undefined,
				poster_url: value.poster_url || undefined,
			});
		},
	});

	return (
		<div className="flex min-h-screen flex-col lg:flex-row">
			<VendorSignupEventSidebar event={event} />

			<PatternedLayout>
				<div className="w-full max-w-lg space-y-4">
					{/* Header */}
					<div className="rounded-none border bg-background p-5 text-center">
						<p className="mb-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
							Final Step
						</p>
						<h1 className="text-2xl font-bold tracking-tight">Almost there!</h1>
						<p className="mt-2 text-sm text-muted-foreground">
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
							<div className="flex items-center gap-2 border-b pb-2 mb-4">
								<Globe className="h-5 w-5 text-primary" />
								<h3 className="font-semibold text-lg">Event Settings</h3>
								<span className="text-muted-foreground text-sm">(Optional)</span>
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
												Where visitors will be redirected after scanning your
												QR code
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

						{/* Submit Button */}
						<Button
							type="submit"
							className="h-12 w-full rounded-none text-base font-medium"
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
