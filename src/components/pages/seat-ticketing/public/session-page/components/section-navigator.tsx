"use client";

import {
	ChevronDownIcon,
	ChevronRightIcon,
	LayoutDashboardIcon,
	MapIcon,
} from "lucide-react";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePublicSeatSectionState } from "../hooks/use-public-seat-reservation";

/**
 * SectionNavigator
 *
 * Provides breadcrumb-style navigation and a quick-jump dropdown for venue sections.
 */
export function SectionNavigator() {
	const { sections, activeSectionId, setActiveSection } =
		usePublicSeatSectionState();

	const sectionList = Object.values(sections);
	const currentSection = activeSectionId ? sections[activeSectionId] : null;

	if (sectionList.length === 0) return null;

	return (
		<div className="z-20 flex h-12 w-full items-center justify-between border-slate-200 border-y bg-white px-4 shadow-sm">
			{/* Breadcrumbs (Left) */}
			<div className="flex items-center">
				<Breadcrumb>
					<BreadcrumbList>
						<BreadcrumbItem>
							<button
								type="button"
								onClick={() => setActiveSection(null)}
								className="flex items-center gap-1.5 font-bold text-[10px] uppercase tracking-widest transition-colors hover:text-brand-green"
								aria-label="Return to venue map"
							>
								<MapIcon className="h-3.5 w-3.5" />
								Venue Map
							</button>
						</BreadcrumbItem>

						{currentSection && (
							<>
								<BreadcrumbSeparator>
									<ChevronRightIcon className="h-3 w-3" />
								</BreadcrumbSeparator>
								<BreadcrumbItem>
									<BreadcrumbPage className="font-black text-[10px] text-brand-green uppercase tracking-widest">
										{currentSection.name}
									</BreadcrumbPage>
								</BreadcrumbItem>
							</>
						)}
					</BreadcrumbList>
				</Breadcrumb>
			</div>

			{/* Section Quick Jump (Right) */}
			<div className="flex items-center">
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button
							variant="ghost"
							size="sm"
							className="flex h-8 items-center gap-2 rounded-none border border-transparent px-4 hover:border-slate-200 hover:bg-slate-50"
						>
							<LayoutDashboardIcon className="h-3.5 w-3.5 text-brand-green" />
							<span className="font-black text-[10px] text-slate-900 uppercase tracking-widest">
								{currentSection ? "Switch Section" : "Select Section"}
							</span>
							<ChevronDownIcon className="h-3 w-3 text-slate-400" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end" className="w-56 rounded-none">
						{sectionList.map((section) => (
							<DropdownMenuItem
								key={section.id}
								onClick={() => setActiveSection(section.id)}
								className={`cursor-pointer font-bold text-[10px] uppercase tracking-wider ${
									activeSectionId === section.id
										? "bg-brand-green/10 text-brand-green"
										: ""
								}`}
							>
								{section.name}
								{section.ticket_seat_counts && (
									<span className="ml-auto font-mono text-[9px] opacity-50">
										({section.ticket_seat_counts.available})
									</span>
								)}
							</DropdownMenuItem>
						))}
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		</div>
	);
}
