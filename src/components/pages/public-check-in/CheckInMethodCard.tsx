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
		className="group relative flex h-full min-h-[160px] w-full flex-col justify-between overflow-hidden rounded-none border border-gray-400 bg-white p-4 text-left transition-all duration-300 hover:-translate-y-1 hover:border-black hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,0.05)] focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 sm:p-6"
	>
		{featured && (
			<div className="absolute top-0 right-0 z-10 rounded-none bg-black px-4 py-1.5 font-bold font-mono text-[9px] text-white uppercase tracking-widest">
				Recommended
			</div>
		)}

		<div className="relative z-10 flex w-full items-start justify-between">
			<div className="flex h-12 w-12 items-center justify-center rounded-none bg-neutral-100 text-neutral-900 transition-all duration-300 group-hover:bg-black group-hover:text-white group-hover:shadow-lg">
				<Icon className="h-5 w-5" />
			</div>
		</div>

		<div className="relative z-10 space-y-2">
			<span className="block font-bold text-lg text-neutral-900 uppercase tracking-tight group-hover:text-black">
				{label}
			</span>
			<span className="block max-w-[90%] font-medium text-[10px] text-neutral-400 uppercase leading-4 tracking-wider transition-colors group-hover:text-neutral-500">
				{description}
			</span>
		</div>

		{/* Arrow Indicator */}
		<div className="absolute right-6 bottom-6 translate-x-4 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
			<ArrowRight className="h-5 w-5" />
		</div>
	</button>
);
