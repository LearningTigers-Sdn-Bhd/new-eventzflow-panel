"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";

export default function NotFoundPage() {
	const { isAuthenticated, isHydrated } = useAuth();

	return (
		<div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 py-12 text-center dark:bg-gray-900">
			<div className="max-w-md space-y-4">
				<img
					src="https://picsum.photos/id/237/400/300" // Placeholder: Replace this URL with a humorous event-related stock image URL (e.g., from Unsplash, Pexels).
					alt="Event Not Found Cartoon"
					className="mx-auto h-48 w-48 object-contain"
				/>
				<h1 className="text-6xl font-bold tracking-tight text-gray-900 dark:text-gray-50 sm:text-7xl">
					Event Horizon Lost!
				</h1>
				<p className="text-xl font-medium text-gray-600 dark:text-gray-400">
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
					{isHydrated && isAuthenticated && (
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
