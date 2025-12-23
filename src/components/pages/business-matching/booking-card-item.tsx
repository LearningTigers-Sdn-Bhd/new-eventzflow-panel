import { useQueryClient } from "@tanstack/react-query";
import {
	Calendar,
	CheckCircle,
	Clock,
	DollarSign,
	ExternalLink,
	Mail,
	MapPin,
	MessageSquare,
	MoreVertical,
	Phone,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useUpdateBooking } from "@/hooks/use-business-matching";
import { useConfirmDialog } from "@/hooks/use-confirm-dialog";
import type { Booking, BookingsResponse } from "@/lib/api/business-matching";
import { cn } from "@/lib/utils";
import {
	CompactCard as Card,
	CompactCardContent as CardContent,
	CompactCardFooter as CardFooter,
	CompactCardHeader as CardHeader,
	CompactCardTitle as CardTitle,
} from "./compact-booking-card";

interface BookingCardItemProps {
	booking: Booking;
	bmEventId: string;
	eventId: string;
}

export function BookingCardItem({
	booking,
	bmEventId,
	eventId,
}: BookingCardItemProps) {
	const { mutate: updateBooking, isPending } = useUpdateBooking(
		bmEventId,
		eventId,
	);
	const queryClient = useQueryClient();
	const { openConfirm } = useConfirmDialog();

	const [displayBooking, setDisplayBooking] = useState(booking); // Local display state

	// Sync local state with prop updates and localStorage overrides
	useEffect(() => {
		const stored = localStorage.getItem(`booking_override_${booking.id}`);
		if (stored) {
			try {
				const overrides = JSON.parse(stored);
				setDisplayBooking({ ...booking, ...overrides });
			} catch (_e) {
				setDisplayBooking(booking);
			}
		} else {
			setDisplayBooking(booking);
		}
	}, [booking]);

	const saveOverride = (updates: Partial<Booking>) => {
		const key = `booking_override_${booking.id}`;
		const existingItem = localStorage.getItem(key);
		const existing = existingItem ? JSON.parse(existingItem) : {};
		const newOverrides = { ...existing, ...updates };
		localStorage.setItem(key, JSON.stringify(newOverrides));
	};

	const [isEditingComment, setIsEditingComment] = useState(false);
	const [commentDraft, setCommentDraft] = useState(
		displayBooking.host_comment || "",
	);

	const [isEditingValue, setIsEditingValue] = useState(false);
	const [valueDraft, setValueDraft] = useState<string>(
		displayBooking.potential_deal_value?.toString() || "",
	);

	const getCommonBookingData = () => ({
		name: displayBooking.name,
		email: displayBooking.email,
		phone: displayBooking.phone,
		booking_date: displayBooking.booking_date,
		booking_time: displayBooking.booking_time,
		status: displayBooking.status,
		payment_status: displayBooking.payment_status,
		host_comment: displayBooking.host_comment,
		potential_deal_value: displayBooking.potential_deal_value,
		attendance: displayBooking.attendance,
	});

	const updateLocalCache = (updates: Partial<Booking>) => {
		queryClient.setQueryData(
			["business-matching-bookings", bmEventId, eventId],
			(oldData: BookingsResponse | undefined) => {
				if (!oldData || !oldData.bookings) return oldData;
				return {
					...oldData,
					bookings: oldData.bookings.map((b: Booking) =>
						b.id === displayBooking.id ? { ...b, ...updates } : b,
					),
				};
			},
		);
	};

	const handleSaveComment = () => {
		updateBooking(
			{
				bookingId: displayBooking.id,
				data: { ...getCommonBookingData(), host_comment: commentDraft },
			},
			{
				onSuccess: () => {
					const updates = { host_comment: commentDraft };
					saveOverride(updates); // Persist override
					setDisplayBooking((prev) => ({ ...prev, ...updates })); // Immediate visual update
					updateLocalCache(updates);
					setIsEditingComment(false);
					toast.success("Comment updated");
				},
				onError: () => toast.error("Failed to update comment"),
			},
		);
	};

	const handleSaveValue = () => {
		const numericValue =
			valueDraft === "" ? undefined : Number.parseFloat(valueDraft);
		updateBooking(
			{
				bookingId: displayBooking.id,
				data: { ...getCommonBookingData(), potential_deal_value: numericValue },
			},
			{
				onSuccess: () => {
					const updates = { potential_deal_value: numericValue };
					saveOverride(updates); // Persist override
					setDisplayBooking((prev) => ({ ...prev, ...updates })); // Immediate visual update
					updateLocalCache(updates);
					setIsEditingValue(false);
					toast.success("Deal value updated");
				},
				onError: () => toast.error("Failed to update deal value"),
			},
		);
	};

	const handleTogglePresent = () => {
		openConfirm({
			message:
				displayBooking.attendance === "Present"
					? "Are you sure you want to unmark this attendee as Present?"
					: "Mark this attendee as Present?",
			confirmLabel: displayBooking.attendance === "Present" ? "Unmark" : "Mark",
			variant: displayBooking.attendance === "Present" ? "warning" : "success",
			icon: displayBooking.attendance === "Present" ? "alert" : "check",
			onConfirm: confirmTogglePresent,
		});
	};

	const confirmTogglePresent = () => {
		const isCurrentlyPresent = displayBooking.attendance === "Present";
		const newPresentStatus = isCurrentlyPresent ? "" : "Present";
		// setShowConfirm(false); // No longer needed
		updateBooking(
			{
				bookingId: displayBooking.id,
				data: { ...getCommonBookingData(), attendance: newPresentStatus },
			},
			{
				onSuccess: () => {
					const updates = { attendance: newPresentStatus };
					saveOverride(updates); // Persist override
					setDisplayBooking((prev) => ({ ...prev, ...updates })); // Immediate visual update
					updateLocalCache(updates);
					toast.success(
						`Attendance ${newPresentStatus ? "marked as Present" : "cleared"}`,
					);
				},
				onError: () => toast.error("Failed to update attendance"),
			},
		);
	};

	const handleSetAttendance = (status: "Present" | "Absent" | "") => {
		updateBooking(
			{
				bookingId: displayBooking.id,
				data: { ...getCommonBookingData(), attendance: status },
			},
			{
				onSuccess: () => {
					const updates = { attendance: status };
					saveOverride(updates); // Persist override
					setDisplayBooking((prev) => ({ ...prev, ...updates })); // Immediate visual update
					updateLocalCache(updates);
					toast.success(`Attendance set to ${status || "cleared"}`);
				},
				onError: () => toast.error("Failed to update attendance"),
			},
		);
	};

	return (
		<Card className="flex h-full flex-col overflow-hidden shadow-none">
			<CardHeader className="shrink-0 space-y-0 p-1.5">
				<div className="flex items-center justify-between gap-1.5">
					<div className="min-w-0 flex-1 leading-tight">
						<CardTitle
							className="truncate font-semibold text-sm"
							title={displayBooking.name}
						>
							{displayBooking.name}
						</CardTitle>
					</div>
					<div className="flex items-center gap-1">
						<Badge
							variant={
								displayBooking.status === "Approved"
									? "default"
									: displayBooking.status === "Pending"
										? "secondary"
										: "outline"
							}
							className={cn(
								"h-4 shrink-0 px-1 text-[10px]",
								displayBooking.status === "Approved"
									? "bg-green-600 hover:bg-green-700"
									: displayBooking.status === "Pending"
										? "bg-yellow-500 text-white hover:bg-yellow-600"
										: "",
							)}
						>
							{displayBooking.status}
						</Badge>
						{(displayBooking.attendance === "Present" ||
							displayBooking.attendance === "Absent") && (
							<Badge
								variant={
									displayBooking.attendance === "Present"
										? "default"
										: "destructive"
								}
								className={cn(
									"h-4 shrink-0 px-1 text-[10px]",
									displayBooking.attendance === "Present"
										? "bg-green-600 hover:bg-green-700"
										: "bg-red-500 hover:bg-red-600",
								)}
							>
								{displayBooking.attendance}
							</Badge>
						)}
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant="ghost" size="sm" className="h-6 w-6 p-0">
									<MoreVertical className="h-4 w-4" />
									<span className="sr-only">Open actions</span>
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end" className="w-[180px]">
								{displayBooking.reschedule_link && (
									<DropdownMenuItem
										onClick={() =>
											window.open(displayBooking.reschedule_link, "_blank")
										}
									>
										Reschedule
									</DropdownMenuItem>
								)}
								{displayBooking.cancel_link && (
									<DropdownMenuItem
										onClick={() =>
											window.open(displayBooking.cancel_link, "_blank")
										}
										className="text-destructive focus:text-destructive"
									>
										Cancel
									</DropdownMenuItem>
								)}
								{displayBooking.attendance === "Present" && (
									<DropdownMenuItem
										onClick={() => handleSetAttendance("Absent")}
										disabled={isPending}
									>
										Mark Absent
									</DropdownMenuItem>
								)}
								{displayBooking.attendance === "Absent" && (
									<DropdownMenuItem
										onClick={() => handleSetAttendance("Present")}
										disabled={isPending}
									>
										Mark Present
									</DropdownMenuItem>
								)}
								{!displayBooking.attendance && (
									<>
										<DropdownMenuItem
											onClick={() => handleSetAttendance("Present")}
											disabled={isPending}
										>
											Mark Present
										</DropdownMenuItem>
										<DropdownMenuItem
											onClick={() => handleSetAttendance("Absent")}
											disabled={isPending}
										>
											Mark Absent
										</DropdownMenuItem>
									</>
								)}
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				</div>
			</CardHeader>
			<CardContent className="grid flex-1 gap-1.5 p-2 pt-2">
				<div className="flex items-center gap-1.5">
					<Calendar className="h-3 w-3 shrink-0" />
					<span className="truncate font-medium text-foreground text-sm">
						{displayBooking.booking_date}
					</span>
				</div>
				<div className="flex items-center gap-1.5">
					<Clock className="h-3 w-3 shrink-0" />
					<span className="truncate text-foreground text-sm">
						{displayBooking.booking_time} ({displayBooking.duration})
					</span>
				</div>
				{displayBooking.location && (
					<div className="flex items-center gap-1.5">
						<MapPin className="h-3 w-3 shrink-0" />
						<span
							className="flex-1 truncate text-sm"
							title={displayBooking.location}
						>
							{displayBooking.location.startsWith("http") ? (
								<a
									href={displayBooking.location}
									target="_blank"
									rel="noreferrer"
									className="flex items-center gap-1 text-primary hover:underline"
								>
									Online <ExternalLink className="h-2.5 w-2.5" />
								</a>
							) : (
								displayBooking.location
							)}
						</span>
					</div>
				)}
				{(displayBooking.email || displayBooking.phone) && (
					<div className="mt-1 grid gap-1.5 border-t pt-1">
						{displayBooking.email && (
							<div
								className="flex items-center gap-1.5 truncate text-muted-foreground"
								title={displayBooking.email}
							>
								<Mail className="h-3 w-3 shrink-0" />
								<span className="truncate text-sm">{displayBooking.email}</span>
							</div>
						)}
						{displayBooking.phone && (
							<div
								className="flex items-center gap-1.5 truncate text-muted-foreground"
								title={displayBooking.phone}
							>
								<Phone className="h-3 w-3 shrink-0" />
								<span className="truncate text-sm">{displayBooking.phone}</span>
							</div>
						)}
					</div>
				)}

				{/* Host Comment Section */}
				<div className="mt-1 border-t pt-1">
					{isEditingComment ? (
						<div className="space-y-1">
							<div className="flex items-center gap-1 font-medium text-muted-foreground text-xs">
								<MessageSquare className="h-3 w-3" /> Host Comment
							</div>
							<Textarea
								value={commentDraft}
								onChange={(e) => setCommentDraft(e.target.value)}
								className="min-h-[60px] p-2 text-xs"
								placeholder="Add a comment..."
							/>
							<div className="flex justify-end gap-2">
								<Button
									variant="outline"
									size="sm"
									onClick={() => {
										setIsEditingComment(false);
										setCommentDraft(displayBooking.host_comment || "");
									}}
								>
									Cancel
								</Button>
								<Button
									size="sm"
									onClick={handleSaveComment}
									disabled={isPending}
								>
									Save
								</Button>
							</div>
						</div>
					) : (
						<Button
							variant="outline"
							size="sm"
							className="h-auto w-full justify-start whitespace-normal py-1.5 text-left font-normal text-muted-foreground text-xs"
							onClick={() => {
								setIsEditingComment(true);
								setCommentDraft(displayBooking.host_comment || "");
							}}
						>
							<MessageSquare className="mr-2 h-3 w-3 shrink-0" />
							<span className="line-clamp-2">
								{displayBooking.host_comment
									? displayBooking.host_comment
									: "Add Comment..."}
							</span>
						</Button>
					)}
				</div>

				<div className="pt-0">
					{isEditingValue ? (
						<div className="mt-1 space-y-1">
							<div className="flex items-center gap-1 font-medium text-muted-foreground text-xs">
								<DollarSign className="h-3 w-3" /> Deal Value
							</div>
							<div className="flex gap-2">
								<Input
									type="number"
									value={valueDraft}
									onChange={(e) => setValueDraft(e.target.value)}
									className="h-7 flex-1 px-2 text-xs"
									placeholder="Value..."
								/>
								<Button
									variant="outline"
									size="sm"
									onClick={() => {
										setIsEditingValue(false);
										setValueDraft(
											displayBooking.potential_deal_value?.toString() || "",
										);
									}}
								>
									Cancel
								</Button>
								<Button
									size="sm"
									onClick={handleSaveValue}
									disabled={isPending}
								>
									Save
								</Button>
							</div>
						</div>
					) : (
						<Button
							variant="outline"
							size="sm"
							className="mt-1 h-auto w-full justify-start py-1.5 font-normal text-muted-foreground text-xs"
							onClick={() => {
								setIsEditingValue(true);
								setValueDraft(
									displayBooking.potential_deal_value?.toString() || "",
								);
							}}
						>
							<DollarSign className="mr-2 h-3 w-3 shrink-0" />
							<span className="truncate">
								{displayBooking.potential_deal_value
									? `Deal: ${displayBooking.potential_deal_value}`
									: "Set Potential Deal Value..."}
							</span>
						</Button>
					)}
				</div>
			</CardContent>
			<CardFooter className="flex shrink-0 flex-col gap-2 border-t bg-muted/10 p-2 pt-2">
				{displayBooking.status !== "Approved" &&
					displayBooking.meeting_approval_link && (
						<Button
							size="sm"
							className="h-6 w-full bg-green-600 text-sm text-white hover:bg-green-700"
							onClick={() =>
								window.open(displayBooking.meeting_approval_link, "_blank")
							}
						>
							<CheckCircle className="mr-1 h-3 w-3" /> Approve
						</Button>
					)}

				{displayBooking.status === "Approved" &&
					(!displayBooking.attendance ||
						(displayBooking.attendance !== "Present" &&
							displayBooking.attendance !== "Absent")) && (
						<Button
							variant="outline"
							size="sm"
							className="h-6 w-full text-sm"
							onClick={handleTogglePresent}
							disabled={isPending}
						>
							<CheckCircle className="mr-1 h-3 w-3" />
							Mark Attendance
						</Button>
					)}
			</CardFooter>
		</Card>
	);
}
