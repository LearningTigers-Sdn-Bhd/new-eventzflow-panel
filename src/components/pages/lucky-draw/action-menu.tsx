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
				<Button variant="ghost" className="h-8 w-8 p-0">
					<span className="sr-only">Open menu</span>
					<MoreHorizontal className="h-4 w-4" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				<DropdownMenuLabel>Actions</DropdownMenuLabel>
				<DropdownMenuItem onClick={openSession}>
					<Eye className="mr-2 h-4 w-4" />
					View / Open
				</DropdownMenuItem>
				<DropdownMenuItem
					onClick={() =>
						openDialog({
							component: EditForm,
							props: { session },
							config: {
								title: "Edit Session",
							},
						})
					}
				>
					<Pencil className="mr-2 h-4 w-4" />
					Edit
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuItem
					className="text-destructive focus:text-destructive"
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
