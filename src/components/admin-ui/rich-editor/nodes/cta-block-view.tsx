"use client";

import { ExternalLink, Megaphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CtaBlockProps {
	title?: string;
	description?: string;
	buttonText?: string;
	buttonUrl?: string;
	isEditable?: boolean;
	onEdit?: () => void;
	selected?: boolean;
}

export const CtaBlockView = ({
	title,
	description,
	buttonText,
	buttonUrl,
	isEditable = false,
	onEdit,
	selected = false,
}: CtaBlockProps) => {
	return (
		<div className="not-prose my-12">
			<div
				className={cn(
					"relative border-t-4 border-r border-b border-l-4 p-8 transition-all duration-300",
					"rounded-none",
					selected && isEditable
						? "border-primary bg-primary/5 shadow-[8px_8px_0px_0px_hsl(var(--primary)/0.1)]"
						: "border-foreground bg-background shadow-[8px_8px_0px_0px_rgba(0,0,0,0.05)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.02)]",
				)}
			>
				<div className="mb-8 flex items-center gap-3">
					<div className="flex h-10 w-10 items-center justify-center border border-foreground bg-background">
						<Megaphone className="h-5 w-5" />
					</div>
					<div className="h-px flex-1 bg-foreground/10" />
				</div>

				<div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
					<div className="flex-1 space-y-2">
						<h3 className="font-black font-title text-3xl text-foreground uppercase leading-none tracking-tighter">
							{title || "UNLEASH THE POTENTIAL"}
						</h3>
						<p className="max-w-md text-muted-foreground text-sm leading-relaxed">
							{description ||
								"Provide a clear and concise description of the value proposition to engage your audience immediately."}
						</p>
					</div>
					<div className="flex flex-col items-center gap-4">
						{buttonUrl && !isEditable ? (
							<a
								href={buttonUrl}
								target="_blank"
								rel="noopener noreferrer"
								className="inline-flex h-14 min-w-[180px] cursor-pointer items-center justify-center rounded-none border-2 border-foreground bg-foreground px-4 font-bold text-background uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 hover:translate-x-0.5 hover:translate-y-0.5 hover:bg-background hover:text-foreground hover:shadow-none dark:shadow-foreground/30"
							>
								{buttonText || "Get Started"}
								<ExternalLink className="ml-2 h-4 w-4" />
							</a>
						) : (
							<Button className="h-14 min-w-[180px] cursor-pointer rounded-none border-2 border-foreground bg-foreground font-bold text-background uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 hover:translate-x-0.5 hover:translate-y-0.5 hover:bg-background hover:text-foreground hover:shadow-none dark:shadow-foreground/30">
								{buttonText || "Get Started"}
								<ExternalLink className="ml-2 h-4 w-4" />
							</Button>
						)}

						{isEditable && (
							<button
								type="button"
								onClick={onEdit}
								className="font-bold text-[10px] text-muted-foreground uppercase tracking-tighter underline-offset-4 hover:text-foreground hover:underline"
							>
								[ Edit Module ]
							</button>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};
