import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function VerifyEmailLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<div className="grid-animated-container relative min-h-screen w-full">
			{/* Diagonal Striped Grid Spotlight Background */}
			<div
				className="absolute inset-0 z-0"
				style={{
					backgroundImage: `
        linear-gradient(90deg, rgba(16,185,129,0.25) 1px, transparent 0),
        linear-gradient(180deg, rgba(16,185,129,0.25) 1px, transparent 0),
        repeating-linear-gradient(45deg, rgba(16,185,129,0.2) 0 2px, transparent 2px 6px)
      `,
					backgroundSize: "24px 24px, 24px 24px, 24px 24px",
					WebkitMask:
						"radial-gradient(circle at var(--x, 50%) var(--y, 50%), black 0, transparent 90%)",
					mask: "radial-gradient(circle at var(--x, 50%) var(--y, 50%), black 0, transparent 90%)",
					animation: "spotlight 8s ease-in-out infinite",
				}}
			/>
			<div className="absolute top-4 left-4 z-20">
				<Button variant="outline" asChild>
					<Link href="/" className="flex items-center gap-2">
						<ArrowLeft className="size-4" /> Go Back
					</Link>
				</Button>
			</div>
			{/* Your Content/Components */}
			<div className="relative z-10 flex min-h-screen w-full items-center justify-center p-4">
				{children}
			</div>
		</div>
	);
}
