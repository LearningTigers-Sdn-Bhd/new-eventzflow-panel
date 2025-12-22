import { useState, useEffect } from "react";
import { Calendar, Clock, MapPin, Mail, Phone, CheckCircle, MoreVertical, MessageSquare, DollarSign, X, Save, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
    CompactCard as Card, 
    CompactCardHeader as CardHeader, 
    CompactCardTitle as CardTitle, 
    CompactCardContent as CardContent, 
    CompactCardFooter as CardFooter 
} from "./compact-booking-card";
import type { Booking } from "@/lib/api/business-matching";
import { useUpdateBooking } from "@/hooks/use-business-matching";
import { toast } from "sonner";
import ConfirmDialog from "@/components/pages/event/settings/confirm-dialog";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useQueryClient } from "@tanstack/react-query";

interface BookingCardItemProps {
    booking: Booking;
    bmEventId: string;
    eventId: string;
}

export function BookingCardItem({ booking, bmEventId, eventId }: BookingCardItemProps) {
    const { mutate: updateBooking, isPending } = useUpdateBooking(bmEventId, eventId);
    const queryClient = useQueryClient();

    const [displayBooking, setDisplayBooking] = useState(booking); // Local display state

    // Sync local state with prop updates and localStorage overrides
    useEffect(() => {
        const stored = localStorage.getItem(`booking_override_${booking.id}`);
        if (stored) {
             try {
                const overrides = JSON.parse(stored);
                setDisplayBooking({ ...booking, ...overrides });
             } catch (e) {
                setDisplayBooking(booking);
             }
        } else {
             setDisplayBooking(booking);
        }
    }, [booking]);

    const saveOverride = (updates: Partial<Booking>) => {
        const key = `booking_override_${booking.id}`;
        const existing = localStorage.getItem(key) ? JSON.parse(localStorage.getItem(key)!) : {};
        const newOverrides = { ...existing, ...updates };
        localStorage.setItem(key, JSON.stringify(newOverrides));
    };

    const [isEditingComment, setIsEditingComment] = useState(false);
    const [commentDraft, setCommentDraft] = useState(displayBooking.host_comment || "");

    const [isEditingValue, setIsEditingValue] = useState(false);
    const [valueDraft, setValueDraft] = useState<string>(displayBooking.potential_deal_value?.toString() || "");

    const [showConfirm, setShowConfirm] = useState(false);

    const getCommonBookingData = () => ({
        name: displayBooking.name,
        email: displayBooking.email,
        phone: displayBooking.phone,
        booking_date: displayBooking.booking_date,
        booking_time: displayBooking.booking_time,
        status: displayBooking.status,
        payment_status: displayBooking.payment_status,
        host_comment: displayBooking.host_comment,
        potential_deal_value: displayBooking.potential_deal_value, // This is already a number from interface
        attendance: displayBooking.attendance
    });

    const updateLocalCache = (updates: Partial<Booking>) => {
        queryClient.setQueryData(
            ["business-matching-bookings", bmEventId, eventId],
            (oldData: any) => {
                if (!oldData || !oldData.bookings) return oldData;
                return {
                    ...oldData,
                    bookings: oldData.bookings.map((b: any) =>
                        b.id === displayBooking.id ? { ...b, ...updates } : b
                    ),
                };
            }
        );
    };

    const handleSaveComment = () => {
        updateBooking(
            { bookingId: displayBooking.id, data: { ...getCommonBookingData(), host_comment: commentDraft } },
            {
                onSuccess: () => {
                    const updates = { host_comment: commentDraft };
                    saveOverride(updates); // Persist override
                    setDisplayBooking(prev => ({ ...prev, ...updates })); // Immediate visual update
                    updateLocalCache(updates);
                    setIsEditingComment(false);
                    toast.success("Comment updated");
                },
                onError: () => toast.error("Failed to update comment")
            }
        );
    };

    const handleSaveValue = () => {
        const numericValue = valueDraft === "" ? null : parseFloat(valueDraft);
        updateBooking(
            { bookingId: displayBooking.id, data: { ...getCommonBookingData(), potential_deal_value: numericValue } },
            {
                onSuccess: () => {
                    const updates = { potential_deal_value: numericValue };
                    saveOverride(updates); // Persist override
                    setDisplayBooking(prev => ({ ...prev, ...updates })); // Immediate visual update
                    updateLocalCache(updates);
                    setIsEditingValue(false);
                    toast.success("Deal value updated");
                },
                onError: () => toast.error("Failed to update deal value")
            }
        );
    };

    const handleTogglePresent = () => {
        setShowConfirm(true);
    };

    const confirmTogglePresent = () => {
        const isCurrentlyPresent = displayBooking.attendance === "Present";
        const newPresentStatus = isCurrentlyPresent ? "" : "Present";
        setShowConfirm(false);
        updateBooking(
            { bookingId: displayBooking.id, data: { ...getCommonBookingData(), attendance: newPresentStatus } },
            {
                onSuccess: () => {
                    const updates = { attendance: newPresentStatus };
                    saveOverride(updates); // Persist override
                    setDisplayBooking(prev => ({ ...prev, ...updates })); // Immediate visual update
                    updateLocalCache(updates);
                    toast.success(`Attendance ${newPresentStatus ? "marked as Present" : "cleared"}`);
                },
                onError: () => toast.error("Failed to update attendance")
            }
        );
    };

    const handleSetAttendance = (status: "Present" | "Absent" | "") => {
        updateBooking(
            { bookingId: displayBooking.id, data: { ...getCommonBookingData(), attendance: status } },
            {
                onSuccess: () => {
                    const updates = { attendance: status };
                    saveOverride(updates); // Persist override
                    setDisplayBooking(prev => ({ ...prev, ...updates })); // Immediate visual update
                    updateLocalCache(updates);
                    toast.success(`Attendance set to ${status || "cleared"}`);
                },
                onError: () => toast.error("Failed to update attendance")
            }
        );
    };

    const isPresent = displayBooking.attendance === "Present";

    return (
        <>
            <Card className="overflow-hidden border text-sm flex flex-col h-full shadow-none">
                <CardHeader className="bg-muted/30 p-1.5 space-y-0 shrink-0">
                    <div className="flex justify-between items-center gap-1.5">
                        <div className="min-w-0 flex-1 leading-tight">
                            <CardTitle className="text-sm font-semibold truncate" title={displayBooking.name}>{displayBooking.name}</CardTitle>
                        </div>
                        <div className="flex items-center gap-1">
                            <Badge 
                                variant={displayBooking.status === 'Approved' ? 'default' : displayBooking.status === 'Pending' ? 'secondary' : 'outline'}
                                className={`text-[10px] h-4 px-1 shrink-0 ${displayBooking.status === 'Approved' ? 'bg-green-600 hover:bg-green-700' : displayBooking.status === 'Pending' ? 'bg-yellow-500 hover:bg-yellow-600 text-white' : ''}`}
                            >
                                {displayBooking.status}
                            </Badge>
                            {(displayBooking.attendance === 'Present' || displayBooking.attendance === 'Absent') && (
                                <Badge
                                    variant={displayBooking.attendance === 'Present' ? 'default' : 'destructive'}
                                    className={`text-[10px] h-4 px-1 shrink-0 ${displayBooking.attendance === 'Present' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-500 hover:bg-red-600'}`}
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
                                        <DropdownMenuItem onClick={() => window.open(displayBooking.reschedule_link, '_blank')}>
                                            Reschedule
                                        </DropdownMenuItem>
                                    )}
                                    {displayBooking.cancel_link && (
                                        <DropdownMenuItem onClick={() => window.open(displayBooking.cancel_link, '_blank')} className="text-destructive focus:text-destructive">
                                            Cancel
                                        </DropdownMenuItem>
                                    )}
                                    {displayBooking.attendance === "Present" && (
                                        <DropdownMenuItem onClick={() => handleSetAttendance("Absent")} disabled={isPending}>
                                            Mark Absent
                                        </DropdownMenuItem>
                                    )}
                                    {displayBooking.attendance === "Absent" && (
                                        <DropdownMenuItem onClick={() => handleSetAttendance("Present")} disabled={isPending}>
                                            Mark Present
                                        </DropdownMenuItem>
                                    )}
                                    {!displayBooking.attendance && (
                                            <DropdownMenuItem onClick={() => handleSetAttendance("Absent")} disabled={isPending}>
                                            Mark Absent
                                        </DropdownMenuItem>
                                    )}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-2 pt-2 grid gap-1.5 flex-1">
                    <div className="flex items-center gap-1.5">
                        <Calendar className="h-3 w-3 shrink-0" />
                        <span className="text-foreground font-medium truncate text-sm">{displayBooking.booking_date}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Clock className="h-3 w-3 shrink-0" />
                        <span className="text-foreground truncate text-sm">{displayBooking.booking_time} ({displayBooking.duration})</span>
                    </div>
                    {displayBooking.location && (
                        <div className="flex items-center gap-1.5">
                            <MapPin className="h-3 w-3 shrink-0" />
                            <span className="truncate flex-1 text-sm" title={displayBooking.location}>
                                    {displayBooking.location.startsWith('http') ? (
                                    <a href={displayBooking.location} target="_blank" rel="noreferrer" className="text-primary hover:underline flex items-center gap-1">
                                        Online <ExternalLink className="h-2.5 w-2.5" />
                                    </a>
                                ) : displayBooking.location}
                            </span>
                        </div>
                    )}
                        {(displayBooking.email || displayBooking.phone) && (
                        <div className="pt-1 border-t mt-1 grid gap-1.5">
                            {displayBooking.email && (
                                <div className="flex items-center gap-1.5 text-muted-foreground truncate" title={displayBooking.email}>
                                    <Mail className="h-3 w-3 shrink-0" />
                                    <span className="truncate text-sm">{displayBooking.email}</span>
                                </div>
                            )}
                            {displayBooking.phone && (
                                <div className="flex items-center gap-1.5 text-muted-foreground truncate" title={displayBooking.phone}>
                                    <Phone className="h-3 w-3 shrink-0" />
                                    <span className="truncate text-sm">{displayBooking.phone}</span>
                                </div>
                            )}
                        </div>
                    )}
                    
                    {/* Host Comment Section */}
                    <div className="pt-1 border-t mt-1">
                        {isEditingComment ? (
                            <div className="space-y-1">
                                <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                                    <MessageSquare className="h-3 w-3" /> Host Comment
                                </div>
                                <Textarea 
                                    value={commentDraft} 
                                    onChange={(e) => setCommentDraft(e.target.value)} 
                                    className="text-xs min-h-[60px] p-2"
                                    placeholder="Add a comment..."
                                />
                                <div className="flex justify-end gap-2">
                                    <Button variant="outline" size="sm" onClick={() => { setIsEditingComment(false); setCommentDraft(displayBooking.host_comment || ""); }}>
                                        Cancel
                                    </Button>
                                    <Button size="sm" onClick={handleSaveComment} disabled={isPending}>
                                        Save
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-auto py-1.5 w-full justify-start text-xs font-normal text-muted-foreground whitespace-normal text-left"
                                onClick={() => { setIsEditingComment(true); setCommentDraft(displayBooking.host_comment || ""); }}
                            >
                                <MessageSquare className="mr-2 h-3 w-3 shrink-0" />
                                <span className="line-clamp-2">
                                    {displayBooking.host_comment ? displayBooking.host_comment : "Add Comment..."}
                                </span>
                            </Button>
                        )}
                    </div>

                    <div className="pt-0">
                        {isEditingValue ? (
                            <div className="space-y-1 mt-1">
                                    <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                                    <DollarSign className="h-3 w-3" /> Deal Value
                                </div>
                                <div className="flex gap-2">
                                    <Input 
                                        type="number"
                                        value={valueDraft} 
                                        onChange={(e) => setValueDraft(e.target.value)} 
                                        className="text-xs h-7 px-2 flex-1"
                                        placeholder="Value..."
                                    />
                                    <Button variant="outline" size="sm" onClick={() => { setIsEditingValue(false); setValueDraft(displayBooking.potential_deal_value || ""); }}>
                                        Cancel
                                    </Button>
                                    <Button size="sm" onClick={handleSaveValue} disabled={isPending}>
                                        Save
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-auto py-1.5 w-full justify-start text-xs font-normal text-muted-foreground mt-1"
                                onClick={() => { setIsEditingValue(true); setValueDraft(displayBooking.potential_deal_value || ""); }}
                            >
                                <DollarSign className="mr-2 h-3 w-3 shrink-0" />
                                <span className="truncate">
                                    {displayBooking.potential_deal_value ? `Deal: ${displayBooking.potential_deal_value}` : "Set Potential Deal Value..."}
                                </span>
                            </Button>
                        )}
                    </div>

                </CardContent>
                <CardFooter className="bg-muted/10 p-2 pt-2 flex flex-col gap-2 border-t shrink-0">
                        {displayBooking.status !== 'Approved' && displayBooking.meeting_approval_link && (
                        <Button 
                            size="sm" 
                            className="h-6 text-sm w-full bg-green-600 hover:bg-green-700 text-white"
                            onClick={() => window.open(displayBooking.meeting_approval_link, '_blank')}
                        >
                            <CheckCircle className="mr-1 h-3 w-3" /> Approve
                        </Button>
                    )}
                    
                    {(displayBooking.status === 'Approved' && (!displayBooking.attendance || (displayBooking.attendance !== 'Present' && displayBooking.attendance !== 'Absent'))) && (
                        <Button 
                            variant="outline"
                            size="sm" 
                            className="h-6 text-sm w-full"
                            onClick={handleTogglePresent}
                            disabled={isPending}
                        >
                            <CheckCircle className="mr-1 h-3 w-3" /> 
                            Mark Attendance
                        </Button>
                    )}
                </CardFooter>
            </Card>

            <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogTitle className="sr-only">Confirm Attendance Change</DialogTitle>
                    <ConfirmDialog
                        message={displayBooking.attendance === "Present" ? "Are you sure you want to unmark this attendee as Present?" : "Mark this attendee as Present?"}
                        confirmLabel={displayBooking.attendance === "Present" ? "Unmark" : "Mark"}
                        variant={displayBooking.attendance === "Present" ? "warning" : "success"}
                        icon={displayBooking.attendance === "Present" ? "alert" : "check"}
                        onConfirm={confirmTogglePresent}
                        onCancel={() => setShowConfirm(false)}
                    />
                </DialogContent>
            </Dialog>
        </>
    );
}
