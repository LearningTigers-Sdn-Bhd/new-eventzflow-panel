"use client";

import type { ColumnDef } from "@tanstack/react-table";
import {
	CellView,
	HoverCardView,
	HoverCell,
} from "@/components/admin-ui/table/cell/hover-cell";
import { SortableHeader } from "@/components/admin-ui/table/header/sortable-header";
import { Badge } from "@/components/ui/badge";
import type { ResourceLead } from "@/lib/api/resource/lead/response";
import { LeadsActionMenu } from "./leads-action-menu";

export const columns: ColumnDef<ResourceLead>[] = [
	{
		id: "index",
		header: "No.",
		size: 50,
		cell: ({ row }) => <div>{row.index + 1}</div>,
	},
	{
		id: "lead",
		header: ({ column }) => <SortableHeader column={column} label="Lead" />,
		accessorKey: "name",
		cell: ({ row }) => {
			const lead = row.original;
			return (
				<HoverCell>
					<CellView className="flex max-w-[300px] flex-col gap-1 py-1 md:max-w-[400px]">
						<span className="line-clamp-1 font-medium text-base leading-tight">
							{lead.name}
						</span>
						<span className="line-clamp-1 text-muted-foreground text-xs">
							{lead.email}
						</span>
						{lead.phone && (
							<span className="line-clamp-1 text-muted-foreground text-xs">
								{lead.phone}
							</span>
						)}
					</CellView>
					<HoverCardView>
						<div className="space-y-4">
							<div className="space-y-1">
								<h4 className="font-semibold text-sm leading-tight">
									{lead.name}
								</h4>
								<p className="text-muted-foreground text-xs">{lead.email}</p>
								{lead.phone && (
									<p className="text-muted-foreground text-xs">{lead.phone}</p>
								)}
							</div>

							{(lead.company || lead.jobTitle) && (
								<div className="space-y-1">
									{lead.company && (
										<p className="text-xs">
											<span className="font-medium">Company:</span> {lead.company}
										</p>
									)}
									{lead.jobTitle && (
										<p className="text-xs">
											<span className="font-medium">Job Title:</span>{" "}
											{lead.jobTitle}
										</p>
									)}
								</div>
							)}

							{(lead.country || lead.state) && (
								<div className="space-y-1">
									<p className="text-xs">
										<span className="font-medium">Location:</span>{" "}
										{[lead.state, lead.country].filter(Boolean).join(", ")}
									</p>
								</div>
							)}
						</div>
					</HoverCardView>
				</HoverCell>
			);
		},
	},
	{
		id: "company",
		accessorKey: "company",
		header: "Company",
		cell: ({ row }) => {
			const company = row.original.company;
			const jobTitle = row.original.jobTitle;
			if (!company && !jobTitle) return <span className="text-muted-foreground text-xs">-</span>;
			return (
				<div className="flex flex-col gap-0.5">
					{company && <span className="text-xs">{company}</span>}
					{jobTitle && (
						<span className="text-muted-foreground text-xs">{jobTitle}</span>
					)}
				</div>
			);
		},
	},
	{
		id: "location",
		accessorKey: "country",
		header: "Location",
		cell: ({ row }) => {
			const country = row.original.country;
			const state = row.original.state;
			if (!country && !state) return <span className="text-muted-foreground text-xs">-</span>;
			return (
				<div className="flex flex-col gap-0.5">
					{country && <span className="text-xs">{country}</span>}
					{state && <span className="text-muted-foreground text-xs">{state}</span>}
				</div>
			);
		},
	},
	{
		id: "resource",
		accessorFn: (row) => row.resource?.title,
		header: "Resource",
		cell: ({ row }) => {
			const resource = row.original.resource;
			if (!resource) return <span className="text-muted-foreground text-xs">-</span>;
			return (
				<div className="flex flex-col gap-1">
					<span className="line-clamp-1 text-xs">{resource.title}</span>
					<span
						className="line-clamp-1 font-mono text-[10px] text-muted-foreground"
						title={`/${resource.slug}`}
					>
						/{resource.slug}
					</span>
				</div>
			);
		},
	},
	{
		accessorKey: "createdAt",
		header: ({ column }) => <SortableHeader column={column} label="Submitted" />,
		cell: ({ row }) => {
			const date = new Date(row.getValue("createdAt"));
			return (
				<div className="flex flex-col gap-0.5">
					<div className="text-xs">{date.toLocaleDateString()}</div>
					<div className="text-muted-foreground text-[10px]">
						{date.toLocaleTimeString()}
					</div>
				</div>
			);
		},
	},
	{
		id: "actions",
		size: 100,
		meta: {
			sticky: "right",
		},
		header: () => <div className="text-center">Actions</div>,
		cell: ({ row }) => (
			<div className="flex justify-center">
				<LeadsActionMenu lead={row.original} />
			</div>
		),
	},
];
