import { useQueryClient } from "@tanstack/react-query";
import {
	Calendar,
	CheckCircle,
	ChevronDown,
	ChevronRight,
	Clock,
	Copy,
	DollarSign,
	ExternalLink,
	Loader2,
	Mail,
	MapPin,
	MessageSquare,
	Pencil,
	Phone,
	User,
	XCircle,
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
	useApproveBooking,
	useCancelBooking,
	useUpdateBooking,
} from "@/hooks/use-business-matching";
import { useConfirmDialog } from "@/hooks/use-confirm-dialog";
import type { Booking, BookingsResponse } from "@/lib/api/business-matching";
import { cn } from "@/lib/utils";
import BookerProfileSheet from "./booker-profile-sheet";
import {
	CompactCard as Card,
	CompactCardContent as CardContent,
	CompactCardFooter as CardFooter,
	CompactCardHeader as CardHeader,
	CompactCardTitle as CardTitle,
} from "./compact-booking-card";

const BOOKING_STATUS_STYLE: Record<string, string> = {
	Approved: "bg-green-100 text-green-800",
	Pending: "bg-amber-100 text-amber-800",
	Cancelled: "bg-gray-100 text-gray-800",
};

interface BookingCardItemProps {
	booking: Booking;
	bmEventId: string;
	eventId: string;
	// "card" is the full grid card; "row" is a single-line summary that
	// expands in place to reveal the same comment/deal-value/attendance
	// controls, used by the compact bookings list view.
	variant?: "card" | "row";
}

// A labelled note that edits in place: click to open a field with Save/Cancel.
// Empty notes render a dashed "add" prompt. onSave must throw on failure so
// the editor stays open (the caller already shows the error toast).
function InlineNote({
	icon,
	label,
	emptyLabel,
	kind,
	value,
	display,
	onSave,
}: {
	icon: React.ReactNode;
	label: string;
	emptyLabel: string;
	kind: "text" | "number";
	value: string;
	display: React.ReactNode;
	onSave: (value: string) => Promise<void>;
}) {
	const [editing, setEditing] = useState(false);
	const [draft, setDraft] = useState(value);
	const [saving, setSaving] = useState(false);

	const save = async () => {
		setSaving(true);
		try {
			await onSave(draft.trim());
			setEditing(false);
		} catch {
			// toast already shown by onSave; keep the editor open
		} finally {
			setSaving(false);
		}
	};

	if (editing) {
		return (
			<div className="flex flex-col gap-2 rounded-none border border-primary bg-background p-2.5">
				<span className="flex items-center gap-1.5 font-medium text-muted-foreground text-xs">
					{icon}
					{label}
				</span>
				{kind === "text" ? (
					<Textarea
						value={draft}
						onChange={(e) => setDraft(e.target.value.slice(0, 500))}
						onKeyDown={(e) => {
							if (e.key === "Escape") setEditing(false);
							if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) save();
						}}
						placeholder="Meeting notes, follow-ups, impressions..."
						className="min-h-[88px] rounded-none text-sm"
						autoFocus
						disabled={saving}
					/>
				) : (
					<div className="relative">
						<DollarSign className="absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
						<Input
							type="number"
							inputMode="decimal"
							min={0}
							step="0.01"
							value={draft}
							onChange={(e) => setDraft(e.target.value)}
							onKeyDown={(e) => {
								if (e.key === "Escape") setEditing(false);
								if (e.key === "Enter") save();
							}}
							placeholder="0.00"
							className="h-9 rounded-none pl-8 font-semibold tabular-nums"
							autoFocus
							disabled={saving}
						/>
					</div>
				)}
				<div className="flex items-center justify-between gap-2">
					<span className="text-[11px] text-muted-foreground">
						{kind === "text"
							? `${draft.length}/500 · Ctrl+Enter to save`
							: "Enter to save"}
					</span>
					<div className="flex gap-1.5">
						<Button
							type="button"
							variant="outline"
							size="sm"
							className="h-7 rounded-none text-xs"
							onClick={() => setEditing(false)}
							disabled={saving}
						>
							Cancel
						</Button>
						<Button
							type="button"
							size="sm"
							className="h-7 rounded-none text-xs"
							onClick={save}
							disabled={saving}
						>
							{saving && <Loader2 className="mr-1 h-3 w-3 animate-spin" />}
							Save
						</Button>
					</div>
				</div>
			</div>
		);
	}

	return (
		<button
			type="button"
			onClick={() => {
				setDraft(value);
				setEditing(true);
			}}
			title={`Edit ${label.toLowerCase()}`}
			className={cn(
				"group flex w-full flex-col gap-1 rounded-none border p-2.5 text-left transition-colors hover:bg-muted/50",
				display ? "bg-muted/20" : "border-dashed bg-transparent",
			)}
		>
			<span className="flex items-center justify-between gap-2 text-muted-foreground text-xs">
				<span className="flex items-center gap-1.5 font-medium">
					{icon}
					{label}
				</span>
				<Pencil className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
			</span>
			{display || (
				<span className="text-muted-foreground text-sm">+ {emptyLabel}</span>
			)}
		</button>
	);
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
	const { mutate: approveBookingMutation, isPending: isApproving } =
		useApproveBooking(bmEventId, eventId);
	const queryClient = useQueryClient();
	const { openConfirm } = useConfirmDialog();

	const [displayBooking, setDisplayBooking] = useState(booking); // Local display state
	const [isExpanded, setIsExpanded] = useState(false);
	const [profileOpen, setProfileOpen] = useState(false);
	const isRow = variant === "row";

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

	const handleApproveBooking = () => {
		openConfirm({
			message: `Approve ${displayBooking.name}'s booking on ${displayBooking.booking_date} at ${displayBooking.booking_time}? They'll be emailed that it's confirmed.`,
			confirmLabel: "Yes, Approve",
			variant: "success",
			icon: "check",
			onConfirm: () => {
				approveBookingMutation(displayBooking.id, {
					onSuccess: () => {
						setDisplayBooking((prev) => ({ ...prev, status: "Approved" }));
						updateLocalCache({ status: "Approved" });
						toast.success("Booking approved");
					},
					onError: (error) => {
						toast.error("Failed to approve booking", {
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

	const statusBadge = (
		<Badge
			variant="secondary"
			className={cn(
				"shrink-0 rounded-none",
				BOOKING_STATUS_STYLE[displayBooking.status] ??
					"bg-gray-100 text-gray-800",
			)}
		>
			{displayBooking.status}
		</Badge>
	);

	const attendanceBadge = (displayBooking.attendance === "Present" ||
		displayBooking.attendance === "Absent") && (
		<Badge
			variant="secondary"
			className={cn(
				"shrink-0 rounded-none",
				displayBooking.attendance === "Present"
					? "bg-emerald-100 text-emerald-800"
					: "bg-red-100 text-red-800",
			)}
		>
			{displayBooking.attendance}
		</Badge>
	);

	const contactInfoSection = (displayBooking.email || displayBooking.phone) && (
		<div
			className={cn(
				"flex flex-col gap-1 text-xs",
				!isRow && "mt-1 border-t pt-1",
			)}
		>
			{displayBooking.email && (
				<div className="group flex items-center justify-between gap-1">
					<div
						className="flex min-w-0 items-center gap-1.5 text-muted-foreground"
						title={displayBooking.email}
					>
						<Mail className="h-3 w-3 shrink-0" />
						<span className="truncate text-xs">{displayBooking.email}</span>
					</div>
					<Button
						type="button"
						variant="ghost"
						size="sm"
						className="h-5 w-5 shrink-0 p-0 text-muted-foreground hover:text-foreground"
						onClick={() => {
							navigator.clipboard.writeText(displayBooking.email);
							toast.success("Email copied to clipboard");
						}}
						title="Copy email"
					>
						<Copy className="h-3 w-3" />
						<span className="sr-only">Copy email</span>
					</Button>
				</div>
			)}
			{displayBooking.phone && (
				<div className="group flex items-center justify-between gap-1">
					<div
						className="flex min-w-0 items-center gap-1.5 text-muted-foreground"
						title={displayBooking.phone}
					>
						<Phone className="h-3 w-3 shrink-0" />
						<span className="truncate text-xs">{displayBooking.phone}</span>
					</div>
					<Button
						type="button"
						variant="ghost"
						size="sm"
						className="h-5 w-5 shrink-0 p-0 text-muted-foreground hover:text-foreground"
						onClick={() => {
							navigator.clipboard.writeText(displayBooking.phone);
							toast.success("Phone copied to clipboard");
						}}
						title="Copy phone"
					>
						<Copy className="h-3 w-3" />
						<span className="sr-only">Copy phone</span>
					</Button>
				</div>
			)}
		</div>
	);

	const dealValue = displayBooking.potential_deal_value;
	const hasDeal =
		dealValue !== undefined && dealValue !== null && dealValue > 0;

	const commentAndDealValueSection = (
		<div
			className={cn(
				"grid gap-2",
				isRow ? "sm:grid-cols-2" : "mt-1 border-t pt-2",
			)}
		>
			<InlineNote
				icon={<MessageSquare className="h-3.5 w-3.5" />}
				label="Host comment"
				emptyLabel="Add a comment"
				kind="text"
				value={displayBooking.host_comment || ""}
				display={
					displayBooking.host_comment && (
						<p className="line-clamp-3 whitespace-pre-wrap break-words text-foreground text-sm">
							{displayBooking.host_comment}
						</p>
					)
				}
				onSave={handleSaveComment}
			/>
			<InlineNote
				icon={<DollarSign className="h-3.5 w-3.5" />}
				label="Potential deal"
				emptyLabel="Add deal value"
				kind="number"
				value={dealValue?.toString() || ""}
				display={
					hasDeal && (
						<p className="font-semibold text-base text-green-700 tabular-nums dark:text-green-400">
							{Number(dealValue).toLocaleString(undefined, {
								maximumFractionDigits: 2,
							})}
						</p>
					)
				}
				onSave={handleSaveValue}
			/>
		</div>
	);

	const bookerProfileSection = bookerProfileInfo && (
		<div className={cn(isRow ? "flex-1" : "mt-1 border-t pt-1.5")}>
			<Button
				variant="outline"
				size="sm"
				type="button"
				onClick={() => setProfileOpen(true)}
				className="h-8 w-full justify-center gap-1.5 rounded-none text-xs"
			>
				<User className="h-3 w-3" />
				View booker profile
			</Button>
			<BookerProfileSheet
				open={profileOpen}
				onOpenChange={setProfileOpen}
				name={displayBooking.name}
				email={displayBooking.email}
				phone={displayBooking.phone}
				description={bookerProfileInfo.description}
				sourcingIntent={bookerProfileInfo.sourcingIntent}
				capabilities={bookerProfileInfo.capabilities}
			/>
		</div>
	);

	const bottomButtons = (
		<div className="flex w-full items-center gap-2">
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button
						variant="outline"
						size="sm"
						className="h-8 flex-1 rounded-none text-xs"
					>
						<Pencil className="mr-1.5 h-3 w-3" />
						Edit
						<ChevronDown className="ml-1 h-3 w-3 opacity-60" />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="start" className="w-[160px] rounded-none">
					{displayBooking.reschedule_link ? (
						<DropdownMenuItem
							onClick={() =>
								window.open(displayBooking.reschedule_link, "_blank")
							}
						>
							<Calendar className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
							Reschedule
						</DropdownMenuItem>
					) : (
						<DropdownMenuItem disabled>
							<Calendar className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
							Reschedule (Unavailable)
						</DropdownMenuItem>
					)}
					{displayBooking.status !== "Cancelled" && (
						<DropdownMenuItem
							onClick={handleCancelBooking}
							disabled={isCancelling}
							className="text-destructive focus:text-destructive"
						>
							<XCircle className="mr-2 h-3.5 w-3.5" />
							Cancel
						</DropdownMenuItem>
					)}
				</DropdownMenuContent>
			</DropdownMenu>

			{isRow && bookerProfileSection}

			{displayBooking.status === "Pending" ? (
				<Button
					size="sm"
					className="h-8 flex-1 rounded-none bg-green-600 text-white text-xs hover:bg-green-700"
					onClick={handleApproveBooking}
					disabled={isApproving}
				>
					<CheckCircle className="mr-1.5 h-3 w-3" />
					Approve
				</Button>
			) : (
				<Button
					variant={
						displayBooking.attendance === "Present" ? "default" : "outline"
					}
					size="sm"
					className={cn(
						"h-8 flex-1 rounded-none text-xs",
						displayBooking.attendance === "Present" &&
							"bg-green-600 text-white hover:bg-green-700",
					)}
					onClick={handleTogglePresent}
					disabled={isPending}
				>
					<CheckCircle className="mr-1.5 h-3 w-3" />
					{displayBooking.attendance === "Present"
						? "Marked Present"
						: "Mark Attendance"}
				</Button>
			)}
		</div>
	);

	if (variant === "row") {
		return (
			<div className="rounded-none border bg-card">
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
					</div>
				</div>

				{isExpanded && (
					<div className="border-t">
						<div className="grid gap-3 p-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
							<div className="flex flex-col gap-2">
								{displayBooking.location && (
									<div className="flex items-start gap-1.5 text-muted-foreground text-xs">
										<MapPin className="mt-0.5 h-3 w-3 shrink-0" />
										{displayBooking.location.startsWith("http") ? (
											<a
												href={displayBooking.location}
												target="_blank"
												rel="noreferrer"
												className="flex items-center gap-1 text-primary text-xs hover:underline"
											>
												Online <ExternalLink className="h-2.5 w-2.5 shrink-0" />
											</a>
										) : (
											<span className="whitespace-pre-wrap break-words text-xs">
												{displayBooking.location}
											</span>
										)}
									</div>
								)}
								{contactInfoSection}
							</div>
							{commentAndDealValueSection}
						</div>
						<div className="border-t p-3">{bottomButtons}</div>
					</div>
				)}
			</div>
		);
	}

	return (
		<Card className="flex h-full flex-col overflow-hidden shadow-none">
			<CardHeader className="shrink-0 space-y-0 border-b p-3">
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
					</div>
				</div>
			</CardHeader>
			<CardContent className="grid flex-1 gap-2 p-3">
				<div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
					<div className="flex items-center gap-1.5 font-medium text-foreground">
						<Calendar className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
						<span>{displayBooking.booking_date}</span>
					</div>
					<div className="flex items-center gap-1.5 text-muted-foreground">
						<Clock className="h-3.5 w-3.5 shrink-0" />
						<span>
							{displayBooking.booking_time}
							{displayBooking.duration ? ` (${displayBooking.duration})` : ""}
						</span>
					</div>
				</div>
				{displayBooking.location && (
					<div className="flex items-center gap-1.5 text-muted-foreground text-xs">
						<MapPin className="h-3 w-3 shrink-0" />
						<span className="flex-1 truncate" title={displayBooking.location}>
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
				{contactInfoSection}
				{commentAndDealValueSection}
				{bookerProfileSection}
			</CardContent>
			<CardFooter className="flex shrink-0 flex-col gap-2 border-t bg-muted/10 p-3">
				{bottomButtons}
			</CardFooter>
		</Card>
	);
}
