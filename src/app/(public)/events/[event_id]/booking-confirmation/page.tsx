"use client";

import React, { use } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Loader2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { Booking } from '@/lib/api/business-matching';
import Link from 'next/link';
import { usePublicBookingDetails } from '@/hooks/use-business-matching-public';

interface BookingConfirmationPageProps {
  params: {
    event_id: string;
  };
}

export default function BookingConfirmationPage({ params }: BookingConfirmationPageProps) {
  const { event_id } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();

  const bookingId = searchParams.get('bookingId') || '';
  const bmEventId = searchParams.get('bmEventId') || '';

  const { data: bookingDetails, isLoading, error } = usePublicBookingDetails(bookingId, bmEventId, event_id, {
      enabled: !!bookingId && !!bmEventId && !!event_id
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
    );
  }

  if (error || !bookingDetails) {
    return (
      <div className="container mx-auto p-4 max-w-3xl py-10 text-center">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-destructive">Error!</CardTitle>
            <CardDescription>
              {error ? error.message : "Booking details not found. Please try booking again."}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Link href={`/events/${event_id}/book-meeting`}>
                <Button>Go to Booking Page</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formattedBookingDate = bookingDetails.booking_date ? format(parseISO(bookingDetails.booking_date), 'PPP') : 'N/A';
  const formattedCreatedAt = bookingDetails.created_at ? format(parseISO(bookingDetails.created_at), 'PPPp') : 'N/A';

  return (
    <div className="container mx-auto p-4 max-w-3xl py-10">
      <Card className="text-center">
        <CardHeader>
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <CardTitle className="text-3xl font-bold">Booking Confirmed!</CardTitle>
          <CardDescription>Your meeting has been successfully booked.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-left">
          <p className="text-lg">Hi {bookingDetails.name},</p>
          <p>Thank you for booking a meeting. Here are your booking details:</p>

          <div className="bg-muted/30 p-4 rounded-lg space-y-2 text-sm border">
            <div className="flex justify-between"><span className="text-muted-foreground">Host:</span> <span className="font-medium">{bookingDetails.event_title || 'N/A'}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Date:</span> <span className="font-medium">{formattedBookingDate}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Time:</span> <span className="font-medium">{bookingDetails.booking_time}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Location:</span> <span className="font-medium">{bookingDetails.location || 'To be confirmed'}</span></div>
          </div>

          <p className="text-muted-foreground text-sm">
            A confirmation email with these details has been sent to {bookingDetails.email}.
            Please check your inbox (or your spam folder).
          </p>
        </CardContent>
        <CardContent className="flex flex-col gap-4 md:flex-row md:justify-between mt-6">
            <Link href={`/`} className="w-full md:w-auto">
              <Button variant="outline" className="w-full md:w-auto">Return to Home</Button>
            </Link>
            <Link href={`/events/${event_id}/book-meeting`} className="w-full md:w-auto">
                <Button className="w-full md:w-auto">Book Another Meeting</Button>
            </Link>
        </CardContent>
      </Card>
    </div>
  );
}