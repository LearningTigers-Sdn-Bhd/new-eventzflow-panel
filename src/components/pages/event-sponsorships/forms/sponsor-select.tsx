"use client";

import { ExternalLink, Handshake, Loader2, Plus, Search } from "lucide-react";
import Link from "next/link";
import { useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { useDebounce } from "@/hooks/use-debounce";
import { useSponsorLookup } from "@/hooks/use-sponsorships";
import type { Sponsor } from "@/lib/api/sponsorship/response";
import { cn } from "@/lib/utils";

interface SponsorSelectProps {
	value?: string; // sponsor_id
	onSelect: (sponsor: Partial<Sponsor>) => void;
	disabled?: boolean;
}

export function SponsorSelect({
	value,
	onSelect,
	disabled,
}: SponsorSelectProps) {
	const [open, setOpen] = useState(false);
	const [search, setSearch] = useState("");
	const debouncedSearch = useDebounce(search, 300);
	const [selectedLabel, setSelectedLabel] = useState<string>("");

	const { data: sponsors, isLoading } = useSponsorLookup(debouncedSearch);

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					role="combobox"
					aria-expanded={open}
					className="w-full justify-between"
					disabled={disabled}
				>
					{selectedLabel || "Select a sponsor..."}
					<Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-[400px] p-0" align="start">
				<div className="flex flex-col">
					<div className="flex items-center border-b px-3">
						<Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
						<Input
							className="flex h-11 w-full rounded-md border-none bg-transparent px-0 py-3 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-50"
							placeholder="Search sponsor name..."
							value={search}
							onChange={(e) => setSearch(e.target.value)}
						/>
					</div>

					<div className="max-h-[300px] overflow-y-auto p-1">
						{isLoading && (
							<div className="flex items-center justify-center gap-2 py-6 text-center text-muted-foreground text-sm">
								<Loader2 className="h-4 w-4 animate-spin" />
								Loading...
							</div>
						)}

						{!isLoading && search.length > 0 && search.length < 3 && (
							<div className="py-6 text-center text-muted-foreground text-sm">
								Type at least 3 characters to search
							</div>
						)}

						{!isLoading &&
							debouncedSearch.length >= 3 &&
							sponsors?.length === 0 && (
								<div className="space-y-3 py-6 text-center text-muted-foreground text-sm">
									<p>No sponsor found.</p>
									<Link
										href="/sponsors"
										target="_blank"
										className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
									>
										Add new sponsor
										<ExternalLink className="h-3 w-3" />
									</Link>
								</div>
							)}

						{!isLoading &&
							sponsors?.map((sponsor) => (
								<button
									key={sponsor.id}
									onClick={() => {
										onSelect(sponsor);
										setSelectedLabel(sponsor.name || "");
										setOpen(false);
									}}
									className={cn(
										"relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
										sponsor.id?.toString() === value &&
											"bg-accent text-accent-foreground",
									)}
								>
									<Handshake
										className={cn(
											"mr-2 h-4 w-4",
											sponsor.id?.toString() === value
												? "opacity-100"
												: "opacity-40",
										)}
									/>
									<div className="flex flex-col items-start text-left">
										<span className="font-medium">{sponsor.name}</span>
										{sponsor.industry && (
											<span className="text-muted-foreground text-xs">
												{sponsor.industry}
											</span>
										)}
									</div>
								</button>
							))}
					</div>

					<div className="border-t bg-muted/50 p-2">
						<Link
							href="/sponsors"
							target="_blank"
							className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 font-medium text-primary text-sm transition-colors hover:bg-accent"
						>
							<Plus className="h-4 w-4" />
							Manage Sponsors
							<ExternalLink className="ml-auto h-3 w-3 opacity-50" />
						</Link>
					</div>
				</div>
			</PopoverContent>
		</Popover>
	);
}
