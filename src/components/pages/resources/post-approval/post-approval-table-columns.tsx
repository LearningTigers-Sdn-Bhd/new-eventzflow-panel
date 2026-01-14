"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Check, Mail, Phone, Shield } from "lucide-react";
import { CopyUrlButton } from "@/components/admin-ui/table/cell/copy-url-button";
import {
	CellView,
	HoverCardView,
	HoverCell,
} from "@/components/admin-ui/table/cell/hover-cell";
import { SortableHeader } from "@/components/admin-ui/table/header/sortable-header";
import { Badge } from "@/components/ui/badge";
import type { Resource } from "@/lib/api/resource/response";
import { cn } from "@/lib/utils";
import { PostApprovalActionMenu } from "./post-approval-action-menu";

export const columns: ColumnDef<Resource>[] = [
	{
		id: "index",
		header: "No.",
		size: 50,
		cell: ({ row }) => <div>{row.index + 1}</div>,
	},
	{
		id: "topic",
		accessorFn: (row) => row.topic?.name,
		header: "Topic",
	},
	{
		id: "category",
		accessorFn: (row) => row.category?.name,
		header: "Category",
	},
	{
		id: "mediaType",
		accessorFn: (row) => row.mediaType?.name,
		header: "Media Type",
	},
	{
		id: "slug",
		accessorKey: "slug",
		header: "Slug",
	},
	{
		id: "metaDescription",
		accessorKey: "metaDescription",
		header: "Meta Description",
	},
	{
		id: "authorEmail",
		accessorFn: (row) => row.author?.email,
		header: "Author Email",
	},
	{
		id: "authorPhone",
		accessorFn: (row) => row.author?.phone,
		header: "Author Phone",
	},
	{
		id: "post",
		header: ({ column }) => <SortableHeader column={column} label="Post" />,
		accessorKey: "title",
		cell: ({ row }) => {
			const post = row.original;
			return (
				<HoverCell>
					<CellView className="flex max-w-[300px] flex-col gap-1 py-1 md:max-w-[400px]">
						<span className="line-clamp-1 font-medium text-base leading-tight">
							{post.title}
						</span>
						<span
							className="line-clamp-1 font-mono text-[10px] text-muted-foreground"
							title={`/${post.slug}`}
						>
							/{post.slug}
						</span>
						{post.metaDescription && (
							<p className="line-clamp-2 max-w-[400px] text-muted-foreground text-xs">
								{post.metaDescription}
							</p>
						)}
						<div className="mt-1 flex flex-wrap gap-1">
							{post.topic && (
								<Badge
									variant="outline"
									className="h-4 rounded-none px-1 text-[10px]"
								>
									{post.topic.name}
								</Badge>
							)}
							{post.category && (
								<Badge
									variant="outline"
									className="h-4 rounded-none px-1 text-[10px]"
								>
									{post.category.name}
								</Badge>
							)}
							{post.mediaType && (
								<Badge
									variant="outline"
									className="h-4 rounded-none px-1 text-[10px]"
								>
									{post.mediaType.name}
								</Badge>
							)}
						</div>
					</CellView>
					<HoverCardView>
						<div className="space-y-4">
							<div className="space-y-1">
								<h4 className="font-semibold text-sm leading-tight">
									{post.title}
								</h4>
								{post.metaDescription && (
									<p className="text-muted-foreground text-xs leading-relaxed">
										{post.metaDescription}
									</p>
								)}
							</div>

							<div className="flex flex-wrap gap-1.5">
								{post.topic && (
									<Badge variant="secondary" className="rounded-none text-xs">
										Topic: {post.topic.name}
									</Badge>
								)}
								{post.category && (
									<Badge variant="outline" className="rounded-none text-xs">
										Category: {post.category.name}
									</Badge>
								)}
								{post.mediaType && (
									<Badge variant="outline" className="rounded-none text-xs">
										Type: {post.mediaType.name}
									</Badge>
								)}
							</div>

							<CopyUrlButton slug={post.slug} />
						</div>
					</HoverCardView>
				</HoverCell>
			);
		},
	},
	{
		id: "author",
		accessorFn: (row) => row.author?.fullName,
		header: ({ column }) => <SortableHeader column={column} label="Author" />,
		cell: ({ row }) => {
			const author = row.original.author;
			if (!author)
				return (
					<span className="text-muted-foreground text-xs italic">Unknown</span>
				);

			const hasStatus = (author.writePermission?.status ?? 0) > 0;
			const isOfficial = author.writePermission?.isOfficial ?? false;

			return (
				<HoverCell>
					<CellView className="flex flex-col gap-0.5 py-1">
						<span className="font-medium text-sm leading-tight">
							{author.fullName}
						</span>
						<span className="text-[10px] text-muted-foreground">
							{author.email}
						</span>
						{author.phone && (
							<span className="text-[10px] text-muted-foreground">
								{author.phone}
							</span>
						)}
					</CellView>
					<HoverCardView>
						<div className="space-y-4">
							<div className="space-y-1.5">
								<h4 className="font-semibold text-sm leading-tight">
									{author.fullName}
								</h4>
								<div className="flex flex-col gap-1 text-muted-foreground text-xs">
									<span className="flex items-center gap-2">
										<Mail className="size-3" />
										{author.email}
									</span>
									{author.phone && (
										<span className="flex items-center gap-2">
											<Phone className="size-3" />
											{author.phone}
										</span>
									)}
								</div>
							</div>

							<div className="flex flex-wrap gap-1.5 border-t pt-3">
								<Badge
									variant={hasStatus ? "default" : "outline"}
									className={cn(
										"gap-1 rounded-none px-1.5 text-xs",
										hasStatus
											? "border-green-600 bg-green-500 hover:bg-green-600"
											: "text-muted-foreground",
									)}
								>
									<Check
										className={cn("size-2.5", hasStatus ? "text-white" : "")}
										strokeWidth={3}
									/>
									Status: {hasStatus ? "Verified" : "Standard"}
								</Badge>
								<Badge
									variant={isOfficial ? "default" : "outline"}
									className={cn(
										"gap-1 rounded-none px-1.5 text-xs",
										isOfficial
											? "border-blue-600 bg-blue-500 hover:bg-blue-600"
											: "text-muted-foreground",
									)}
								>
									<Shield
										className={cn("size-2.5", isOfficial ? "text-white" : "")}
									/>
									Writer: {isOfficial ? "Official" : "External"}
								</Badge>
							</div>
						</div>
					</HoverCardView>
				</HoverCell>
			);
		},
	},
	{
		accessorKey: "status",
		header: ({ column }) => <SortableHeader column={column} label="Status" />,
		cell: ({ row }) => {
			const status = row.original.status;
			let variant: "default" | "secondary" | "destructive" | "outline" =
				"outline";
			switch (status) {
				case "published":
					variant = "default";
					break;
				case "draft":
					variant = "secondary";
					break;
				case "pending_review":
					variant = "outline";
					break;
				case "rejected":
					variant = "destructive";
					break;
				case "archived":
					variant = "secondary";
					break;
			}
			return (
				<Badge variant={variant} className="rounded-none capitalize">
					{(status || "unknown").replace("_", " ")}
				</Badge>
			);
		},
	},
	{
		id: "options",
		header: "Options",
		cell: ({ row }) => {
			const { isGated, isOfficial } = row.original;
			if (!isGated && !isOfficial) return "-";
			return (
				<div className="flex flex-wrap gap-1">
					{isGated && (
						<Badge
							variant="outline"
							className="h-5 rounded-none border-amber-200 bg-amber-50 text-[10px] text-amber-700"
						>
							Gated
						</Badge>
					)}
					{isOfficial && (
						<Badge
							variant="outline"
							className="h-5 rounded-none border-blue-200 bg-blue-50 text-[10px] text-blue-700"
						>
							Official
						</Badge>
					)}
				</div>
			);
		},
	},
	{
		accessorKey: "publishedAt",
		header: ({ column }) => (
			<SortableHeader column={column} label="Published" />
		),
		cell: ({ row }) => {
			const date = row.getValue("publishedAt");
			if (!date)
				return (
					<span className="text-muted-foreground text-xs italic">
						Not yet published
					</span>
				);
			return (
				<div className="text-xs">
					{new Date(date as string).toLocaleDateString()}
				</div>
			);
		},
	},
	{
		accessorKey: "createdAt",
		header: ({ column }) => (
			<SortableHeader column={column} label="Submitted" />
		),
		cell: ({ row }) => {
			const date = new Date(row.getValue("createdAt"));
			return <div className="text-xs">{date.toLocaleDateString()}</div>;
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
				<PostApprovalActionMenu post={row.original} />
			</div>
		),
	},
];
