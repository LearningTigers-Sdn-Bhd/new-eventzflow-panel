"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, Minus, Plus, Tag } from "lucide-react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { useConfirmDialog } from "@/hooks/use-confirm-dialog";
import {
	type ExhibitorKit,
	type UpdateExhibitorKitTagsRequest,
	updateExhibitorKitTags,
} from "@/lib/api/exhibitor-kit";
import { cn } from "@/lib/utils";

interface StepperProps {
	label: string;
	hint?: string;
	value: number;
	disabled: boolean;
	onChange: (next: number) => void;
}

function Stepper({ label, hint, value, disabled, onChange }: StepperProps) {
	return (
		<div className="flex items-center justify-between gap-3">
			<div className="min-w-0">
				<p className="font-medium text-sm">{label}</p>
				{hint && <p className="text-muted-foreground text-xs">{hint}</p>}
			</div>
			<div className="flex items-center gap-2">
				<Button
					type="button"
					variant="outline"
					size="icon-sm"
					className="rounded-none"
					aria-label={`Remove one ${label.toLowerCase()}`}
					disabled={disabled || value <= 0}
					onClick={() => onChange(value - 1)}
				>
					<Minus className="size-4" />
				</Button>
				<span className="w-6 text-center font-medium tabular-nums">
					{value}
				</span>
				<Button
					type="button"
					variant="outline"
					size="icon-sm"
					className="rounded-none"
					aria-label={`Add one ${label.toLowerCase()}`}
					disabled={disabled}
					onClick={() => onChange(value + 1)}
				>
					<Plus className="size-4" />
				</Button>
			</div>
		</div>
	);
}

/**
 * Tag pickup for a kit. "Collect" records the tags the event includes in one click.
 * Clicking the "0/2 tags" text opens a stepper for partial pickups; going past the
 * included count simply counts as extra tags. Each tap saves, and un-collecting asks first.
 */
export function TagsCell({ kit }: { kit: ExhibitorKit }) {
	const params = useParams();
	const eventId = params.event_id as string;
	const queryClient = useQueryClient();
	const { openConfirm, closeDialog } = useConfirmDialog();

	const collected = kit.tags_collected ?? 0;
	const included = kit.tags_included ?? 0;
	const extra = kit.extra_tags ?? 0;

	const save = useMutation({
		mutationFn: (data: UpdateExhibitorKitTagsRequest) =>
			updateExhibitorKitTags(Number(eventId), kit.id, data),
		onSuccess: () =>
			queryClient.invalidateQueries({
				queryKey: ["event", eventId, "vendors"],
			}),
		onError: (error: Error) =>
			toast.error(error.message || "Couldn't save the tags"),
	});

	if (kit.booking_status === "cancelled") {
		return <span className="text-muted-foreground">-</span>;
	}

	const complete = collected > 0 && collected >= included;

	const handleClick = (event: React.MouseEvent) => {
		event.stopPropagation();
		if (!complete) {
			save.mutate({ tags_collected: included });
			return;
		}
		openConfirm({
			title: "Mark as not collected?",
			message: `This resets ${kit.company_name || "this kit"} to 0 tags collected${extra > 0 ? `, including ${extra} extra` : ""}.`,
			confirmLabel: "Mark not collected",
			cancelLabel: "Keep collected",
			type: "warning",
			icon: "alert",
			size: "sm",
			onConfirm: () => {
				save.mutate({ tags_collected: 0 });
				closeDialog();
			},
			onCancel: closeDialog,
		});
	};

	return (
		<div className="flex w-fit flex-col items-center gap-1 text-center">
			{(included > 0 || complete) && (
				<Button
					type="button"
					size="sm"
					variant={complete ? "outline" : "default"}
					disabled={save.isPending}
					onClick={handleClick}
					className={cn(
						"h-7 rounded-none px-2 text-xs",
						complete && "border-green-500 text-green-600 hover:text-green-600",
						!complete &&
							collected > 0 &&
							"bg-amber-500 text-white hover:bg-amber-600",
					)}
				>
					{complete ? (
						<Check className="mr-1 size-3.5" />
					) : (
						<Tag className="mr-1 size-3.5" />
					)}
					{complete ? "Collected" : collected > 0 ? "Collect rest" : "Collect"}
				</Button>
			)}
			<Popover>
				<PopoverTrigger asChild>
					<button
						type="button"
						onClick={(event) => event.stopPropagation()}
						title="Adjust tags collected"
						className="cursor-pointer text-[11px] text-muted-foreground tabular-nums underline decoration-dotted underline-offset-2 hover:text-foreground"
					>
						{included > 0 || collected > 0
							? `${collected}/${included} tags`
							: "No tags, add"}
						{extra > 0 && (
							<span className="text-amber-600">, +{extra} extra</span>
						)}
					</button>
				</PopoverTrigger>
				<PopoverContent
					align="center"
					className="w-72 rounded-none p-4"
					onClick={(event) => event.stopPropagation()}
				>
					<Stepper
						label="Collected"
						hint={
							extra > 0
								? `${included} included, +${extra} extra`
								: `${included} included`
						}
						value={collected}
						disabled={save.isPending}
						onChange={(next) => save.mutate({ tags_collected: next })}
					/>
				</PopoverContent>
			</Popover>
		</div>
	);
}
