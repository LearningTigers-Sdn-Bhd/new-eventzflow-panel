import { Loader2, Calendar, Clock, MapPin, Mail, Phone, CheckCircle, ExternalLink, XCircle, MoreVertical, MessageSquare, DollarSign } from "lucide-react";
import { format } from "date-fns";
import { ErrorState } from "@/components/data-state";
import { Button } from "@/components/ui/button";
import {
    Empty,
    EmptyDescription,
    EmptyHeader,
    EmptyTitle,
} from "@/components/ui/empty";
import { useBusinessMatchingBookings } from "@/hooks/use-business-matching";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
    CompactCard as Card, 
    CompactCardHeader as CardHeader, 
    CompactCardTitle as CardTitle, 
    CompactCardContent as CardContent, 
    CompactCardFooter as CardFooter 
} from "./compact-booking-card";
import { Badge } from "@/components/ui/badge";
import type { Booking } from "@/lib/api/business-matching";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator, // Added
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface BookingsDialogProps {
    bmEventId: string;
    eventId: string;
}

export default function BookingsDialog({
    bmEventId,
    eventId,
}: BookingsDialogProps) {
    const { data, isLoading, error } = useBusinessMatchingBookings(bmEventId, eventId);

    // Format today's date to match the "dd MMMM" format (e.g., "03 November")
    // Note: This assumes the backend returns dates in this specific format and implied current year/future.
    // Ideally, backend should return ISO dates.
    const todayString = format(new Date(), "dd MMMM");

    if (isLoading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <span className="ml-2 text-muted-foreground">Loading bookings...</span>
            </div>
        );
    }

    if (error) {
        return (
            <ErrorState
                title="Failed to load bookings"
                description="Could not fetch bookings. Please try again."
                height="h-64"
            />
        );
    }

    if (!data || data.bookings.length === 0) {
        return (
            <div className="flex w-full items-center justify-center py-8">
                <Empty className="p-0 border-0">
                    <EmptyHeader>
                        <EmptyTitle>No bookings found</EmptyTitle>
                        <EmptyDescription>There are no bookings for this event yet.</EmptyDescription>
                    </EmptyHeader>
                </Empty>
            </div>
        );
    }

    const bookings = data.bookings;
    const todayBookings = bookings.filter(b => b.booking_date && b.booking_date.includes(todayString));

    const renderBookingCard = (booking: Booking) => (
        <Card key={booking.id} className="overflow-hidden border text-sm flex flex-col h-full shadow-none">
            <CardHeader className="bg-muted/30 p-1.5 space-y-0 shrink-0">
                <div className="flex justify-between items-center gap-1.5"> {/* Changed items-start to items-center */}
                    <div className="min-w-0 flex-1 leading-tight">
                        <CardTitle className="text-sm font-semibold truncate" title={booking.name}>{booking.name}</CardTitle>
                    </div>
                    {/* Actions and Status on the right */}
                    <div className="flex items-center gap-1"> {/* Group badge and menu */}
                        <Badge 
                            variant={booking.status === 'Approved' ? 'default' : booking.status === 'Pending' ? 'secondary' : 'outline'}
                            className={`text-[10px] h-4 px-1 shrink-0 ${booking.status === 'Approved' ? 'bg-green-600 hover:bg-green-700' : booking.status === 'Pending' ? 'bg-yellow-500 hover:bg-yellow-600 text-white' : ''}`}
                        >
                            {booking.status}
                        </Badge>
                        {(booking.reschedule_link || booking.cancel_link) && ( // Condition simplified
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        className="h-6 w-6 p-0" // Make it a small square button
                                    >
                                        <MoreVertical className="h-4 w-4" />
                                        <span className="sr-only">Open actions</span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-[120px]"> {/* Reverted width as fewer items */}
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
                {/* Event Title below name, as it's common info */}
                {/* <p className="text-sm text-muted-foreground truncate">
                    {booking.event_title}
                </p> */}
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
                {/* Host Comment and Potential Deal Value - Interactive Buttons for UI Concept */}
                <div className="pt-1 border-t mt-1 grid gap-1.5">
                    <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-7 w-full justify-start text-xs font-normal text-muted-foreground"
                        onClick={() => {
                            const newComment = window.prompt("Enter Host Comment", booking.host_comment || "");
                            if (newComment !== null) {
                                alert(`Updated comment to: ${newComment}`);
                            }
                        }}
                    >
                        <MessageSquare className="mr-2 h-3 w-3 shrink-0" />
                        <span className="truncate">
                            {booking.host_comment ? booking.host_comment : "Add Comment..."}
                        </span>
                    </Button>
                    <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-7 w-full justify-start text-xs font-normal text-muted-foreground"
                        onClick={() => {
                            const newValue = window.prompt("Enter Potential Deal Value", booking.potential_deal_value || "");
                            if (newValue !== null) {
                                alert(`Updated deal value to: ${newValue}`);
                            }
                        }}
                    >
                        <DollarSign className="mr-2 h-3 w-3 shrink-0" />
                        <span className="truncate">
                            {booking.potential_deal_value ? `${booking.potential_deal_value}` : "Set Potential Deal Value..."}
                        </span>
                    </Button>
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
                {/* Mark Attendance Button (non-functional) */}
                <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-6 text-sm w-full"
                    onClick={() => alert("Mark Attendance for " + booking.name)}
                >
                    <CheckCircle className="mr-1 h-3 w-3" /> Mark Attendance
                </Button>
            </CardFooter>
        </Card>
    );

    return (
        <div className="flex flex-col h-[70vh] w-full max-w-4xl mx-auto p-1">
            <Tabs defaultValue={todayBookings.length > 0 ? "today" : "all"} className="w-full flex-1 flex flex-col overflow-hidden">
                <div className="px-1 mb-2 shrink-0">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="today">Today ({todayBookings.length})</TabsTrigger>
                        <TabsTrigger value="all">All ({bookings.length})</TabsTrigger>
                    </TabsList>
                </div>
                
                <TabsContent value="today" className="flex-1 overflow-hidden mt-0">
                    <ScrollArea className="h-full">
                        {todayBookings.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-1 pb-4">
                                {todayBookings.map(renderBookingCard)}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                                <Calendar className="h-10 w-10 mb-2 opacity-20" />
                                <p>No bookings scheduled for today.</p>
                            </div>
                        )}
                    </ScrollArea>
                </TabsContent>
                
                <TabsContent value="all" className="flex-1 overflow-hidden mt-0">
                     <ScrollArea className="h-full">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-1 pb-4">
                            {bookings.map(renderBookingCard)}
                        </div>
                    </ScrollArea>
                </TabsContent>
            </Tabs>
        </div>
    );
}