"use client";

import { Eye, MoreHorizontal, Pencil, Trash } from "lucide-react";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDialog } from "@/hooks/use-dialog";
import type { LuckyDrawSession } from "@/lib/api/lucky-draw/response";
import DeleteAlert from "./manage-session/delete-alert";
import EditForm from "./manage-session/edit-form";

interface ActionMenuProps {
	session: LuckyDrawSession;
}

export function ActionMenu({ session }: ActionMenuProps) {
	const { openDialog } = useDialog();
	const router = useRouter();

	const openSession = () => {
		router.push(
			`/event/${session.event_id}/lucky-draw/session/${session.id}` as Route,
		);
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" size="icon" className="rounded-none">
					<MoreHorizontal className="h-4 w-4" />
					<span className="sr-only">Open menu</span>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="rounded-none bg-background">
				<DropdownMenuLabel className="rounded-none">Actions</DropdownMenuLabel>
				<DropdownMenuSeparator className="rounded-none" />
				<DropdownMenuItem onClick={openSession} className="rounded-none">
					<Eye className="mr-2 h-4 w-4" />
					View / Open
				</DropdownMenuItem>
				<DropdownMenuItem
					onClick={() =>
						openDialog({
							component: EditForm,
							props: { session },
							config: {
								title: "Edit Lucky Draw Session",
								description: "Update your lucky draw session settings",
								size: "full",
								showCloseButton: true,
							},
						})
					}
					className="rounded-none"
				>
					<Pencil className="mr-2 h-4 w-4" />
					Edit
				</DropdownMenuItem>
				<DropdownMenuSeparator className="rounded-none" />
				<DropdownMenuItem
					className="rounded-none text-destructive focus:text-destructive"
					onClick={() =>
						openDialog({
							component: DeleteAlert,
							props: { session },
							config: {
								title: "Delete Session",
							},
						})
					}
				>
					<Trash className="mr-2 h-4 w-4" />
					Delete
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
