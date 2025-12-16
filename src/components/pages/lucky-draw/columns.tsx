"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { getLuckyDrawSessionLogoUrl } from "@/lib/api/lucky-draw";
import type { LuckyDrawSession } from "@/lib/api/lucky-draw/response";
import { ActionMenu } from "./action-menu";
import { cn } from "@/lib/utils";

export const columns: ColumnDef<LuckyDrawSession>[] = [
	{
		accessorKey: "logo",
		header: "Logo",
		cell: ({ row }) => {
			const logo = row.getValue("logo") as string;
			return logo ? (
				<div className="relative h-10 w-10 overflow-hidden rounded-md border">
					<img
						src={getLuckyDrawSessionLogoUrl(logo)}
						alt={row.original.title}
						className="h-full w-full object-cover"
					/>
				</div>
			) : (
				<div className="flex h-10 w-10 items-center justify-center rounded-md border bg-muted text-muted-foreground text-xs">
					NA
				</div>
			);
		},
	},
	{
		accessorKey: "title",
		header: "Title",
	},
	{
		accessorKey: "draw_date",
		header: "Draw Date",
		cell: ({ row }) => {
			const date = row.getValue("draw_date") as string;
			return date ? format(new Date(date), "PPP") : "No date";
		},
	},
	{
		accessorKey: "draw_styles",
		header: "Style",
		cell: ({ row }) => {
			const drawStyles = row.getValue("draw_styles") as {
				style: string;
				theme: string;
			} | null;

			if (!drawStyles) {
				return <span className="text-muted-foreground text-sm">No style</span>;
			}

			// Style colors with background
			const styleColors: Record<string, string> = {
				wheel: "bg-blue-500 text-white border-blue-600",
				slot: "bg-purple-500 text-white border-purple-600",
				box: "bg-orange-500 text-white border-orange-600",
			};

			// Theme colors with background
			const themeColors: Record<string, string> = {
				wireframe: "bg-gray-500 text-white border-gray-600",
				colorful: "bg-pink-500 text-white border-pink-600",
				cartoon: "bg-yellow-500 text-white border-yellow-600",
			};

			return (
				<div className="flex items-center gap-2">
					<Badge
						className={cn(
							"rounded-none font-bold capitalize",
							styleColors[drawStyles.style] || "bg-gray-500 text-white",
						)}
					>
						{drawStyles.style}
					</Badge>
					<Badge
						className={cn(
							"rounded-none font-bold capitalize text-xs",
							themeColors[drawStyles.theme] || "bg-gray-500 text-white",
						)}
					>
						{drawStyles.theme}
					</Badge>
				</div>
			);
		},
	},
	{
		accessorKey: "use_gifts",
		header: "Uses Gifts",
		cell: ({ row }) => {
			const useGifts = row.getValue("use_gifts") as boolean;
			return (
				<Badge
					variant="outline"
					className={cn(
						"rounded-none font-bold capitalize",
						useGifts
							? "border-green-500 text-green-500"
							: "border-red-500 text-red-500",
					)}
				>
					{useGifts ? "Yes" : "No"}
				</Badge>
			);
		},
	},
	{
		id: "actions",
		header: "Actions",
		cell: ({ row }) => <ActionMenu session={row.original} />,
	},
];
