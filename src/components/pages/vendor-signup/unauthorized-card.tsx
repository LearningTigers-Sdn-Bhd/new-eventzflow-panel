"use client";

import { Home } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function UnauthorizedCard() {
	return (
		<div className="flex min-h-screen items-center justify-center bg-background p-4">
			<div className="mx-auto flex max-w-5xl flex-col items-center gap-8 lg:flex-row lg:gap-16">
				{/* Left side - Text content */}
				<div className="flex-1 text-center lg:text-left">
					<p className="mb-4 font-medium text-muted-foreground text-xs uppercase tracking-widest">
						Error Code
					</p>
					<h1 className="mb-6 font-bold text-8xl tracking-tight lg:text-9xl">
						403
					</h1>
					<h2 className="mb-3 font-semibold text-2xl lg:text-3xl">
						Access Denied
					</h2>
					<p className="mb-8 max-w-md text-muted-foreground">
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
				<div className="flex flex-1 justify-center">
					<div className="relative h-full w-full overflow-hidden border-4 border-muted-foreground/20 bg-muted shadow-xl">
						{/* Replace this URL with your actual gif */}
						<img
							src="https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExOWQ3Ymkybmdjbml1N2t2ajRteGVvNzJtMHA5NHNzODVpbGV1Y3pjaCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/3o6ZtgGKb4LTS0ypWw/giphy.gif"
							alt="Access denied"
							className="h-full w-full object-cover grayscale"
						/>
					</div>
				</div>
			</div>
		</div>
	);
}
