"use client";

import { Boxes } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { IconTitle } from "@/components/ui/icon-heading";
import { useAuth } from "@/hooks/use-auth";
import type { Group } from "@/lib/api/group/response";
import { columns } from "./table/columns";
import { CreateGroupDialog } from "./dialogs/create-group-dialog";
import { DataTable } from "./table/data-table";

interface GroupClientWrapperProps {
	groups: Group[];
	showHeader?: boolean;
}

export default function GroupClientWrapper({
	groups,
	showHeader = true,
}: GroupClientWrapperProps) {
	const { user } = useAuth();
	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

	// Only org_owner and organizer can create groups
	const canCreateGroup = user?.role === "org_owner" || user?.role === "organizer";

	// Sort by created_at in descending order (latest first)
	const sortedGroups = groups.sort((a, b) => {
		return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
	});

	const handleAddGroup = () => {
		setIsCreateDialogOpen(true);
	};

	return (
		<div className="p-0">
			{showHeader && (
				<div className="page-header mb-6">
					<div className="px-2 md:px-4">
						<IconTitle
							icon={Boxes}
							title="Groups"
							description="Manage your organization groups and members."
						/>
					</div>
					{canCreateGroup && (
						<div className="w-full px-0 md:w-auto md:px-4">
							<Button
								onClick={handleAddGroup}
								className="w-full shrink-0 rounded-none"
							>
								Create Group
							</Button>
						</div>
					)}
				</div>
			)}
			<DataTable
				columns={columns}
				data={sortedGroups}
				onAddGroup={canCreateGroup ? handleAddGroup : undefined}
			/>

			<CreateGroupDialog
				open={isCreateDialogOpen}
				onOpenChange={setIsCreateDialogOpen}
			/>
		</div>
	);
}
