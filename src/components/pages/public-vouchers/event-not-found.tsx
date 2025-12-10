"use client";

import { AlertCircle, Search } from "lucide-react";

export function EventNotFound() {
	return (
		<div className="fixed inset-0 flex items-center justify-center overflow-hidden bg-background">
			{/* Grid Pattern Background */}
			<div
				className="pointer-events-none fixed inset-0 opacity-[0.02] dark:opacity-[0.03]"
				style={{
					backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
					backgroundSize: '60px 60px',
				}}
			/>

			{/* Dot Grid Pattern Overlay */}
			<div
				className="pointer-events-none fixed inset-0 opacity-[0.02] dark:opacity-[0.025]"
				style={{
					backgroundImage: "radial-gradient(circle, currentColor 1px, transparent 1px)",
					backgroundSize: '24px 24px',
				}}
			/>

			{/* Animated Gradient Mesh */}
			<div className="pointer-events-none fixed inset-0 overflow-hidden">
				{/* Top right gradient orb */}
				<div 
					className="-top-40 -right-40 absolute h-96 w-96 animate-pulse rounded-full bg-gradient-to-br from-primary/8 via-primary/4 to-transparent blur-3xl"
					style={{ animationDuration: '4s' }}
				/>
				
				{/* Bottom left gradient orb */}
				<div 
					className="-bottom-40 -left-40 absolute h-96 w-96 animate-pulse rounded-full bg-gradient-to-tr from-primary/8 via-primary/4 to-transparent blur-3xl"
					style={{ animationDuration: '4s', animationDelay: '2s' }}
				/>
				
				{/* Center accent orb */}
				<div 
					className="-translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2 h-[600px] w-[600px] animate-pulse rounded-full bg-gradient-to-br from-primary/3 via-transparent to-primary/3 blur-3xl"
					style={{ animationDuration: '6s', animationDelay: '1s' }}
				/>
			</div>

			{/* Diagonal Lines Pattern */}
			<div
				className="pointer-events-none fixed inset-0 opacity-[0.01] dark:opacity-[0.02]"
				style={{
					backgroundImage: `repeating-linear-gradient(
						45deg,
						transparent,
						transparent 35px,
						currentColor 35px,
						currentColor 36px
					)`,
				}}
			/>

			<div className="container relative mx-auto w-full max-w-2xl px-4 sm:px-6">
				<div className="space-y-6 text-center sm:space-y-8">
					{/* Icon Container */}
					<div className="relative inline-flex">
						{/* Pulsing rings */}
						<div className="absolute inset-0 animate-ping rounded-full bg-primary/10" />
						<div className="absolute inset-0 animate-pulse rounded-full bg-primary/5" />
						
						{/* Main icon - responsive sizing */}
						<div className="relative flex h-24 w-24 items-center justify-center rounded-full border-2 border-primary/20 border-dashed bg-background sm:h-32 sm:w-32 sm:border-4">
							<div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 sm:h-20 sm:w-20">
								<AlertCircle className="h-8 w-8 text-primary sm:h-10 sm:w-10" strokeWidth={2} />
							</div>
						</div>
					</div>

					{/* Error Code */}
					<div className="space-y-2">
						<div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 sm:px-4 sm:py-1.5">
							<div className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary sm:h-2 sm:w-2" />
							<span className="font-semibold text-primary text-xs tracking-wider sm:text-sm">ERROR 404</span>
						</div>
					</div>

					{/* Main Message */}
					<div className="space-y-3 px-2 sm:space-y-4">
						<h1 className="font-bold font-heading text-3xl leading-tight tracking-tight sm:text-4xl md:text-5xl lg:text-6xl">
							Event Not Found
						</h1>
						<p className="mx-auto max-w-md px-2 text-base text-muted-foreground leading-relaxed sm:text-lg md:text-xl">
							The event you're looking for doesn't exist or has been removed. Please check the URL and try again.
						</p>
					</div>

					{/* Decorative Divider */}
					<div className="flex items-center justify-center gap-2 py-2 sm:py-4">
						<div className="h-px w-8 bg-gradient-to-r from-transparent to-border sm:w-12" />
						<Search className="h-3 w-3 text-muted-foreground/50 sm:h-4 sm:w-4" />
						<div className="h-px w-8 bg-gradient-to-l from-transparent to-border sm:w-12" />
					</div>

					{/* Help Text */}
					<div className="px-2 pt-2 sm:pt-4">
						<div className="inline-flex w-full max-w-md items-start gap-2.5 rounded-lg border bg-muted/50 p-3 text-left sm:gap-3 sm:p-4">
							<div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 sm:h-8 sm:w-8">
								<Search className="h-3.5 w-3.5 text-primary sm:h-4 sm:w-4" />
							</div>
							<div className="min-w-0 flex-1 space-y-0.5 sm:space-y-1">
								<p className="font-semibold text-xs sm:text-sm">Need help?</p>
								<p className="text-[11px] text-muted-foreground leading-relaxed sm:text-xs">
									If you believe this is an error, please contact the event organizer or check your invitation link.
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
