"use client";

import { useQuery } from "@tanstack/react-query";
import { Boxes, Store } from "lucide-react";
import { useState } from "react";
import { ErrorState, LoadingState } from "@/components/data-state";
import VendorClientWrapper from "@/components/pages/vendors/vendor-client-wrapper";
import CreateVendorForm from "@/components/pages/vendors/dialogs/create-vendor-form";
import GroupClientWrapper from "@/components/pages/vendor-groups/group-client-wrapper";
import { CreateGroupDialog } from "@/components/pages/vendor-groups/dialogs/create-group-dialog";
import { Button } from "@/components/ui/button";
import { IconTitle } from "@/components/ui/icon-heading";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { useDialog } from "@/hooks/use-dialog";
import { useHydratedStore } from "@/hooks/use-hydrated-store";
import { getVendors } from "@/lib/api/vendor";
import { useGroups } from "@/hooks/use-groups";

export default function VendorPage() {
	const isHydrated = useHydratedStore();
	const { user } = useAuth();
	const { openDialog, closeDialog } = useDialog();
	const [isCreateGroupDialogOpen, setIsCreateGroupDialogOpen] = useState(false);
	const [activeTab, setActiveTab] = useState("vendors");

	// Only org_owner and organizer can create vendors/groups
	const canCreateVendor = user?.role === "org_owner" || user?.role === "organizer";
	const canCreateGroup = user?.role === "org_owner" || user?.role === "organizer";

	const {
		data: vendors,
		isLoading: isLoadingVendors,
		error: vendorsError,
	} = useQuery({
		queryKey: ["vendors"],
		queryFn: getVendors,
		enabled: isHydrated, // Only fetch when store is hydrated
	});

	const {
		data: groups,
		isLoading: isLoadingGroups,
		error: groupsError,
	} = useGroups();

	const isLoading = isLoadingVendors || isLoadingGroups;
	const error = vendorsError || groupsError;

	const handleAddVendor = () => {
		openDialog({
			component: CreateVendorForm,
			props: {
				onClose: closeDialog,
			},
			config: {
				title: "Add Vendor",
				description: "Create a new vendor account with login credentials.",
				size: "2xl",
			},
		});
	};

	return (
		<div className="space-y-6 p-0">
			{/* Show loading state, error state, or content */}
			{isLoading ? (
				<LoadingState
					title="Loading vendors..."
					description="Please wait while we fetch your vendors..."
				/>
			) : error ? (
				<ErrorState
					title="Failed to load vendors"
					description="We couldn't load your vendors. Please try again."
					action={
						<Button onClick={() => window.location.reload()}>Retry</Button>
					}
				/>
			) : (
				<div>
					<div className="page-header mb-6">
						<div className="px-2 md:px-4">
							<IconTitle
								icon={Store}
								title="Vendors"
								description="Manage your vendors and vendor groups."
							/>
						</div>
						{activeTab === "vendors" && canCreateVendor && (
							<div className="w-full px-0 md:w-auto md:px-4">
								<Button
									onClick={handleAddVendor}
									className="w-full shrink-0 rounded-none"
								>
									Add Vendor
								</Button>
							</div>
						)}
						{activeTab === "groups" && canCreateGroup && (
							<div className="w-full px-0 md:w-auto md:px-4">
								<Button
									onClick={() => setIsCreateGroupDialogOpen(true)}
									className="w-full shrink-0 rounded-none"
								>
									Create Group
								</Button>
							</div>
						)}
					</div>

					<Tabs defaultValue="vendors" className="w-full" onValueChange={setActiveTab}>
						<div className="w-full border-y border-dashed">
							<TabsList className="flex h-12 w-full rounded-none">
								<TabsTrigger
									value="vendors"
									className="flex flex-1 items-center justify-center gap-2 rounded-none"
								>
									<Store className="size-4" />
									Vendors
								</TabsTrigger>
								<TabsTrigger
									value="groups"
									className="flex flex-1 items-center justify-center gap-2 rounded-none"
								>
									<Boxes className="size-4" />
									Vendor Groups
								</TabsTrigger>
							</TabsList>
						</div>

						<div className="mt-6">
							<TabsContent value="vendors" className="mt-0">
								<VendorClientWrapper vendors={vendors || []} showHeader={false} />
							</TabsContent>

							<TabsContent value="groups" className="mt-0">
								<GroupClientWrapper groups={groups || []} showHeader={false} />
							</TabsContent>
						</div>
					</Tabs>

					<CreateGroupDialog
						open={isCreateGroupDialogOpen}
						onOpenChange={setIsCreateGroupDialogOpen}
					/>
				</div>
			)}
		</div>
	);
}
