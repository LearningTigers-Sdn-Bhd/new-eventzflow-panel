import { useQueryClient } from "@tanstack/react-query";
import {
	Calendar,
	CheckCircle,
	ChevronDown,
	ChevronRight,
	Clock,
	DollarSign,
	ExternalLink,
	Mail,
	MapPin,
	MessageSquare,
	MoreVertical,
	Phone,
	User,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	useCancelBooking,
	useUpdateBooking,
} from "@/hooks/use-business-matching";
import { useConfirmDialog } from "@/hooks/use-confirm-dialog";
import { useDialog } from "@/hooks/use-dialog";
import type { Booking, BookingsResponse } from "@/lib/api/business-matching";
import { cn } from "@/lib/utils";
import BookerProfileDialog from "./booker-profile-dialog";
import {
	CompactCard as Card,
	CompactCardContent as CardContent,
	CompactCardFooter as CardFooter,
	CompactCardHeader as CardHeader,
	CompactCardTitle as CardTitle,
} from "./compact-booking-card";
import EditBookingCommentDialog from "./edit-booking-comment-dialog";
import EditBookingValueDialog from "./edit-booking-value-dialog";

interface BookingCardItemProps {
	booking: Booking;
	bmEventId: string;
	eventId: string;
	// "card" is the full grid card; "row" is a single-line summary that
	// expands in place to reveal the same comment/deal-value/attendance
	// controls, used by the compact bookings list view.
	variant?: "card" | "row";
}

export function BookingCardItem({
	booking,
	bmEventId,
	eventId,
	variant = "card",
}: BookingCardItemProps) {
	const {
		mutate: updateBooking,
		mutateAsync: updateBookingAsync,
		isPending,
	} = useUpdateBooking(bmEventId, eventId);
	const { mutate: cancelBookingMutation, isPending: isCancelling } =
		useCancelBooking(bmEventId, eventId);
	const queryClient = useQueryClient();
	const { openConfirm } = useConfirmDialog();
	const { openDialog } = useDialog();

	const [displayBooking, setDisplayBooking] = useState(booking); // Local display state
	const [isExpanded, setIsExpanded] = useState(false);

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

	const bookerProfileInfo = useMemo(() => {
		const description = displayBooking.booker_description || "";
		const sourcingIntent = displayBooking.booker_sourcing_intent || "";
		const capabilities = displayBooking.booker_capabilities || "";

		if (!description && !sourcingIntent && !capabilities) return null;

		return { description, sourcingIntent, capabilities };
	}, [
		displayBooking.booker_description,
		displayBooking.booker_sourcing_intent,
		displayBooking.booker_capabilities,
	]);

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

	const handleSaveComment = async (commentValue: string) => {
		try {
			await updateBookingAsync({
				bookingId: displayBooking.id,
				data: { ...getCommonBookingData(), host_comment: commentValue },
			});
			const updates = { host_comment: commentValue };
			saveOverride(updates); // Persist override
			setDisplayBooking((prev) => ({ ...prev, ...updates })); // Immediate visual update
			updateLocalCache(updates);
			toast.success("Comment updated");
		} catch {
			toast.error("Failed to update comment");
			throw new Error("Failed to update comment");
		}
	};

	const handleSaveValue = async (valueDraft: string) => {
		const numericValue =
			valueDraft === "" ? undefined : Number.parseFloat(valueDraft);
		try {
			await updateBookingAsync({
				bookingId: displayBooking.id,
				data: { ...getCommonBookingData(), potential_deal_value: numericValue },
			});
			const updates = { potential_deal_value: numericValue };
			saveOverride(updates); // Persist override
			setDisplayBooking((prev) => ({ ...prev, ...updates })); // Immediate visual update
			updateLocalCache(updates);
			toast.success("Deal value updated");
		} catch {
			toast.error("Failed to update deal value");
			throw new Error("Failed to update deal value");
		}
	};

	const openCommentDialog = () => {
		openDialog({
			component: EditBookingCommentDialog,
			props: {
				initialValue: displayBooking.host_comment || "",
				onSave: handleSaveComment,
			},
			config: {
				title: "Host Comment",
				size: "md",
			},
		});
	};

	const openValueDialog = () => {
		openDialog({
			component: EditBookingValueDialog,
			props: {
				initialValue: displayBooking.potential_deal_value?.toString() || "",
				onSave: handleSaveValue,
			},
			config: {
				title: "Potential Deal Value",
				size: "sm",
			},
		});
	};

	const handleCancelBooking = () => {
		openConfirm({
			message: `Are you sure you want to cancel ${displayBooking.name}'s booking? This cannot be undone.`,
			confirmLabel: "Yes, Cancel Booking",
			variant: "destructive",
			icon: "alert",
			onConfirm: () => {
				cancelBookingMutation(displayBooking.id, {
					onSuccess: () => {
						toast.success("Booking cancelled");
					},
					onError: (error) => {
						toast.error("Failed to cancel booking", {
							description: error.message || "An unexpected error occurred.",
						});
					},
				});
			},
		});
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

	const statusBadge = (
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
	);

	const attendanceBadge = (displayBooking.attendance === "Present" ||
		displayBooking.attendance === "Absent") && (
		<Badge
			variant={
				displayBooking.attendance === "Present" ? "default" : "destructive"
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
	);

	const actionsMenu = (
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
				{displayBooking.status !== "Cancelled" && (
					<DropdownMenuItem
						onClick={handleCancelBooking}
						disabled={isCancelling}
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
	);

	const commentSection = (
		<div className="mt-1 border-t pt-1">
			<Button
				variant="outline"
				size="sm"
				className="h-auto w-full justify-start whitespace-normal py-1.5 text-left font-normal text-muted-foreground text-xs"
				onClick={openCommentDialog}
			>
				<MessageSquare className="mr-2 h-3 w-3 shrink-0" />
				<span className="line-clamp-2">
					{displayBooking.host_comment
						? displayBooking.host_comment
						: "Add Comment..."}
				</span>
			</Button>
		</div>
	);

	const dealValueSection = (
		<div className="pt-0">
			<Button
				variant="outline"
				size="sm"
				className="mt-1 h-auto w-full justify-start py-1.5 font-normal text-muted-foreground text-xs"
				onClick={openValueDialog}
			>
				<DollarSign className="mr-2 h-3 w-3 shrink-0" />
				<span className="truncate">
					{displayBooking.potential_deal_value
						? `Deal: ${displayBooking.potential_deal_value}`
						: "Set Potential Deal Value..."}
				</span>
			</Button>
		</div>
	);

	const bookerProfileSection = bookerProfileInfo && (
		<div className="mt-2 border-t pt-2">
			<Button
				variant="outline"
				size="sm"
				type="button"
				onClick={() =>
					openDialog({
						component: BookerProfileDialog,
						props: {
							name: displayBooking.name,
							email: displayBooking.email,
							phone: displayBooking.phone,
							description: bookerProfileInfo.description,
							sourcingIntent: bookerProfileInfo.sourcingIntent,
							capabilities: bookerProfileInfo.capabilities,
						},
						config: {
							title: "Booker Profile Details",
							size: "md",
						},
					})
				}
				className="h-7 w-full justify-center gap-1.5 text-xs"
			>
				<User className="h-3 w-3 text-primary" />
				View Booker Profile Details
			</Button>
		</div>
	);

	const attendanceFooter = (
		<>
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
		</>
	);

	if (variant === "row") {
		return (
			<div className="rounded-md border bg-card">
				<div className="flex flex-wrap items-center gap-x-4 gap-y-1 px-3 py-2 text-sm">
					<button
						type="button"
						onClick={() => setIsExpanded((prev) => !prev)}
						className="flex min-w-0 flex-1 flex-wrap items-center gap-x-4 gap-y-1 text-left"
					>
						{isExpanded ? (
							<ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
						) : (
							<ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
						)}
						<div className="flex min-w-0 basis-40 items-center gap-1.5">
							<User className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
							<span
								className="truncate font-medium"
								title={displayBooking.name}
							>
								{displayBooking.name}
							</span>
						</div>
						<div className="flex shrink-0 items-center gap-1.5 text-muted-foreground">
							<Calendar className="h-3.5 w-3.5 shrink-0" />
							<span>{displayBooking.booking_date}</span>
						</div>
						<div className="flex shrink-0 items-center gap-1.5 text-muted-foreground">
							<Clock className="h-3.5 w-3.5 shrink-0" />
							<span>{displayBooking.booking_time}</span>
						</div>
						{displayBooking.location && !isExpanded && (
							<div className="flex min-w-0 basis-32 items-center gap-1.5 text-muted-foreground">
								<MapPin className="h-3.5 w-3.5 shrink-0" />
								<span className="truncate" title={displayBooking.location}>
									{displayBooking.location.startsWith("http")
										? "Online"
										: displayBooking.location}
								</span>
							</div>
						)}
					</button>
					<div className="ml-auto flex shrink-0 items-center gap-1">
						{statusBadge}
						{attendanceBadge}
						{actionsMenu}
					</div>
				</div>

				{isExpanded && (
					<div className="grid gap-1.5 border-t p-2 pt-2">
						{displayBooking.location && (
							<div className="flex items-start gap-1.5 pb-1 text-muted-foreground">
								<MapPin className="mt-0.5 h-3 w-3 shrink-0" />
								{displayBooking.location.startsWith("http") ? (
									<a
										href={displayBooking.location}
										target="_blank"
										rel="noreferrer"
										className="flex items-center gap-1 text-primary text-sm hover:underline"
									>
										Online <ExternalLink className="h-2.5 w-2.5 shrink-0" />
									</a>
								) : (
									<span className="whitespace-pre-wrap break-words text-sm">
										{displayBooking.location}
									</span>
								)}
							</div>
						)}
						{(displayBooking.email || displayBooking.phone) && (
							<div className="grid gap-1.5 pb-1">
								{displayBooking.email && (
									<div
										className="flex items-center gap-1.5 truncate text-muted-foreground"
										title={displayBooking.email}
									>
										<Mail className="h-3 w-3 shrink-0" />
										<span className="truncate text-sm">
											{displayBooking.email}
										</span>
									</div>
								)}
								{displayBooking.phone && (
									<div
										className="flex items-center gap-1.5 truncate text-muted-foreground"
										title={displayBooking.phone}
									>
										<Phone className="h-3 w-3 shrink-0" />
										<span className="truncate text-sm">
											{displayBooking.phone}
										</span>
									</div>
								)}
							</div>
						)}
						{commentSection}
						{dealValueSection}
						{bookerProfileSection}
						{attendanceFooter && (
							<div className="mt-1 flex flex-col gap-2 border-t pt-2">
								{attendanceFooter}
							</div>
						)}
					</div>
				)}
			</div>
		);
	}

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
						{statusBadge}
						{attendanceBadge}
						{actionsMenu}
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
				{commentSection}

				{dealValueSection}
				{bookerProfileSection}
			</CardContent>
			<CardFooter className="flex shrink-0 flex-col gap-2 border-t bg-muted/10 p-2 pt-2">
				{attendanceFooter}
			</CardFooter>
		</Card>
	);
}
