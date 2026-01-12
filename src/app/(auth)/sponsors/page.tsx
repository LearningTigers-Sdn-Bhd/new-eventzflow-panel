"use client";

import { Handshake } from "lucide-react";
import { ErrorState, LoadingState } from "@/components/data-state";
import { Button } from "@/components/ui/button";
import { IconTitle } from "@/components/ui/icon-heading";
import { useAuth } from "@/hooks/use-auth";
import { useSponsors } from "@/hooks/use-sponsorships";
import { useHydratedStore } from "@/hooks/use-hydrated-store";
import SponsorsListView from "@/components/pages/sponsors/sponsors-list-view";
import { useDialog } from "@/hooks/use-dialog";
import CreateSponsorForm from "@/components/pages/sponsors/forms/create-sponsor-form";

export default function SponsorsPage() {
	const isHydrated = useHydratedStore();
	const { user } = useAuth();
	const { openDialog, closeDialog } = useDialog();

	// Only org_owner and organizer can create sponsors
	const canCreateSponsor =
		user?.role === "org_owner" || user?.role === "organizer";

	const {
		data: sponsors,
		isLoading,
		error,
	} = useSponsors();

	const handleAddSponsor = () => {
		openDialog({
			component: CreateSponsorForm,
			props: {
				onClose: closeDialog,
			},
			config: {
				title: "Add Sponsor",
				description: "Add a new sponsor to the organization directory",
				size: "2xl",
				showCloseButton: true,
			},
		});
	};

	return (
		<div className="space-y-6 p-0">
			{/* Show loading state, error state, or content */}
			{isLoading && isHydrated ? (
				<LoadingState
					title="Loading sponsors..."
					description="Please wait while we fetch your sponsors..."
				/>
			) : error ? (
				<ErrorState
					title="Failed to load sponsors"
					description="We couldn't load your sponsors. Please try again."
					action={
						<Button onClick={() => window.location.reload()}>Retry</Button>
					}
				/>
			) : (
				<div>
					<div className="page-header mb-6">
						<div className="px-2 md:px-4">
							<IconTitle
								icon={Handshake}
								title="Sponsors"
								description="Manage your global sponsor directory."
							/>
						</div>
						{canCreateSponsor && (
							<div className="w-full px-0 md:w-auto md:px-4">
								<Button
									onClick={handleAddSponsor}
									className="w-full shrink-0 rounded-none"
								>
									Add Sponsor
								</Button>
							</div>
						)}
					</div>

					<div className="mt-6 px-4">
                        <SponsorsListView 
                            sponsors={sponsors || []} 
                            onAddSponsor={canCreateSponsor ? handleAddSponsor : undefined}
                        />
					</div>
				</div>
			)}
		</div>
	);
}
