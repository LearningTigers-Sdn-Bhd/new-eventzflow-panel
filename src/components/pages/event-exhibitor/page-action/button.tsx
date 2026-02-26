"use client";

import {
	ChevronDown,
	Link2,
	MapPinned,
	Plus,
	Settings2,
	Tags,
	Users,
} from "lucide-react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDialog } from "@/hooks/use-dialog";
import { useEventPermissions } from "@/hooks/use-event-permissions";
import { InviteVendorDialog } from "../../event-vendors/dialogs/invite-vendor-dialog";
import { BoothPricingDialog } from "../dialogs/booth-pricing-dialog";
import { TeamLimitsDialog } from "../dialogs/team-limits-dialog";
import { ZonePricingDialog } from "../dialogs/zone-pricing-dialog";
import AddExhibitorModal from "../forms/add-exhibitor";

export function ExhibitorPageButton() {
	const params = useParams();
	const eventId = params.event_id as string;
	const { openDialog, closeDialog } = useDialog();
	const permissions = useEventPermissions(eventId);

	const handleAssignExhibitor = () => {
		openDialog({
			component: AddExhibitorModal,
			props: {
				eventId: Number(eventId),
				onClose: closeDialog,
			},
			config: {
				title: "Assign Exhibitor to Event",
				description:
					"Assign exhibitors to this event individually or from a group.",
				size: "full",
			},
		});
	};

	// Only event_admin (or org_owner) can assign exhibitors
	if (!permissions.canManageEventVendors) {
		return null;
	}

	const canInviteVendor = permissions.isOrganizer || permissions.isEventAdmin;

	return (
		<div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center lg:w-auto">
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant="outline" className="w-full rounded-none sm:w-auto">
						<Settings2 className="mr-2 h-4 w-4" />
						Exhibitor Settings
						<ChevronDown className="ml-2 h-4 w-4" />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent
					align="end"
					className="w-[var(--radix-dropdown-menu-trigger-width)] rounded-none"
				>
					<ZonePricingDialog
						eventId={Number(eventId)}
						trigger={
							<DropdownMenuItem
								onSelect={(e) => e.preventDefault()}
								className="rounded-none"
							>
								<MapPinned className="h-4 w-4" />
								Zones
							</DropdownMenuItem>
						}
					/>
					<DropdownMenuSeparator />
					<BoothPricingDialog
						eventId={Number(eventId)}
						trigger={
							<DropdownMenuItem
								onSelect={(e) => e.preventDefault()}
								className="rounded-none"
							>
								<Tags className="h-4 w-4" />
								Booth Prices
							</DropdownMenuItem>
						}
					/>
					<DropdownMenuSeparator />
					<TeamLimitsDialog
						eventId={Number(eventId)}
						trigger={
							<DropdownMenuItem
								onSelect={(e) => e.preventDefault()}
								className="rounded-none"
							>
								<Users className="h-4 w-4" />
								Team Limits
							</DropdownMenuItem>
						}
					/>
					{canInviteVendor && (
						<>
							<DropdownMenuSeparator />
							<InviteVendorDialog
								eventId={Number(eventId)}
								trigger={
									<DropdownMenuItem
										onSelect={(e) => e.preventDefault()}
										className="rounded-none"
									>
										<Link2 className="h-4 w-4" />
										Invite Exhibitor
									</DropdownMenuItem>
								}
							/>
						</>
					)}
				</DropdownMenuContent>
			</DropdownMenu>
			<Button
				onClick={handleAssignExhibitor}
				className="w-full rounded-none sm:w-auto"
			>
				<Plus className="mr-2 h-4 w-4" />
				Assign Exhibitor
			</Button>
		</div>
	);
}
