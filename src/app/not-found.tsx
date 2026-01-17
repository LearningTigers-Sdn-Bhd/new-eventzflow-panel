"use client";

import { Image } from "@unpic/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

export default function NotFoundPage() {
	const { isAuthenticated, isInitialized } = useAuth();

	return (
		<div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 py-12 text-center dark:bg-gray-900">
			<div className="max-w-md space-y-4">
				<Image
					src="https://images.unsplash.com/photo-1519750157634-b6d493a0f77c?auto=format&fit=crop&q=80&w=600&h=600" // Placeholder: Replace this URL with a humorous event-related stock image URL (e.g., from Unsplash, Pexels).
					alt="Event Not Found Cartoon"
					width={192}
					height={192}
					className="mx-auto h-48 w-48 object-contain"
				/>
				<h1 className="font-bold text-6xl text-gray-900 tracking-tight sm:text-7xl dark:text-gray-50">
					Uh oh.
				</h1>
				<p className="font-medium text-gray-600 text-xl dark:text-gray-400">
					Looks like this page RSVP&apos;d no and vanished into thin air.
				</p>
				<p className="text-gray-500 dark:text-gray-400">
					Don&apos;t worry, you haven&apos;t missed the main event. Let&apos;s
					get you back to where the action is!
				</p>
				<div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
					<Link href="/" passHref>
						<Button className="w-full sm:w-auto">Go to Homepage</Button>
					</Link>
					{isInitialized && isAuthenticated && (
						<Link href="/dashboard" passHref>
							<Button variant="outline" className="w-full sm:w-auto">
								Go to Dashboard
							</Button>
						</Link>
					)}
				</div>
			</div>
		</div>
	);
}
