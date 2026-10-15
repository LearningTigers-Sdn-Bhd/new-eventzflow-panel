"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	ArrowDown,
	ArrowUp,
	Edit2,
	Loader2,
	Map as MapIcon,
	Trash2,
} from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import ImageUpload from "@/components/file-upload/image-upload";
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
import { Switch } from "@/components/ui/switch";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { useFullScreenDialogOpen } from "@/hooks/use-full-screen-dialog-open";
import {
	type BoothPlan,
	createBoothPlan,
	deleteBoothPlan,
	getBoothPlans,
	updateBoothPlan,
} from "@/lib/api/booth-plan";

interface BoothPlanDialogProps {
	eventId: number;
	trigger?: React.ReactNode;
}

export function BoothPlanDialog({ eventId, trigger }: BoothPlanDialogProps) {
	const queryClient = useQueryClient();
	// A file input inside a Dialog nested in a DropdownMenu's own DOM subtree gets
	// closed by the dropdown's outside-pointer-down handling when the native file
	// picker steals focus. Backing open state by this store instead (same fix as
	// BoothPricingDialog/PackageDialog/VoucherDialog) keeps the Dialog mounted
	// outside the dropdown, so opening the OS file picker can't close it.
	const [isOpen, setIsOpen] = useFullScreenDialogOpen(
		`booth-plan-dialog-${eventId}`,
	);
	const [editingPlan, setEditingPlan] = React.useState<BoothPlan | null>(null);
	const [name, setName] = React.useState("");
	const [imageFile, setImageFile] = React.useState<File | null>(null);

	const { data: plans = [], isLoading } = useQuery({
		queryKey: ["booth-plans", eventId],
		queryFn: () => getBoothPlans(eventId),
		enabled: isOpen,
	});

	const invalidate = () =>
		queryClient.invalidateQueries({ queryKey: ["booth-plans", eventId] });

	const resetForm = () => {
		setEditingPlan(null);
		setName("");
		setImageFile(null);
	};

	const createMutation = useMutation({
		mutationFn: createBoothPlan,
		onSuccess: () => {
			invalidate();
			toast.success("Booth plan added");
			resetForm();
		},
		onError: (error: Error) =>
			toast.error(error.message || "Failed to add booth plan"),
	});

	const updateMutation = useMutation({
		mutationFn: updateBoothPlan,
		onSuccess: (_data, variables) => {
			invalidate();
			// Reorder (moveOrdered) also goes through this mutation but shouldn't reset
			// the form or toast — only the edit form's own submit should.
			if (editingPlan && variables.id === editingPlan.id) {
				toast.success("Booth plan updated");
				resetForm();
			}
		},
		onError: (error: Error) =>
			toast.error(error.message || "Failed to update booth plan"),
	});

	const deleteMutation = useMutation({
		mutationFn: deleteBoothPlan,
		onSuccess: () => {
			invalidate();
			toast.success("Booth plan removed");
		},
		onError: (error: Error) =>
			toast.error(error.message || "Failed to remove booth plan"),
	});

	const onSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!name.trim()) {
			toast.error("Please enter a booth plan name");
			return;
		}

		if (editingPlan) {
			updateMutation.mutate({
				id: editingPlan.id,
				event_id: eventId,
				name: name.trim(),
				// Omit image entirely when nothing new was chosen — keeps the
				// existing upload instead of clearing it.
				image: imageFile ?? undefined,
			});
			return;
		}

		createMutation.mutate({
			event_id: eventId,
			name: name.trim(),
			image: imageFile ?? undefined,
		});
	};

	const onStartEdit = (plan: BoothPlan) => {
		setEditingPlan(plan);
		setName(plan.name);
		setImageFile(null);
	};

	const moveOrdered = (plan: BoothPlan, direction: -1 | 1) => {
		const sorted = [...plans].sort((a, b) => a.position - b.position);
		const index = sorted.findIndex((p) => p.id === plan.id);
		const swapWith = sorted[index + direction];
		if (!swapWith) return;

		updateMutation.mutate({
			id: plan.id,
			event_id: eventId,
			name: plan.name,
			position: swapWith.position,
		});
		updateMutation.mutate({
			id: swapWith.id,
			event_id: eventId,
			name: swapWith.name,
			position: plan.position,
		});
	};

	const sortedPlans = [...plans].sort((a, b) => a.position - b.position);
	const isSaving = createMutation.isPending || updateMutation.isPending;

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger asChild>
				{trigger || (
					<Button variant="outline" className="w-full rounded-none sm:w-auto">
						<MapIcon className="mr-2 h-4 w-4" />
						Booth Plan
					</Button>
				)}
			</DialogTrigger>
			<DialogContent className="!top-0 !left-0 !h-[100dvh] !w-screen !max-w-none !translate-x-0 !translate-y-0 sm:!max-w-none flex flex-col gap-0 overflow-hidden rounded-none border-0 p-0">
				<DialogHeader className="shrink-0 border-b px-6 py-5">
					<DialogTitle>Manage Booth Plans</DialogTitle>
					<DialogDescription>
						Upload one or more booth plan images (e.g. per hall or zone).
						Exhibitors see these on the registration page.
					</DialogDescription>
				</DialogHeader>

				<div className="flex min-h-0 flex-1 flex-col overflow-y-auto lg:grid lg:grid-cols-[400px_minmax(0,1fr)] lg:overflow-hidden">
					<form
						onSubmit={onSubmit}
						className="flex shrink-0 flex-col gap-4 border-b bg-muted/20 p-6 lg:min-h-0 lg:overflow-y-auto lg:border-r lg:border-b-0"
					>
						<p className="font-medium text-sm">
							{editingPlan ? "Edit booth plan" : "Add booth plan"}
						</p>
						<div className="space-y-2">
							<Label htmlFor="booth-plan-name">Name</Label>
							<Input
								id="booth-plan-name"
								placeholder="e.g. Kinabatangan I - III"
								value={name}
								onChange={(e) => setName(e.target.value)}
								required
								className="h-9 rounded-none"
							/>
						</div>
						<div className="space-y-2">
							<Label>
								Plan Image
								{editingPlan && (
									<span className="ml-1 font-normal text-muted-foreground">
										(leave blank to keep current image)
									</span>
								)}
							</Label>
							<ImageUpload
								value={imageFile ?? editingPlan?.imageUrl ?? undefined}
								onChange={setImageFile}
								className="[&>div]:rounded-none"
							/>
						</div>

						<div className="flex flex-col gap-2 pt-2">
							<Button
								type="submit"
								className="rounded-none"
								disabled={isSaving}
							>
								{isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
								{editingPlan ? "Save Changes" : "Add Booth Plan"}
							</Button>
							{editingPlan && (
								<Button
									type="button"
									variant="outline"
									className="rounded-none"
									onClick={resetForm}
								>
									Cancel Edit
								</Button>
							)}
						</div>
					</form>

					<div className="min-h-0 flex-1 overflow-y-auto p-6">
						<div className="rounded-none border">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead className="w-[100px]">Image</TableHead>
										<TableHead>Name</TableHead>
										<TableHead className="w-[80px]">Active</TableHead>
										<TableHead className="w-[180px]">Actions</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{isLoading ? (
										<TableRow>
											<TableCell colSpan={4} className="py-8 text-center">
												<Loader2 className="mx-auto h-5 w-5 animate-spin text-muted-foreground" />
											</TableCell>
										</TableRow>
									) : sortedPlans.length === 0 ? (
										<TableRow>
											<TableCell
												colSpan={4}
												className="py-8 text-center text-muted-foreground"
											>
												No booth plans uploaded yet.
											</TableCell>
										</TableRow>
									) : (
										sortedPlans.map((plan, index) => (
											<TableRow key={plan.id}>
												<TableCell>
													{plan.imageUrl ? (
														// biome-ignore lint/performance/noImgElement: external Active Storage URL, matches rentable-item-card convention
														<img
															src={plan.imageUrl}
															alt={plan.name}
															className="h-16 w-16 object-cover"
														/>
													) : (
														<span className="text-muted-foreground text-xs">
															No image
														</span>
													)}
												</TableCell>
												<TableCell className="font-medium">
													{plan.name}
												</TableCell>
												<TableCell>
													<Switch
														checked={plan.active}
														onCheckedChange={(checked) =>
															updateMutation.mutate({
																id: plan.id,
																event_id: eventId,
																name: plan.name,
																active: checked,
															})
														}
													/>
												</TableCell>
												<TableCell>
													<div className="flex items-center gap-1">
														<Button
															type="button"
															variant="ghost"
															size="sm"
															disabled={index === 0}
															onClick={() => moveOrdered(plan, -1)}
															className="h-8 w-8 rounded-none p-0"
														>
															<ArrowUp className="h-4 w-4" />
														</Button>
														<Button
															type="button"
															variant="ghost"
															size="sm"
															disabled={index === sortedPlans.length - 1}
															onClick={() => moveOrdered(plan, 1)}
															className="h-8 w-8 rounded-none p-0"
														>
															<ArrowDown className="h-4 w-4" />
														</Button>
														<Button
															type="button"
															variant="ghost"
															size="sm"
															onClick={() => onStartEdit(plan)}
															className="h-8 w-8 rounded-none p-0"
														>
															<Edit2 className="h-4 w-4" />
														</Button>
														<Button
															type="button"
															variant="ghost"
															size="sm"
															onClick={() =>
																deleteMutation.mutate({
																	id: plan.id,
																	event_id: eventId,
																})
															}
															disabled={deleteMutation.isPending}
															className="h-8 w-8 rounded-none p-0 text-destructive hover:text-destructive"
														>
															<Trash2 className="h-4 w-4" />
														</Button>
													</div>
												</TableCell>
											</TableRow>
										))
									)}
								</TableBody>
							</Table>
						</div>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
