"use client";

import { Hash, ListTree } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useRichDisplayContext } from "./context";

interface RichDisplayOutlineProps {
	side?: "left" | "right";
	style?: "block" | "inset";
	className?: string;
	children?: ReactNode;
}

export function RichDisplayOutline({
	side = "left",
	style = "block",
	className,
	children,
}: RichDisplayOutlineProps) {
	const { toc, activeId } = useRichDisplayContext();

	const containerClass = cn(
		"flex h-full flex-col overflow-hidden transition-all duration-200",
		style === "inset" && "border-x shadow-sm",
		style === "block" && "rounded-none border",
		side === "right" && style === "inset" && "border-l-0",
		side === "left" && style === "inset" && "border-r-0",
		className,
	);

	const scrollToNode = (id: string) => {
		const element = document.getElementById(id);
		if (element) {
			element.scrollIntoView({ behavior: "smooth", block: "start" });
		}
	};

	if (children) {
		return <div className={containerClass}>{children}</div>;
	}

	return (
		<div className={containerClass}>
			<div className="flex shrink-0 items-center justify-between gap-2 px-4 py-2">
				<div className="flex items-center gap-2">
					<ListTree className="size-4" />
					<span className="font-semibold text-sm">Table of Contents</span>
				</div>
			</div>
			<div className="flex-1 overflow-y-auto p-2">
				{toc.length === 0 ? (
					<div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
						<ListTree className="size-4 opacity-20" />
						<p className="text-xs">No headings yet</p>
					</div>
				) : (
					<nav className="space-y-1 pb-10">
						{toc.map((item) => (
							<button
								key={item.id}
								type="button"
								onClick={() => scrollToNode(item.id)}
								className={cn(
									"group flex w-full items-start gap-2 border-transparent border-l-2 px-2 py-1.5 text-left text-xs transition-all hover:bg-muted",
									item.level === 1 ? "font-bold" : "text-muted-foreground",
									item.level === 2 && "pl-4",
									item.level === 3 && "pl-6",
									activeId === item.id &&
										"border-primary bg-muted text-primary",
								)}
							>
								<Hash
									className={cn(
										"mt-0.5 h-3 w-3 shrink-0 opacity-0 group-hover:opacity-50",
										activeId === item.id && "text-primary opacity-100",
									)}
								/>
								<span className="truncate">{item.text}</span>
							</button>
						))}
					</nav>
				)}
			</div>
		</div>
	);
}
