"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight, CirclePlay } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { healthCheckQuery } from "@/lib/api/health";

export default function HomeSection() {
	const healthCheck = useQuery(healthCheckQuery());
	return (
		<div className="flex min-h-screen w-full flex-col items-center justify-center gap-16 px-6 py-16">
			<div className="max-w-3xl text-center">
				<Badge
					variant="secondary"
					className="rounded-full border-border py-1"
					asChild
				>
					<div className="flex items-center gap-2">
						<div
							className={`h-2 w-2 rounded-full ${healthCheck.data ? "bg-green-500" : "bg-red-500"}`}
						/>
						<span className="text-muted-foreground text-sm">
							{healthCheck.isLoading
								? "Checking..."
								: healthCheck.data
									? "API Query Connected"
									: "Disconnected"}
						</span>
					</div>
				</Badge>
				<h1 className="mt-6 font-semibold text-4xl tracking-tighter sm:text-5xl md:text-6xl md:leading-[1.2] lg:text-7xl">
					EventzFlow Admin Panel
				</h1>
				<p className="mt-6 md:text-lg">
					Admin panel for EventzFlow, a platform for creating and managing
					tickets for the events or expo.
				</p>
				<div className="mt-10 flex items-center justify-center gap-4">
					<Button size="lg" className="rounded-full text-base">
						Get Started <ArrowUpRight className="h-5! w-5!" />
					</Button>
					<Button
						variant="outline"
						size="lg"
						className="rounded-full text-base shadow-none"
					>
						<CirclePlay className="h-5! w-5!" /> Watch Demo
					</Button>
				</div>
			</div>
			<div className="mx-auto aspect-video w-full max-w-(--breakpoint-xl) rounded-xl bg-accent" />
		</div>
	);
}
