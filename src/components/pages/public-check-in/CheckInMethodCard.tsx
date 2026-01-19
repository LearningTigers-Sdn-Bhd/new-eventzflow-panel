"use client";

import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export const CheckInMethodCard = ({
	label,
	description,
	icon: Icon,
	onClick,
	featured,
}: {
	label: string;
	description: string;
	icon: React.ElementType;
	onClick: () => void;
	featured?: boolean;
}) => (
	<button
		onClick={onClick}
		className="group relative flex h-[240px] w-full flex-col justify-between rounded-none border border-neutral-200 bg-white p-8 text-left transition-colors duration-200 hover:border-black hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:ring-offset-2"
	>
		{/* Accent Line - Functional Decoration */}
		<div className="absolute top-0 left-0 h-0 w-1.5 bg-black transition-[height] duration-300 ease-out group-hover:h-full" />

		{featured && (
			<div className="absolute top-0 right-0 rounded-none bg-black px-4 py-1.5 font-bold font-mono text-[10px] text-white uppercase tracking-widest">
				Recommended
			</div>
		)}

		<div className="flex w-full items-start justify-between">
			<div className="flex h-12 w-12 items-center justify-center rounded-none bg-neutral-100 text-neutral-900 transition-colors duration-200 group-hover:bg-black group-hover:text-white">
				<Icon className="h-5 w-5" />
			</div>
		</div>

		<div className="space-y-3">
			<span className="block font-bold text-neutral-900 text-xl uppercase tracking-tighter">
				{label}
			</span>
			<span className="block max-w-[85%] font-medium text-neutral-500 text-xs uppercase leading-5 tracking-wide">
				{description}
			</span>
		</div>

		{/* Geometric Arrow Indicator */}
		<div className="absolute right-6 bottom-8 translate-x-2 opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100">
			<ArrowRight className="h-6 w-6 text-black" />
		</div>
	</button>
);
