"use client";

import { MinusIcon, PlusIcon } from "lucide-react";

interface ZoomControlProps {
	onZoomIn: () => void;
	onZoomOut: () => void;
}

export function ZoomControl({ onZoomIn, onZoomOut }: ZoomControlProps) {
	return (
		<div className="absolute right-4 bottom-4 z-10 flex flex-col gap-2 lg:right-6 lg:bottom-6">
			<button
				type="button"
				onClick={onZoomIn}
				className="flex h-10 w-10 items-center justify-center rounded-none border-2 border-slate-200 bg-white shadow-xl transition-colors hover:bg-slate-50"
				aria-label="Zoom In"
			>
				<PlusIcon className="h-5 w-5 text-slate-600" />
			</button>
			<button
				type="button"
				onClick={onZoomOut}
				className="flex h-10 w-10 items-center justify-center rounded-none border-2 border-slate-200 bg-white shadow-xl transition-colors hover:bg-slate-50"
				aria-label="Zoom Out"
			>
				<MinusIcon className="h-5 w-5 text-slate-600" />
			</button>
		</div>
	);
}
