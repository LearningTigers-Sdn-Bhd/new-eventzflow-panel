"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Building2, Trash2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useGroupAffiliates, useDeleteGroupAffiliate } from "@/hooks/use-group-affiliates";
import { toast } from "sonner";
import { AssignVendorDialog } from "../dialogs/assign-vendor-dialog";
import { LoadingState } from "@/components/data-state";
import type { GroupWithMembers } from "@/lib/api/group";

interface GroupAffiliateCardProps {
	groupId: number;
	group: GroupWithMembers;
}

export function GroupAffiliateCard({ groupId, group }: GroupAffiliateCardProps) {
	const { user } = useAuth();
	const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
	const { data: affiliates, isLoading } = useGroupAffiliates(groupId);
	const deleteAffiliate = useDeleteGroupAffiliate();

	// Check if current user has manager access for this specific group
	const currentUserMember = group.members?.find((member) => member.user_id === user?.id);
	const hasManagerAccess = currentUserMember?.has_manager_access || false;
	
	// Only org_owner or users with manager access for this group can assign/remove vendors
	const canManageAffiliates = user?.role === "org_owner" || hasManagerAccess;

	const handleRemove = async (affiliateId: number, vendorName: string) => {
		try {
			await deleteAffiliate.mutateAsync({ groupId, affiliateId });
			toast.success(`${vendorName} removed from group`);
		} catch (error) {
			toast.error("Failed to remove vendor");
		}
	};

	return (
		<>
			<Card className="rounded-none border-dashed">
				<CardHeader>
					<div className="flex items-center justify-between">
						<div>
							<CardTitle>Affiliated Vendors</CardTitle>
							<CardDescription>
								Vendors assigned to this group ({affiliates?.length || 0})
							</CardDescription>
						</div>
						{canManageAffiliates && (
							<Button
								size="sm"
								onClick={() => setIsAssignDialogOpen(true)}
								className="rounded-none"
							>
								<Plus className="mr-2 h-4 w-4" />
								Add Vendor
							</Button>
						)}
					</div>
				</CardHeader>
				<CardContent>
					{isLoading ? (
						<div className="flex h-[200px] items-center justify-center">
							<LoadingState title="Loading vendors..." />
						</div>
					) : !affiliates || affiliates.length === 0 ? (
						<div className="flex h-[200px] items-center justify-center rounded-none border border-dashed bg-muted/20 text-center">
							<div>
								<Building2 className="mx-auto h-12 w-12 text-muted-foreground" />
								<p className="mt-2 text-muted-foreground text-sm">
									No vendors assigned yet.
								</p>
							</div>
						</div>
					) : (
						<div className="grid grid-cols-1 gap-2 md:grid-cols-2">
							{affiliates.map((affiliate) => (
								<div
									key={affiliate.id}
									className="rounded-none border border-dashed bg-muted/20 p-4 transition-colors hover:bg-muted/30"
								>
									<div className="flex items-center justify-between gap-4">
										<div className="flex min-w-0 flex-1 items-center gap-4">
											<div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-none border border-dashed bg-background">
												<Building2 className="h-5 w-5 text-muted-foreground" />
											</div>
											<div className="min-w-0 flex-1">
												<p className="truncate font-medium">
													{affiliate.vendor.full_name}
												</p>
												<p className="truncate text-muted-foreground text-xs">
													{affiliate.vendor.email}
												</p>
											</div>
										</div>
										{canManageAffiliates && (
											<Button
												size="sm"
												variant="ghost"
												onClick={() =>
													handleRemove(affiliate.id, affiliate.vendor.full_name)
												}
												disabled={deleteAffiliate.isPending}
												className="flex-shrink-0 rounded-none"
											>
												<Trash2 className="h-4 w-4" />
											</Button>
										)}
									</div>
								</div>
							))}
						</div>
					)}
				</CardContent>
			</Card>

			<AssignVendorDialog
				groupId={groupId}
				open={isAssignDialogOpen}
				onOpenChange={setIsAssignDialogOpen}
			/>
		</>
	);
}
