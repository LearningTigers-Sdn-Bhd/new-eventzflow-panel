"use client";

import { AlertCircle, Search } from "lucide-react";

export function EventNotFound() {
	return (
		<div className="fixed inset-0 bg-background flex items-center justify-center overflow-hidden">
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
					backgroundImage: `radial-gradient(circle, currentColor 1px, transparent 1px)`,
					backgroundSize: '24px 24px',
				}}
			/>

			{/* Animated Gradient Mesh */}
			<div className="pointer-events-none fixed inset-0 overflow-hidden">
				{/* Top right gradient orb */}
				<div 
					className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-gradient-to-br from-primary/8 via-primary/4 to-transparent blur-3xl animate-pulse"
					style={{ animationDuration: '4s' }}
				/>
				
				{/* Bottom left gradient orb */}
				<div 
					className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-gradient-to-tr from-primary/8 via-primary/4 to-transparent blur-3xl animate-pulse"
					style={{ animationDuration: '4s', animationDelay: '2s' }}
				/>
				
				{/* Center accent orb */}
				<div 
					className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-gradient-to-br from-primary/3 via-transparent to-primary/3 blur-3xl animate-pulse"
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

			<div className="relative container mx-auto px-4 sm:px-6 max-w-2xl w-full">
				<div className="text-center space-y-6 sm:space-y-8">
					{/* Icon Container */}
					<div className="relative inline-flex">
						{/* Pulsing rings */}
						<div className="absolute inset-0 rounded-full bg-primary/10 animate-ping" />
						<div className="absolute inset-0 rounded-full bg-primary/5 animate-pulse" />
						
						{/* Main icon - responsive sizing */}
						<div className="relative flex h-24 w-24 sm:h-32 sm:w-32 items-center justify-center rounded-full border-2 sm:border-4 border-dashed border-primary/20 bg-background">
							<div className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full bg-primary/10">
								<AlertCircle className="h-8 w-8 sm:h-10 sm:w-10 text-primary" strokeWidth={2} />
							</div>
						</div>
					</div>

					{/* Error Code */}
					<div className="space-y-2">
						<div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 sm:px-4 sm:py-1.5">
							<div className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-primary animate-pulse" />
							<span className="text-primary text-xs sm:text-sm font-semibold tracking-wider">ERROR 404</span>
						</div>
					</div>

					{/* Main Message */}
					<div className="space-y-3 sm:space-y-4 px-2">
						<h1 className="font-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
							Event Not Found
						</h1>
						<p className="text-muted-foreground text-base sm:text-lg md:text-xl max-w-md mx-auto leading-relaxed px-2">
							The event you're looking for doesn't exist or has been removed. Please check the URL and try again.
						</p>
					</div>

					{/* Decorative Divider */}
					<div className="flex items-center justify-center gap-2 py-2 sm:py-4">
						<div className="h-px w-8 sm:w-12 bg-gradient-to-r from-transparent to-border" />
						<Search className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground/50" />
						<div className="h-px w-8 sm:w-12 bg-gradient-to-l from-transparent to-border" />
					</div>

					{/* Help Text */}
					<div className="pt-2 sm:pt-4 px-2">
						<div className="inline-flex items-start gap-2.5 sm:gap-3 rounded-lg border bg-muted/50 p-3 sm:p-4 text-left max-w-md w-full">
							<div className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
								<Search className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
							</div>
							<div className="space-y-0.5 sm:space-y-1 flex-1 min-w-0">
								<p className="text-xs sm:text-sm font-semibold">Need help?</p>
								<p className="text-[11px] sm:text-xs text-muted-foreground leading-relaxed">
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
