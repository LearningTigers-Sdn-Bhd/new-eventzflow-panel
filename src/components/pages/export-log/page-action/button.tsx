"use client";

import { Check, ChevronDown, FileDown } from "lucide-react";
import * as React from "react";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Preset = "all" | "today" | "last7" | "last30" | "custom";

function toInputValue(date: Date): string {
	const y = date.getFullYear();
	const m = String(date.getMonth() + 1).padStart(2, "0");
	const d = String(date.getDate()).padStart(2, "0");
	return `${y}-${m}-${d}`;
}

function getPresetDates(preset: Preset): { from: string; to: string } {
	const now = new Date();
	const today = toInputValue(now);
	if (preset === "today") return { from: today, to: today };
	if (preset === "last7") {
		const from = new Date(now);
		from.setDate(now.getDate() - 6);
		return { from: toInputValue(from), to: today };
	}
	if (preset === "last30") {
		const from = new Date(now);
		from.setDate(now.getDate() - 29);
		return { from: toInputValue(from), to: today };
	}
	return { from: "", to: "" };
}

interface ExportLogPageButtonProps {
	onCreateExport: (from?: string, to?: string) => void;
	isCreating: boolean;
}

export function ExportLogPageButton({
	onCreateExport,
	isCreating,
}: ExportLogPageButtonProps) {
	const [open, setOpen] = React.useState(false);
	const [preset, setPreset] = React.useState<Preset>("all");
	const [from, setFrom] = React.useState("");
	const [to, setTo] = React.useState("");

	const handlePresetSelect = (selected: Preset) => {
		setPreset(selected);
		if (selected !== "custom") {
			const dates = getPresetDates(selected);
			setFrom(dates.from);
			setTo(dates.to);
		}
	};

	const handleExport = () => {
		onCreateExport(from || undefined, to || undefined);
		setOpen(false);
		setPreset("all");
		setFrom("");
		setTo("");
	};

	const presets: { value: Preset; label: string }[] = [
		{ value: "all", label: "All dates" },
		{ value: "today", label: "Today" },
		{ value: "last7", label: "Last 7 days" },
		{ value: "last30", label: "Last 30 days" },
		{ value: "custom", label: "Custom range" },
	];

	return (
		<DropdownMenu open={open} onOpenChange={setOpen}>
			<DropdownMenuTrigger asChild>
				<Button
					variant="outline"
					disabled={isCreating}
					className="rounded-none"
				>
					<FileDown className="size-4" />
					{isCreating ? "Creating Export..." : "Export Tickets"}
					<ChevronDown className="ml-1 size-3" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent className="w-52 rounded-none" align="end">
				{presets.map((p) => (
					<DropdownMenuItem
						key={p.value}
						className="rounded-none"
						onSelect={(e) => {
							e.preventDefault();
							handlePresetSelect(p.value);
						}}
					>
						<Check
							className={`mr-2 size-4 ${preset === p.value ? "opacity-100" : "opacity-0"}`}
						/>
						{p.label}
					</DropdownMenuItem>
				))}
				{preset === "custom" && (
					<>
						<DropdownMenuSeparator />
						<div className="space-y-2 p-2">
							<div>
								<label className="mb-1 block text-xs font-medium text-muted-foreground">
									From
								</label>
								<input
									type="date"
									value={from}
									onChange={(e) => setFrom(e.target.value)}
									className="w-full rounded-none border border-input bg-background px-2 py-1 text-sm"
								/>
							</div>
							<div>
								<label className="mb-1 block text-xs font-medium text-muted-foreground">
									To
								</label>
								<input
									type="date"
									value={to}
									onChange={(e) => setTo(e.target.value)}
									className="w-full rounded-none border border-input bg-background px-2 py-1 text-sm"
								/>
							</div>
						</div>
					</>
				)}
				<DropdownMenuSeparator />
				<div className="p-2">
					<Button
						className="w-full rounded-none"
						onClick={handleExport}
						disabled={isCreating}
					>
						<FileDown className="mr-1 size-4" />
						Export
					</Button>
				</div>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
