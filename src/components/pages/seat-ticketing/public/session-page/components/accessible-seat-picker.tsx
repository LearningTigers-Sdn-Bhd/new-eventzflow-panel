"use client";

import dynamic from "next/dynamic";
import { ChevronDownIcon } from "lucide-react";
import { useMemo, useState } from "react";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import {
	usePublicSeatSectionState,
} from "../hooks/use-public-seat-reservation";

const loadAccessibleSeatPickerList = () => import("./accessible-seat-picker-list");

const AccessibleSeatPickerList = dynamic(
	() => loadAccessibleSeatPickerList().then((module) => module.AccessibleSeatPickerList),
	{
		ssr: false,
		loading: () => (
			<p className="px-4 pb-4 text-slate-500 text-xs">Loading seat list...</p>
		),
	},
);

export function preloadAccessibleSeatPickerList() {
	void loadAccessibleSeatPickerList();
}

interface AccessibleSeatPickerProps {
	variant?: "desktop" | "mobile";
	active?: boolean;
}

export function AccessibleSeatPicker({
	variant = "desktop",
	active = true,
}: AccessibleSeatPickerProps) {
	const [isOpen, setIsOpen] = useState(false);

	const { sections, activeSectionId } = usePublicSeatSectionState();

	const activeSection = activeSectionId ? sections[activeSectionId] : null;

	const sectionSummary = useMemo(() => {
		if (!activeSectionId || !activeSection) return "Open a section to browse seats";
		return activeSection.name;
	}, [activeSectionId, activeSection]);

	if (variant === "mobile") {
		return (
			<div className="flex h-full min-h-0 flex-col bg-slate-50">
				<div className="border-slate-200 border-b px-4 py-3">
					<p className="font-bold text-[10px] text-slate-700 uppercase tracking-widest">
						Available Seats
					</p>
					<p className="text-slate-500 text-xs">{sectionSummary}</p>
				</div>
				<div className="min-h-0 flex-1">
					{active ? (
						<AccessibleSeatPickerList variant="mobile" />
					) : (
						<p className="px-4 pb-4 pt-3 text-slate-500 text-xs">
							Open seat list to browse seats.
						</p>
					)}
				</div>
			</div>
		);
	}

	return (
		<div className="border-slate-200 border-b bg-slate-50">
			<Collapsible open={isOpen} onOpenChange={setIsOpen}>
				<CollapsibleTrigger asChild>
					<button
						type="button"
						className="flex w-full items-center justify-between px-4 py-3 text-left"
						onMouseEnter={preloadAccessibleSeatPickerList}
						onFocus={preloadAccessibleSeatPickerList}
						onPointerDown={preloadAccessibleSeatPickerList}
					>
						<div>
							<p className="font-bold text-[10px] text-slate-700 uppercase tracking-widest">
								List of Seats (Column)
							</p>
							<p className="text-slate-500 text-xs">{sectionSummary}</p>
						</div>
						<ChevronDownIcon
							className={cn(
								"h-4 w-4 text-slate-500 transition-transform",
								isOpen && "rotate-180",
							)}
						/>
					</button>
				</CollapsibleTrigger>

				<CollapsibleContent>
					{isOpen ? <AccessibleSeatPickerList variant="desktop" /> : null}
				</CollapsibleContent>
			</Collapsible>
		</div>
	);
}
