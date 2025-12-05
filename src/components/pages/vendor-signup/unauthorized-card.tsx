"use client";

import Link from "next/link";
import { Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export function UnauthorizedCard() {
	return (
		<div className="flex min-h-screen items-center justify-center bg-background p-4">
			<div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16 max-w-5xl mx-auto">
				{/* Left side - Text content */}
				<div className="flex-1 text-center lg:text-left">
					<p className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-4">
						Error Code
					</p>
					<h1 className="text-8xl lg:text-9xl font-bold tracking-tight mb-6">
						403
					</h1>
					<h2 className="text-2xl lg:text-3xl font-semibold mb-3">
						Access Denied
					</h2>
					<p className="text-muted-foreground mb-8 max-w-md">
						You don't have authorization to view this page.
						<br />
						It's probably best to turn back now.
					</p>
					<Button className="rounded-none" variant="outline" asChild>
						<Link href="/">
							<Home className="mr-2 h-4 w-4" />
							Return Home
						</Link>
					</Button>
				</div>

				{/* Right side - GIF in device frame */}
				<div className="flex-1 flex justify-center">
					<div className="relative w-full h-full border-4 border-muted-foreground/20 bg-muted overflow-hidden shadow-xl">
						{/* Replace this URL with your actual gif */}
						<img
							src="https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExOWQ3Ymkybmdjbml1N2t2ajRteGVvNzJtMHA5NHNzODVpbGV1Y3pjaCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/3o6ZtgGKb4LTS0ypWw/giphy.gif"
							alt="Access denied"
							className="w-full h-full object-cover grayscale"
						/>
					</div>
				</div>
			</div>
		</div>
	);
}
