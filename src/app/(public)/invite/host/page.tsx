"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useJoinBusinessHost } from "@/hooks/use-business-matching-public";
import { Loader2 } from "lucide-react";
import Link from "next/link";

function InviteHostContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const eventId = searchParams.get("event_id");
    const bmEventId = searchParams.get("bm_event_id");

    const { user, isAuthenticated, isHydrated } = useAuth();
    const { mutate: joinHost, isPending } = useJoinBusinessHost();
    const [isSuccess, setIsSuccess] = useState(false);

    if (!isHydrated) {
        return <div className="flex justify-center items-center min-h-screen"><Loader2 className="animate-spin" /></div>;
    }

    if (!isAuthenticated) {
        // Redirect to login with return URL
        const redirectPath = encodeURIComponent(`/invite/host?event_id=${eventId}&bm_event_id=${bmEventId}`);
        return (
            <div className="container mx-auto max-w-md py-20 px-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Login Required</CardTitle>
                        <CardDescription>Please login to accept the invitation.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-4">
                        <Link href={`/auth?login&redirect=${redirectPath}`} passHref>
                            <Button className="w-full">Login</Button>
                        </Link>
                        <Link href={`/auth?register&redirect=${redirectPath}`} passHref>
                            <Button variant="outline" className="w-full">Create Account</Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!eventId || !bmEventId) {
        return (
            <div className="container mx-auto max-w-md py-20 px-4">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-destructive">Invalid Invitation</CardTitle>
                        <CardDescription>Missing event information.</CardDescription>
                    </CardHeader>
                </Card>
            </div>
        );
    }

    const handleAccept = () => {
        joinHost({ eventId, bmEventId }, {
            onSuccess: () => {
                toast.success("Successfully joined as Business Host!");
                setIsSuccess(true);
            },
            onError: (error) => {
                toast.error("Failed to join", { description: error.message });
            }
        });
    };

    if (isSuccess) {
        return (
            <div className="container mx-auto max-w-md py-20 px-4">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-green-600">Invitation Accepted!</CardTitle>
                        <CardDescription>You are now a Business Host for this event.</CardDescription>
                    </CardHeader>
                    <CardFooter>
                        <Button className="w-full" onClick={() => router.push("/dashboard")}>Go to Dashboard</Button>
                    </CardFooter>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto max-w-md py-20 px-4">
            <Card>
                <CardHeader>
                    <CardTitle>Business Host Invitation</CardTitle>
                    <CardDescription>
                        You have been invited to join as a Business Host.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                        By accepting, you will be able to manage your schedule and view bookings for this event.
                    </p>
                    <div className="bg-muted p-3 rounded-md text-sm mb-4">
                        <p><strong>User:</strong> {user?.email}</p>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button className="w-full" onClick={handleAccept} disabled={isPending}>
                        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Accept Invitation
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}

function InviteHostLoadingFallback() {
    return (
        <div className="flex justify-center items-center min-h-screen">
            <Loader2 className="animate-spin" />
        </div>
    );
}

export default function InviteHostPage() {
    return (
        <Suspense fallback={<InviteHostLoadingFallback />}>
            <InviteHostContent />
        </Suspense>
    );
}
