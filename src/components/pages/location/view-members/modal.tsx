"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDialog } from "@/hooks/use-dialog";
import type { BaseLocation } from "../columns";

interface ViewMembersDialogProps {
	location: BaseLocation;
	onClose?: () => void;
}

export default function ViewMembersDialog({
	location,
	onClose,
}: ViewMembersDialogProps) {
	const { closeDialog } = useDialog();
	const staffMembers = location.staffMembers || [];
	const vendors = location.vendors || [];
	const totalMembers = staffMembers.length + vendors.length;

	const renderMemberList = (members: typeof staffMembers, type: "staff" | "vendor") => {
		if (members.length === 0) {
			return (
				<div className="flex flex-col items-center justify-center py-12 text-center">
					<p className="text-muted-foreground text-sm">
						No {type === "staff" ? "staff members" : "vendors"} assigned to this location.
					</p>
				</div>
			);
		}

		return members.map((member) => (
			<div
				key={member.id}
				className="flex w-full items-center gap-3 rounded-md border bg-background p-3 hover:bg-muted/60"
			>
				<div className="min-w-0 flex-1">
					<div className="flex items-center gap-2">
						<p className="truncate font-medium text-sm">
							{member.name}
						</p>
						<Badge
							variant="outline"
							className={
								type === "vendor"
									? "border-purple-500 bg-purple-50 text-purple-700 text-xs"
									: "border-blue-500 bg-blue-50 text-blue-700 text-xs"
							}
						>
							{type === "vendor" ? "Vendor" : "Staff"}
						</Badge>
					</div>
					<p className="truncate text-muted-foreground text-xs">
						{member.email}
					</p>
					{member.role && (
						<p className="truncate text-muted-foreground text-xs capitalize">
							Role: {member.role.replace(/_/g, " ")}
						</p>
					)}
				</div>
			</div>
		));
	};

	return (
		<div className="flex flex-col gap-4">
			{/* Current location info */}
			<div className="rounded-md border bg-muted/50 p-3">
				<h3 className="font-semibold text-sm">
					{location.locationDisplayName || location.name}
				</h3>
				<p className="text-muted-foreground text-xs">
					{totalMembers === 0 ? (
						<span className="text-amber-600">
							No members assigned to this location
						</span>
					) : (
						<>
							{staffMembers.length} staff • {vendors.length} vendor{vendors.length !== 1 ? "s" : ""}
						</>
					)}
				</p>
			</div>

			{/* Tabs for Staff and Vendors */}
			<Tabs defaultValue="all" className="w-full">
				<TabsList className="grid w-full grid-cols-3">
					<TabsTrigger value="all">
						All ({totalMembers})
					</TabsTrigger>
					<TabsTrigger value="staff">
						Staff ({staffMembers.length})
					</TabsTrigger>
					<TabsTrigger value="vendors">
						Vendors ({vendors.length})
					</TabsTrigger>
				</TabsList>

				<TabsContent value="all">
					<ScrollArea className="h-[400px] rounded-md border">
						<div className="space-y-1 p-2">
							{totalMembers === 0 ? (
								<div className="flex flex-col items-center justify-center py-12 text-center">
									<p className="text-muted-foreground text-sm">
										No members assigned to this location.
									</p>
								</div>
							) : (
								<>
									{staffMembers.length > 0 && (
										<div className="mb-4">
											<h4 className="mb-2 px-2 font-semibold text-muted-foreground text-xs">
												STAFF MEMBERS
											</h4>
											<div className="space-y-1">
												{renderMemberList(staffMembers, "staff")}
											</div>
										</div>
									)}
									{vendors.length > 0 && (
										<div>
											<h4 className="mb-2 px-2 font-semibold text-muted-foreground text-xs">
												VENDORS
											</h4>
											<div className="space-y-1">
												{renderMemberList(vendors, "vendor")}
											</div>
										</div>
									)}
								</>
							)}
						</div>
					</ScrollArea>
				</TabsContent>

				<TabsContent value="staff">
					<ScrollArea className="h-[400px] rounded-md border">
						<div className="space-y-1 p-2">
							{renderMemberList(staffMembers, "staff")}
						</div>
					</ScrollArea>
				</TabsContent>

				<TabsContent value="vendors">
					<ScrollArea className="h-[400px] rounded-md border">
						<div className="space-y-1 p-2">
							{renderMemberList(vendors, "vendor")}
						</div>
					</ScrollArea>
				</TabsContent>
			</Tabs>

			{/* Only a close button for the user */}
			<div className="flex justify-end gap-2">
				<Button
					variant="outline"
					onClick={() => {
						closeDialog();
						if (onClose) onClose();
					}}
				>
					Close
				</Button>
			</div>
		</div>
	);
}
