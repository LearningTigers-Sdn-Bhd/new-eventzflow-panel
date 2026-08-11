"use client";

import {
	BarChart3,
	ChevronDown,
	LayoutGrid,
	Link2,
	MapPinned,
	PackageOpen,
	Plus,
	Settings2,
	Tags,
	TicketPercent,
	Users,
	Vault,
} from "lucide-react";
import Link from "next/link";
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
import { useFullScreenDialogStore } from "@/stores/full-screen-dialog-store";
import { InviteVendorDialog } from "../../event-vendors/dialogs/invite-vendor-dialog";
import { BoothInventoryDialog } from "../dialogs/booth-inventory-dialog";
import { BoothPricingDialog } from "../dialogs/booth-pricing-dialog";
import { BoothTypesDialog } from "../dialogs/booth-types-dialog";
import { PackageDialog } from "../dialogs/package-dialog";
import { TeamLimitsDialog } from "../dialogs/team-limits-dialog";
import { VoucherDialog } from "../dialogs/voucher-dialog";
import { ZonePricingDialog } from "../dialogs/zone-pricing-dialog";
import AddExhibitorModal from "../forms/add-exhibitor";

export function ExhibitorPageButton() {
	const params = useParams();
	const eventId = params.event_id as string;
	const { openDialog, closeDialog } = useDialog();
	const permissions = useEventPermissions(eventId);
	const setFullScreenDialogOpen = useFullScreenDialogStore(
		(state) => state.setOpen,
	);

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
			<Button
				variant="outline"
				className="w-full rounded-none sm:w-auto"
				asChild
			>
				<Link href={`/event/${eventId}/analytics/exhibitor`}>
					<BarChart3 className="mr-2 h-4 w-4" />
					Analytics
				</Link>
			</Button>
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
					<DropdownMenuItem
						onSelect={() =>
							setFullScreenDialogOpen(`booth-pricing-dialog-${eventId}`, true)
						}
						className="rounded-none"
					>
						<Tags className="h-4 w-4" />
						Booth Prices
					</DropdownMenuItem>
					<DropdownMenuSeparator />
					<DropdownMenuItem
						onSelect={() =>
							setFullScreenDialogOpen(`package-dialog-${eventId}`, true)
						}
						className="rounded-none"
					>
						<PackageOpen className="h-4 w-4" />
						Packages
					</DropdownMenuItem>
					<DropdownMenuSeparator />
					<DropdownMenuItem
						onSelect={() =>
							setFullScreenDialogOpen(`voucher-dialog-${eventId}`, true)
						}
						className="rounded-none"
					>
						<TicketPercent className="h-4 w-4" />
						Vouchers
					</DropdownMenuItem>
					<DropdownMenuSeparator />
					<DropdownMenuItem
						onSelect={() =>
							setFullScreenDialogOpen(`booth-inventory-dialog-${eventId}`, true)
						}
						className="rounded-none"
					>
						<Vault className="h-4 w-4" />
						Manage Booths
					</DropdownMenuItem>
					<DropdownMenuSeparator />
					<BoothTypesDialog
						eventId={Number(eventId)}
						trigger={
							<DropdownMenuItem
								onSelect={(e) => e.preventDefault()}
								className="rounded-none"
							>
								<LayoutGrid className="h-4 w-4" />
								Booth Types
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
			<BoothPricingDialog
				eventId={Number(eventId)}
				trigger={<span className="hidden" />}
			/>
			<PackageDialog
				eventId={Number(eventId)}
				trigger={<span className="hidden" />}
			/>
			<VoucherDialog
				eventId={Number(eventId)}
				trigger={<span className="hidden" />}
			/>
			<BoothInventoryDialog
				eventId={Number(eventId)}
				trigger={<span className="hidden" />}
			/>
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
