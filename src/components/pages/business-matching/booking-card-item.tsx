"use client";

import { useState } from "react";
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

interface BookingCardItemProps {
    booking: Booking;
    bmEventId: string;
    eventId: string;
}

export function BookingCardItem({ booking, bmEventId, eventId }: BookingCardItemProps) {
    const { mutate: updateBooking, isPending } = useUpdateBooking(bmEventId, eventId);
    
    const [isEditingComment, setIsEditingComment] = useState(false);
    const [commentDraft, setCommentDraft] = useState(booking.host_comment || "");

    const [isEditingValue, setIsEditingValue] = useState(false);
    const [valueDraft, setValueDraft] = useState(booking.potential_deal_value || "");

    const [showConfirm, setShowConfirm] = useState(false);

    const getCommonBookingData = () => ({
        name: booking.name,
        email: booking.email,
        phone: booking.phone,
        booking_date: booking.booking_date,
        booking_time: booking.booking_time,
        status: booking.status,
        payment_status: booking.payment_status,
        host_comment: booking.host_comment,
        potential_deal_value: booking.potential_deal_value,
        attendance: booking.attendance
    });

    const handleSaveComment = () => {
        updateBooking(
            { bookingId: booking.id, data: { ...getCommonBookingData(), host_comment: commentDraft } },
            {
                onSuccess: () => {
                    setIsEditingComment(false);
                    toast.success("Comment updated");
                },
                onError: () => toast.error("Failed to update comment")
            }
        );
    };

    const handleSaveValue = () => {
        updateBooking(
            { bookingId: booking.id, data: { ...getCommonBookingData(), potential_deal_value: valueDraft } },
            {
                onSuccess: () => {
                    setIsEditingValue(false);
                    toast.success("Deal value updated");
                },
                onError: () => toast.error("Failed to update deal value")
            }
        );
    };

    const handleMarkAttendance = () => {
        setShowConfirm(true);
    };

    const confirmMarkAttendance = () => {
        const isPresent = booking.attendance === "Present";
        const newStatus = isPresent ? "" : "Present";
        setShowConfirm(false);
        updateBooking(
            { bookingId: booking.id, data: { ...getCommonBookingData(), attendance: newStatus } },
            {
                onSuccess: () => toast.success(`Attendance ${newStatus ? "marked" : "unmarked"}`)
            }
        );
    };

    const isPresent = booking.attendance === "Present";

    return (
        <>
            <Card className="overflow-hidden border text-sm flex flex-col h-full shadow-none">
                <CardHeader className="bg-muted/30 p-1.5 space-y-0 shrink-0">
                    <div className="flex justify-between items-center gap-1.5">
                        <div className="min-w-0 flex-1 leading-tight">
                            <CardTitle className="text-sm font-semibold truncate" title={booking.name}>{booking.name}</CardTitle>
                            <p className="text-xs text-muted-foreground truncate" title={booking.event_title}>
                                {booking.event_title}
                            </p>
                        </div>
                        <div className="flex items-center gap-1">
                            <Badge 
                                variant={booking.status === 'Approved' ? 'default' : booking.status === 'Pending' ? 'secondary' : 'outline'}
                                className={`text-[10px] h-4 px-1 shrink-0 ${booking.status === 'Approved' ? 'bg-green-600 hover:bg-green-700' : booking.status === 'Pending' ? 'bg-yellow-500 hover:bg-yellow-600 text-white' : ''}`}
                            >
                                {booking.status}
                            </Badge>
                            {(booking.reschedule_link || booking.cancel_link) && (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                            <MoreVertical className="h-4 w-4" />
                                            <span className="sr-only">Open actions</span>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-[120px]">
                                        {booking.reschedule_link && (
                                            <DropdownMenuItem onClick={() => window.open(booking.reschedule_link, '_blank')}>
                                                Reschedule
                                            </DropdownMenuItem>
                                        )}
                                        {booking.cancel_link && (
                                            <DropdownMenuItem onClick={() => window.open(booking.cancel_link, '_blank')} className="text-destructive focus:text-destructive">
                                                Cancel
                                            </DropdownMenuItem>
                                        )}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            )}
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-2 pt-2 grid gap-1.5 flex-1">
                    <div className="flex items-center gap-1.5">
                        <Calendar className="h-3 w-3 shrink-0" />
                        <span className="text-foreground font-medium truncate text-sm">{booking.booking_date}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Clock className="h-3 w-3 shrink-0" />
                        <span className="text-foreground truncate text-sm">{booking.booking_time} ({booking.duration})</span>
                    </div>
                    {booking.location && (
                        <div className="flex items-center gap-1.5">
                            <MapPin className="h-3 w-3 shrink-0" />
                            <span className="truncate flex-1 text-sm" title={booking.location}>
                                 {booking.location.startsWith('http') ? (
                                    <a href={booking.location} target="_blank" rel="noreferrer" className="text-primary hover:underline flex items-center gap-1">
                                        Online <ExternalLink className="h-2.5 w-2.5" />
                                    </a>
                                ) : booking.location}
                            </span>
                        </div>
                    )}
                     {(booking.email || booking.phone) && (
                        <div className="pt-1 border-t mt-1 grid gap-1.5">
                            {booking.email && (
                                <div className="flex items-center gap-1.5 text-muted-foreground truncate" title={booking.email}>
                                    <Mail className="h-3 w-3 shrink-0" />
                                    <span className="truncate text-sm">{booking.email}</span>
                                </div>
                            )}
                            {booking.phone && (
                                <div className="flex items-center gap-1.5 text-muted-foreground truncate" title={booking.phone}>
                                    <Phone className="h-3 w-3 shrink-0" />
                                    <span className="truncate text-sm">{booking.phone}</span>
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
                                <div className="flex justify-end gap-1">
                                    <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => { setIsEditingComment(false); setCommentDraft(booking.host_comment || ""); }}>
                                        <X className="h-3 w-3" />
                                    </Button>
                                    <Button size="icon" variant="ghost" className="h-6 w-6 text-green-600" onClick={handleSaveComment} disabled={isPending}>
                                        <Save className="h-3 w-3" />
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-auto py-1.5 w-full justify-start text-xs font-normal text-muted-foreground whitespace-normal text-left"
                                onClick={() => { setIsEditingComment(true); setCommentDraft(booking.host_comment || ""); }}
                            >
                                <MessageSquare className="mr-2 h-3 w-3 shrink-0" />
                                <span className="line-clamp-2">
                                    {booking.host_comment ? booking.host_comment : "Add Comment..."}
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
                                <div className="flex gap-1">
                                    <Input 
                                        value={valueDraft} 
                                        onChange={(e) => setValueDraft(e.target.value)} 
                                        className="text-xs h-7 px-2"
                                        placeholder="Value..."
                                    />
                                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => { setIsEditingValue(false); setValueDraft(booking.potential_deal_value || ""); }}>
                                        <X className="h-3 w-3" />
                                    </Button>
                                    <Button size="icon" variant="ghost" className="h-7 w-7 text-green-600" onClick={handleSaveValue} disabled={isPending}>
                                        <Save className="h-3 w-3" />
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-auto py-1.5 w-full justify-start text-xs font-normal text-muted-foreground mt-1"
                                onClick={() => { setIsEditingValue(true); setValueDraft(booking.potential_deal_value || ""); }}
                            >
                                <DollarSign className="mr-2 h-3 w-3 shrink-0" />
                                <span className="truncate">
                                    {booking.potential_deal_value ? `Deal: ${booking.potential_deal_value}` : "Set Deal Value..."}
                                </span>
                            </Button>
                        )}
                    </div>

                </CardContent>
                <CardFooter className="bg-muted/10 p-2 pt-2 flex flex-col gap-2 border-t shrink-0">
                     {booking.status !== 'Approved' && booking.meeting_approval_link && (
                        <Button 
                            size="sm" 
                            className="h-6 text-sm w-full bg-green-600 hover:bg-green-700 text-white"
                            onClick={() => window.open(booking.meeting_approval_link, '_blank')}
                        >
                            <CheckCircle className="mr-1 h-3 w-3" /> Approve
                        </Button>
                    )}
                    
                    <Button 
                        variant={booking.attendance === "Present" ? "default" : "outline"}
                        size="sm" 
                        className={`h-6 text-sm w-full ${booking.attendance === "Present" ? "bg-green-600 hover:bg-green-700 text-white" : ""}`}
                        onClick={handleMarkAttendance}
                        disabled={isPending}
                    >
                        <CheckCircle className="mr-1 h-3 w-3" /> 
                        {booking.attendance === "Present" ? "Present" : "Mark Attendance"}
                    </Button>
                </CardFooter>
            </Card>

            <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogTitle className="sr-only">Confirm Attendance Change</DialogTitle>
                    <ConfirmDialog
                        message={isPresent ? "Are you sure you want to unmark this attendee as Present?" : "Mark this attendee as Present?"}
                        confirmLabel="Confirm"
                        variant={isPresent ? "warning" : "success"}
                        icon={isPresent ? "alert" : "check"}
                        onConfirm={confirmMarkAttendance}
                        onCancel={() => setShowConfirm(false)}
                    />
                </DialogContent>
            </Dialog>
        </>
    );
}
