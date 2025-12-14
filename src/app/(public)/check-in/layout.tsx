import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function CheckinLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-emerald-950/20">
			{/* Subtle mesh gradient overlay */}
			<div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(16,185,129,0.08),transparent_50%)] dark:bg-[radial-gradient(circle_at_50%_120%,rgba(16,185,129,0.12),transparent_50%)]" />

			{/* Animated Grid Pattern */}
			<div
				className="absolute inset-0 opacity-[0.15] dark:opacity-[0.08]"
				style={{
					backgroundImage: `
						linear-gradient(90deg, rgba(16,185,129,0.2) 1px, transparent 0),
						linear-gradient(180deg, rgba(16,185,129,0.2) 1px, transparent 0)
					`,
					backgroundSize: "60px 60px",
				}}
			/>

			{/* Diagonal lines accent */}
			<div
				className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
				style={{
					backgroundImage: `repeating-linear-gradient(
						45deg,
						transparent,
						transparent 10px,
						rgba(16,185,129,0.5) 10px,
						rgba(16,185,129,0.5) 11px
					)`,
					backgroundSize: "100px 100px",
				}}
			/>

			{/* Floating gradient orbs with improved animation */}
			<div
				className="-top-24 -right-24 absolute h-96 w-96 animate-pulse rounded-full bg-gradient-to-br from-emerald-400/20 to-teal-400/20 blur-3xl"
				style={{ animationDuration: "8s" }}
			/>
			<div
				className="-left-32 absolute top-1/3 h-80 w-80 animate-pulse rounded-full bg-gradient-to-tr from-blue-400/10 to-emerald-400/10 blur-3xl"
				style={{ animationDuration: "10s", animationDelay: "2s" }}
			/>
			<div
				className="-bottom-32 absolute right-1/4 h-72 w-72 animate-pulse rounded-full bg-gradient-to-tl from-emerald-300/15 to-cyan-300/15 blur-3xl"
				style={{ animationDuration: "12s", animationDelay: "4s" }}
			/>

			{/* Subtle spotlight effect at center */}
			<div className="-translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2 h-[600px] w-[600px] rounded-full bg-gradient-radial from-emerald-100/30 via-transparent to-transparent blur-2xl dark:from-emerald-900/20" />

			<div className="absolute top-4 left-4 z-20">
				<Button
					variant="outline"
					asChild
					className="bg-white/80 backdrop-blur-sm dark:bg-slate-900/80"
				>
					<Link href="/" className="flex items-center gap-2">
						<ArrowLeft className="size-4" /> Go Back
					</Link>
				</Button>
			</div>

			{/* Centered Content */}
			<div className="relative z-10 flex min-h-screen w-full items-center justify-center p-3 sm:p-4">
				{children}
			</div>
		</div>
	);
}
