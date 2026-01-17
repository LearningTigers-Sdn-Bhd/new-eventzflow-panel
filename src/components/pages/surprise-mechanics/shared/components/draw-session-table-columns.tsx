"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Image } from "@unpic/react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { BaseSession } from "../types";
import { StyleThemeBadges } from "../utils/session-badge";

export interface BadgeColumnConfig<T extends BaseSession> {
	accessorKey: string;
	header: string;
	getValue: (session: T) => boolean;
	getLabel: (value: boolean) => string;
	getColors: (value: boolean) => { border: string; text: string };
}

export interface DrawSessionTableColumnsConfig<T extends BaseSession> {
	badgeColumn: BadgeColumnConfig<T>;
	ActionMenuComponent: React.ComponentType<{ session: T }>;
}

/**
 * Generic column generator for draw session tables
 * Used by both lucky-draw and roulette tables
 */
export function generateColumns<T extends BaseSession>(
	config: DrawSessionTableColumnsConfig<T>,
): ColumnDef<T>[] {
	return [
		{
			accessorKey: "logo_url",
			header: "Logo",
			cell: ({ row }) => {
				const logoUrl = row.getValue("logo_url") as string | null;
				return logoUrl ? (
					<div className="relative h-10 w-10 overflow-hidden rounded-none border">
						<Image
							src={logoUrl}
							alt={row.original.title}
							width={40}
							height={40}
							className="h-full w-full object-cover"
						/>
					</div>
				) : (
					<div className="flex h-10 w-10 items-center justify-center rounded-none border bg-muted text-muted-foreground text-xs">
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
				const date = row.getValue("draw_date") as string | null;
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

				return (
					<StyleThemeBadges
						style={drawStyles?.style}
						theme={drawStyles?.theme}
						variant="table"
					/>
				);
			},
		},
		{
			accessorKey: config.badgeColumn.accessorKey,
			header: config.badgeColumn.header,
			cell: ({ row }) => {
				const session = row.original;
				const value = config.badgeColumn.getValue(session);
				const colors = config.badgeColumn.getColors(value);
				const label = config.badgeColumn.getLabel(value);

				return (
					<Badge
						variant="outline"
						className={cn(
							"rounded-none font-bold capitalize",
							colors.border,
							colors.text,
						)}
					>
						{label}
					</Badge>
				);
			},
		},
		{
			id: "actions",
			size: 120,
			enableHiding: false,
			meta: {
				sticky: "right",
			},
			header: () => <div className="text-center">Actions</div>,
			cell: ({ row }) => {
				const session = row.original;
				return (
					<div className="flex justify-center">
						<config.ActionMenuComponent session={session} />
					</div>
				);
			},
		},
	];
}
