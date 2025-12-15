"use client";

import { useForm } from "@tanstack/react-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Users, Pencil, Trash2 } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useDialog } from "@/hooks/use-dialog";
import ConfirmDialog from "@/components/pages/event/settings/confirm-dialog";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	Field,
	FieldContent,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
	createExhibitorTeamMemberLimit,
	getExhibitorTeamMemberLimit,
	updateExhibitorTeamMemberLimit,
	deleteExhibitorTeamMemberLimit,
} from "@/lib/api/exhibitor-team-member-limit";

interface TeamLimitsDialogProps {
	eventId: number;
	trigger?: React.ReactNode;
}

export function TeamLimitsDialog({ eventId, trigger }: TeamLimitsDialogProps) {
	const queryClient = useQueryClient();
	const { openDialog, closeDialog } = useDialog();
	const [isEditing, setIsEditing] = React.useState(false);

	// Fetch existing settings (returns null if not configured)
	const { data: settings, isLoading } = useQuery({
		queryKey: ["exhibitor-team-member-limit", eventId],
		queryFn: () => getExhibitorTeamMemberLimit(eventId),
		retry: false,
	});

	// Reset editing state when settings change
	React.useEffect(() => {
		if (!settings) {
			setIsEditing(true); // Show form if no settings
		} else {
			setIsEditing(false); // Show view mode if settings exist
		}
	}, [settings]);

	// Mutation for create/update
	const saveMutation = useMutation({
		mutationFn: async (data: {
			team_member_limit: number;
			extra_team_member_fee: number;
		}) => {
			if (settings) {
				return updateExhibitorTeamMemberLimit(eventId, data);
			}
			return createExhibitorTeamMemberLimit(eventId, data);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["exhibitor-team-member-limit", eventId],
			});
			queryClient.invalidateQueries({
				queryKey: ["event", eventId.toString(), "vendors"],
			});
			toast.success(
				settings
					? "Team member limits updated successfully"
					: "Team member limits configured successfully",
			);
			setIsEditing(false);
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to save team limits");
		},
	});

	// Delete mutation
	const deleteMutation = useMutation({
		mutationFn: () => deleteExhibitorTeamMemberLimit(eventId),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["exhibitor-team-member-limit", eventId],
			});
			queryClient.invalidateQueries({
				queryKey: ["event", eventId.toString(), "vendors"],
			});
			toast.success("Team member limits removed (unlimited)");
			setIsEditing(true); // Show form after deletion
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to remove team limits");
		},
	});

	const form = useForm({
		defaultValues: {
			team_member_limit: settings?.team_member_limit?.toString() ?? "",
			extra_team_member_fee: settings?.extra_team_member_fee ?? "",
		},
		onSubmit: async ({ value }) => {
			// Validation: Both fields are required
			if (!value.team_member_limit || value.team_member_limit === "") {
				toast.error("Team member limit is required");
				return;
			}
			if (!value.extra_team_member_fee || value.extra_team_member_fee === "") {
				toast.error("Extra team member fee is required");
				return;
			}

			const payload = {
				team_member_limit: Number(value.team_member_limit),
				extra_team_member_fee: Number(value.extra_team_member_fee),
			};
			await saveMutation.mutateAsync(payload);
		},
	});

	const handleRemoveLimits = () => {
		openDialog({
			component: ConfirmDialog,
			props: {
				message:
					"Are you sure you want to remove team member limits? This will allow unlimited team members for all exhibitors.",
				confirmLabel: "Remove Limits",
				cancelLabel: "Cancel",
				variant: "destructive",
				icon: "delete",
				onConfirm: () => {
					deleteMutation.mutate();
					closeDialog();
				},
				onCancel: closeDialog,
			},
			config: {
				title: "Remove Team Member Limits",
				description: "This action will remove all team member restrictions.",
			},
		});
	};

	return (
		<Dialog>
			<DialogTrigger asChild>
				{trigger || (
					<Button variant="outline" className="w-full rounded-none sm:w-auto">
						<Users className="mr-2 h-4 w-4" />
						Team Limits
					</Button>
				)}
			</DialogTrigger>
			<DialogContent className="sm:max-w-[500px]">
				<DialogHeader>
					<DialogTitle>Configure Team Member Limits</DialogTitle>
					<DialogDescription>
						Set the maximum number of free team members per exhibitor and the fee
						for additional members. To allow unlimited team members, click
						"Remove Limits" instead.
					</DialogDescription>
				</DialogHeader>

				{isLoading ? (
					<div className="flex items-center justify-center py-8">
						<Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
					</div>
				) : settings && !isEditing ? (
					// VIEW MODE - Show configured settings
					<div className="space-y-4">
						<div className="rounded-none border border-dashed bg-muted/50 p-4">
							<div className="space-y-3">
								<div className="flex items-start justify-between">
									<div className="space-y-1">
										<p className="text-sm font-medium">Team Member Limit</p>
										<p className="text-2xl font-bold">
											{settings.team_member_limit}
										</p>
										<p className="text-xs text-muted-foreground">
											Free team members per exhibitor
										</p>
									</div>
									<div className="rounded-none bg-primary/10 px-3 py-1">
										<p className="text-xs font-medium text-primary">
											CONFIGURED
										</p>
									</div>
								</div>

								<div className="border-t border-dashed pt-3">
									<p className="text-sm font-medium">Extra Member Fee</p>
									<p className="text-2xl font-bold">
										RM {settings.extra_team_member_fee}
									</p>
									<p className="text-xs text-muted-foreground">
										Charged per additional team member
									</p>
								</div>
							</div>
						</div>

						<div className="flex gap-2">
							<Button
								variant="outline"
								className="flex-1 rounded-none"
								onClick={() => setIsEditing(true)}
							>
								<Pencil className="mr-2 h-4 w-4" />
								Update Settings
							</Button>
							<Button
								variant="destructive"
								className="rounded-none"
								onClick={handleRemoveLimits}
								disabled={deleteMutation.isPending}
							>
								{deleteMutation.isPending ? (
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								) : (
									<Trash2 className="mr-2 h-4 w-4" />
								)}
								Remove Limits
							</Button>
						</div>
					</div>
				) : (
					// EDIT MODE - Show form
					<form
						onSubmit={(e) => {
							e.preventDefault();
							e.stopPropagation();
							form.handleSubmit();
						}}
						className="space-y-4"
					>
						<FieldGroup>
							<form.Field name="team_member_limit">
								{(field) => {
									const isInvalid =
										field.state.meta.isTouched && !field.state.meta.isValid;
									return (
										<Field data-invalid={isInvalid}>
											<FieldContent>
												<FieldLabel htmlFor={field.name}>
													Team Member Limit <span className="text-red-500">*</span>
												</FieldLabel>
												<FieldDescription>
													Maximum number of free team members per exhibitor.
												</FieldDescription>
											</FieldContent>
											<Input
												id={field.name}
												name={field.name}
												type="number"
												placeholder="e.g., 3"
												min={1}
												required
												value={field.state.value}
												onBlur={field.handleBlur}
												onChange={(e) => field.handleChange(e.target.value)}
												aria-invalid={isInvalid}
											/>
											{isInvalid && (
												<FieldError errors={field.state.meta.errors} />
											)}
										</Field>
									);
								}}
							</form.Field>

							<form.Field name="extra_team_member_fee">
								{(field) => {
									const isInvalid =
										field.state.meta.isTouched && !field.state.meta.isValid;
									return (
										<Field data-invalid={isInvalid}>
											<FieldContent>
												<FieldLabel htmlFor={field.name}>
													Extra Team Member Fee (RM){" "}
													<span className="text-red-500">*</span>
												</FieldLabel>
												<FieldDescription>
													Fee charged per team member exceeding the limit. Set to 0
													for no charge.
												</FieldDescription>
											</FieldContent>
											<Input
												id={field.name}
												name={field.name}
												type="number"
												placeholder="e.g., 50.00"
												step="0.01"
												min={0}
												required
												value={field.state.value}
												onBlur={field.handleBlur}
												onChange={(e) => field.handleChange(e.target.value)}
												aria-invalid={isInvalid}
											/>
											{isInvalid && (
												<FieldError errors={field.state.meta.errors} />
											)}
										</Field>
									);
								}}
							</form.Field>
						</FieldGroup>

						<form.Subscribe
							selector={(state) => [
								state.values.team_member_limit,
								state.values.extra_team_member_fee,
							]}
						>
							{([teamLimit, fee]) => {
								const isFormValid =
									teamLimit && teamLimit !== "" && fee && fee !== "";
								return (
									<DialogFooter className="gap-2 sm:gap-0">
										{settings && (
											<Button
												type="button"
												variant="outline"
												className="rounded-none"
												onClick={() => setIsEditing(false)}
												disabled={saveMutation.isPending}
											>
												Cancel
											</Button>
										)}
										<Button
											type="submit"
											className="rounded-none"
											disabled={!isFormValid || saveMutation.isPending}
										>
											{saveMutation.isPending && (
												<Loader2 className="mr-2 h-4 w-4 animate-spin" />
											)}
											{settings ? "Update" : "Create"}
										</Button>
									</DialogFooter>
								);
							}}
						</form.Subscribe>
					</form>
				)}
			</DialogContent>
		</Dialog>
	);
}
