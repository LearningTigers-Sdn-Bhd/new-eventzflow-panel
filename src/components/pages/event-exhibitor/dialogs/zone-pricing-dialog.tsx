"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Edit2, Loader2, MapPinned, Trash2 } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	createExhibitorZone,
	deleteExhibitorZone,
	type ExhibitorZone,
	getExhibitorZones,
	updateExhibitorZone,
} from "@/lib/api/exhibitor-zone";

interface ZonePricingDialogProps {
	eventId: number;
	trigger?: React.ReactNode;
}

type FormState = {
	zone: string;
	quota: string;
};

const DEFAULT_FORM: FormState = {
	zone: "",
	quota: "",
};

export function ZonePricingDialog({
	eventId,
	trigger,
}: ZonePricingDialogProps) {
	const queryClient = useQueryClient();
	const [isOpen, setIsOpen] = React.useState(false);
	const [editingItem, setEditingItem] = React.useState<ExhibitorZone | null>(
		null,
	);
	const [form, setForm] = React.useState<FormState>(DEFAULT_FORM);

	const { data: zones = [], isLoading } = useQuery({
		queryKey: ["exhibitor-zones", eventId],
		queryFn: () => getExhibitorZones(eventId),
		enabled: isOpen,
	});

	const invalidateZones = () => {
		queryClient.invalidateQueries({
			queryKey: ["exhibitor-zones", eventId],
		});
	};

	const createMutation = useMutation({
		mutationFn: createExhibitorZone,
		onSuccess: () => {
			invalidateZones();
			queryClient.invalidateQueries({
				queryKey: ["exhibitor-booth-prices", eventId],
			});
			toast.success("Zone added");
			setForm(DEFAULT_FORM);
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to add zone");
		},
	});

	const updateMutation = useMutation({
		mutationFn: updateExhibitorZone,
		onSuccess: () => {
			invalidateZones();
			queryClient.invalidateQueries({
				queryKey: ["exhibitor-booth-prices", eventId],
			});
			toast.success("Zone updated");
			setEditingItem(null);
			setForm(DEFAULT_FORM);
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to update zone");
		},
	});

	const deleteMutation = useMutation({
		mutationFn: deleteExhibitorZone,
		onSuccess: () => {
			invalidateZones();
			queryClient.invalidateQueries({
				queryKey: ["exhibitor-booth-prices", eventId],
			});
			toast.success("Zone removed");
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to remove zone");
		},
	});

	const isSaving = createMutation.isPending || updateMutation.isPending;

	const onSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		if (!form.zone.trim()) {
			toast.error("Please enter a zone");
			return;
		}

		const parsedQuota = form.quota.trim() === "" ? null : Number(form.quota);
		if (
			parsedQuota !== null &&
			(Number.isNaN(parsedQuota) || parsedQuota < 0)
		) {
			toast.error(
				"Zone quota must be empty or a valid value greater than or equal to 0",
			);
			return;
		}

		if (editingItem) {
			updateMutation.mutate({
				id: editingItem.id,
				zone: form.zone.trim(),
				quota: parsedQuota,
			});
			return;
		}

		createMutation.mutate({
			event_id: eventId,
			zone: form.zone.trim(),
			quota: parsedQuota,
		});
	};

	const onStartEdit = (item: ExhibitorZone) => {
		setEditingItem(item);
		setForm({
			zone: item.zone,
			quota: item.quota === null ? "" : item.quota.toString(),
		});
	};

	const onCancelEdit = () => {
		setEditingItem(null);
		setForm(DEFAULT_FORM);
	};

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger asChild>
				{trigger || (
					<Button variant="outline" className="w-full rounded-none sm:w-auto">
						<MapPinned className="mr-2 h-4 w-4" />
						Zones
					</Button>
				)}
			</DialogTrigger>
			<DialogContent className="rounded-none sm:max-w-[760px]">
				<DialogHeader>
					<DialogTitle>Manage Exhibitor Zones</DialogTitle>
					<DialogDescription>
						Create zones and set quotas. Booth prices can then be assigned to
						these zones.
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={onSubmit} className="space-y-4 rounded-none border p-4">
					<div className="grid gap-3 sm:grid-cols-2">
						<div className="space-y-2">
							<Label htmlFor="zone-name">Zone</Label>
							<Input
								id="zone-name"
								placeholder="e.g. Zone A"
								value={form.zone}
								onChange={(e) =>
									setForm((prev) => ({ ...prev, zone: e.target.value }))
								}
								required
								className="h-9 rounded-none"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="zone-quota">Quota</Label>
							<Input
								id="zone-quota"
								type="number"
								min="0"
								placeholder="leave blank for no quota"
								value={form.quota}
								onChange={(e) =>
									setForm((prev) => ({ ...prev, quota: e.target.value }))
								}
								className="h-9 rounded-none"
							/>
						</div>
					</div>

					<DialogFooter>
						{editingItem && (
							<Button
								type="button"
								variant="outline"
								className="rounded-none"
								onClick={onCancelEdit}
							>
								Cancel Edit
							</Button>
						)}
						<Button type="submit" className="rounded-none" disabled={isSaving}>
							{isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
							{editingItem ? "Update Zone" : "Add Zone"}
						</Button>
					</DialogFooter>
				</form>

				<div className="rounded-none border">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Zone</TableHead>
								<TableHead>Quota</TableHead>
								<TableHead className="w-[120px]">Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{isLoading ? (
								<TableRow>
									<TableCell colSpan={3} className="py-8 text-center">
										<Loader2 className="mx-auto h-5 w-5 animate-spin text-muted-foreground" />
									</TableCell>
								</TableRow>
							) : zones.length === 0 ? (
								<TableRow>
									<TableCell
										colSpan={3}
										className="py-8 text-center text-muted-foreground"
									>
										No zones configured yet.
									</TableCell>
								</TableRow>
							) : (
								zones.map((item) => (
									<TableRow key={item.id}>
										<TableCell className="font-medium">{item.zone}</TableCell>
										<TableCell>{item.quota ?? "-"}</TableCell>
										<TableCell>
											<div className="flex items-center gap-1">
												<Button
													type="button"
													variant="ghost"
													size="sm"
													onClick={() => onStartEdit(item)}
													className="h-8 w-8 rounded-none p-0"
												>
													<Edit2 className="h-4 w-4" />
												</Button>
												<Button
													type="button"
													variant="ghost"
													size="sm"
													onClick={() => deleteMutation.mutate({ id: item.id })}
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
			</DialogContent>
		</Dialog>
	);
}
