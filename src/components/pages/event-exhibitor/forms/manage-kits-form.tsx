"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useId, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	Field,
	FieldDescription,
	FieldGroup,
	FieldLabel,
	FieldLegend,
	FieldSeparator,
	FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { updateExhibitorKit } from "@/lib/api/exhibitor-kit";
import type { EventVendor } from "@/lib/api/event-vendor";

interface ManageKitsFormProps {
	vendor: EventVendor;
	onClose?: () => void;
}

export function ManageKitsForm({ vendor, onClose }: ManageKitsFormProps) {
	const params = useParams();
	const eventId = Number(params.event_id);
	const kit = vendor.exhibitor_kit;

	// Form field IDs
	const boothNumberField = useId();
	const boothTypeField = useId();
	const boothDimensionsField = useId();
	const nameOnFasciaField = useId();
	const companyNameField = useId();
	const companyAddressField = useId();
	const picFullNameField = useId();
	const picContactNumberField = useId();
	const picEmailField = useId();
	const specialRequirementsField = useId();
	const paymentStatusField = useId();
	const amountPaidField = useId();
	const paymentNoteField = useId();

	// Form state
	const [boothNumber, setBoothNumber] = useState(kit?.booth_number || "");
	const [boothType, setBoothType] = useState<string>(kit?.booth_type || "");
	const [boothDimensions, setBoothDimensions] = useState(
		kit?.booth_dimensions || "",
	);
	const [sideWallLeftRequired, setSideWallLeftRequired] = useState(
		kit?.side_wall_left_required || false,
	);
	const [sideWallRightRequired, setSideWallRightRequired] = useState(
		kit?.side_wall_right_required || false,
	);
	const [nameOnFascia, setNameOnFascia] = useState(kit?.name_on_fascia || "");
	const [fasciaUpgradeRequired, setFasciaUpgradeRequired] = useState(
		kit?.fascia_upgrade_required || false,
	);
	const [companyName, setCompanyName] = useState(kit?.company_name || "");
	const [companyAddress, setCompanyAddress] = useState(
		kit?.company_address || "",
	);
	const [picFullName, setPicFullName] = useState(kit?.pic_full_name || "");
	const [picContactNumber, setPicContactNumber] = useState(
		kit?.pic_contact_number || "",
	);
	const [picEmail, setPicEmail] = useState(kit?.pic_email_address || "");
	const [specialRequirements, setSpecialRequirements] = useState(
		kit?.special_requirements || "",
	);
	const [paymentStatus, setPaymentStatus] = useState<string>(
		kit?.payment_status || "unpaid",
	);
	const [amountPaid, setAmountPaid] = useState(kit?.amount_paid || "");
	const [paymentNote, setPaymentNote] = useState(kit?.payment_note || "");

	const queryClient = useQueryClient();

	const updateKitMutation = useMutation({
		mutationFn: (data: Parameters<typeof updateExhibitorKit>[2]) =>
			updateExhibitorKit(eventId, kit!.id, data),
		onSuccess: () => {
			toast.success("Exhibitor kit updated successfully!");
			queryClient.invalidateQueries({
				queryKey: ["event", eventId.toString(), "vendors"],
			});
			onClose?.();
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to update exhibitor kit");
		},
	});

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!kit) {
			toast.error("No exhibitor kit found");
			return;
		}

		await updateKitMutation.mutateAsync({
			booth_number: boothNumber || undefined,
			booth_type: boothType as "shell_scheme" | "raw_space" | undefined,
			booth_dimensions: boothDimensions || undefined,
			side_wall_left_required: sideWallLeftRequired,
			side_wall_right_required: sideWallRightRequired,
			name_on_fascia: nameOnFascia || undefined,
			fascia_upgrade_required: fasciaUpgradeRequired,
			company_name: companyName || undefined,
			company_address: companyAddress || undefined,
			pic_full_name: picFullName || undefined,
			pic_contact_number: picContactNumber || undefined,
			pic_email_address: picEmail || undefined,
			special_requirements: specialRequirements || undefined,
			payment_status: paymentStatus as
				| "unpaid"
				| "paid"
				| "waived"
				| "sponsored",
			amount_paid: amountPaid || undefined,
			payment_note: paymentNote || undefined,
		});
	};

	if (!kit) {
		return (
			<div className="p-6 text-center text-muted-foreground">
				No exhibitor kit found.
			</div>
		);
	}

	return (
		<section className="w-full px-6">
			<form onSubmit={handleSubmit}>
				<FieldSet>
					<FieldLegend className="font-bold text-xl">
						Manage Exhibitor Kit
					</FieldLegend>
					<FieldDescription>
						Update booth information, company details, and payment status.
					</FieldDescription>
					<FieldSeparator />
					<FieldGroup>
						{/* Booth Information */}
						<p className="text-sm font-medium">Booth Information</p>
						<div className="grid grid-cols-1 gap-4 md:grid-cols-4 items-start">
							<Field orientation="vertical">
								<FieldLabel htmlFor={boothNumberField}>Booth Number</FieldLabel>
								<Input
									id={boothNumberField}
									value={boothNumber}
									onChange={(e) => setBoothNumber(e.target.value)}
									placeholder="e.g., A-101"
									disabled={updateKitMutation.isPending}
									className="rounded-none"
								/>
							</Field>
							<Field orientation="vertical">
								<FieldLabel htmlFor={boothTypeField}>Booth Type</FieldLabel>
								<Select
									value={boothType}
									onValueChange={setBoothType}
									disabled={updateKitMutation.isPending}
								>
									<SelectTrigger id={boothTypeField} className="rounded-none">
										<SelectValue placeholder="Select type" />
									</SelectTrigger>
									<SelectContent className="rounded-none">
										<SelectItem value="shell_scheme">Shell Scheme</SelectItem>
										<SelectItem value="raw_space">Raw Space</SelectItem>
									</SelectContent>
								</Select>
							</Field>
							<Field orientation="vertical">
								<FieldLabel htmlFor={boothDimensionsField}>
									Booth Dimensions
								</FieldLabel>
								<Input
									id={boothDimensionsField}
									value={boothDimensions}
									onChange={(e) => setBoothDimensions(e.target.value)}
									placeholder="e.g., 3m x 3m"
									disabled={updateKitMutation.isPending}
									className="rounded-none"
								/>
							</Field>
							<Field orientation="vertical">
								<FieldLabel>Side Walls Required</FieldLabel>
								<div className="flex gap-4 px-3 py-2 bg-accent rounded-none border border-dashed items-center h-9">
									<div className="flex items-center gap-2">
										<Switch
											checked={sideWallLeftRequired}
											onCheckedChange={setSideWallLeftRequired}
											disabled={updateKitMutation.isPending}
										/>
										<span className="text-sm">Left</span>
									</div>
									<div className="flex items-center gap-2">
										<Switch
											checked={sideWallRightRequired}
											onCheckedChange={setSideWallRightRequired}
											disabled={updateKitMutation.isPending}
										/>
										<span className="text-sm">Right</span>
									</div>
								</div>
							</Field>
						</div>

						<FieldSeparator />

						{/* Fascia & Company Information */}
						<p className="text-sm font-medium">Fascia & Company Information</p>
						<div className="grid grid-cols-1 gap-4 md:grid-cols-4 items-start">
							<Field orientation="vertical">
								<FieldLabel htmlFor={nameOnFasciaField}>
									Name on Fascia
								</FieldLabel>
								<Input
									id={nameOnFasciaField}
									value={nameOnFascia}
									onChange={(e) => setNameOnFascia(e.target.value)}
									placeholder="Display name (max 25 chars)"
									maxLength={25}
									disabled={updateKitMutation.isPending}
									className="rounded-none"
								/>
								<FieldDescription>
									{nameOnFascia.length}/25 characters
								</FieldDescription>
							</Field>
							<Field orientation="vertical">
								<FieldLabel htmlFor={companyNameField}>Company Name</FieldLabel>
								<Input
									id={companyNameField}
									value={companyName}
									onChange={(e) => setCompanyName(e.target.value)}
									placeholder="Enter company name"
									disabled={updateKitMutation.isPending}
									className="rounded-none"
								/>
							</Field>
							<Field orientation="vertical">
								<FieldLabel htmlFor={companyAddressField}>
									Company Address
								</FieldLabel>
								<Input
									id={companyAddressField}
									value={companyAddress}
									onChange={(e) => setCompanyAddress(e.target.value)}
									placeholder="Enter company address"
									disabled={updateKitMutation.isPending}
									className="rounded-none"
								/>
							</Field>
							<Field orientation="vertical">
								<FieldLabel>&nbsp;</FieldLabel>
								<div className="flex items-center gap-2 p-4 bg-accent rounded-none border border-dashed h-9">
									<Switch
										checked={fasciaUpgradeRequired}
										onCheckedChange={setFasciaUpgradeRequired}
										disabled={updateKitMutation.isPending}
									/>
									<span className="text-sm">Fascia Upgrade</span>
								</div>
							</Field>
						</div>

						<FieldSeparator />

						{/* PIC Information */}
						<p className="text-sm font-medium">
							Person In Charge (PIC) Information
						</p>
						<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
							<Field orientation="vertical">
								<FieldLabel htmlFor={picFullNameField}>
									PIC Full Name
								</FieldLabel>
								<Input
									id={picFullNameField}
									value={picFullName}
									onChange={(e) => setPicFullName(e.target.value)}
									placeholder="Enter full name"
									disabled={updateKitMutation.isPending}
									className="rounded-none"
								/>
							</Field>
							<Field orientation="vertical">
								<FieldLabel htmlFor={picContactNumberField}>
									PIC Contact Number
								</FieldLabel>
								<Input
									id={picContactNumberField}
									type="tel"
									value={picContactNumber}
									onChange={(e) => setPicContactNumber(e.target.value)}
									placeholder="Enter contact number"
									disabled={updateKitMutation.isPending}
									className="rounded-none"
								/>
							</Field>
							<Field orientation="vertical">
								<FieldLabel htmlFor={picEmailField}>
									PIC Email Address
								</FieldLabel>
								<Input
									id={picEmailField}
									type="email"
									value={picEmail}
									onChange={(e) => setPicEmail(e.target.value)}
									placeholder="Enter email address"
									disabled={updateKitMutation.isPending}
									className="rounded-none"
								/>
							</Field>
						</div>
						<Field orientation="vertical">
							<FieldLabel htmlFor={specialRequirementsField}>
								Special Requirements
							</FieldLabel>
							<Textarea
								id={specialRequirementsField}
								value={specialRequirements}
								onChange={(e) => setSpecialRequirements(e.target.value)}
								placeholder="Enter any special requirements..."
								disabled={updateKitMutation.isPending}
								className="rounded-none min-h-[80px]"
							/>
						</Field>

						<FieldSeparator />

						{/* Payment Information */}
						<p className="text-sm font-medium">Payment Information</p>
						<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
							<Field orientation="vertical">
								<FieldLabel htmlFor={paymentStatusField}>
									Payment Status
								</FieldLabel>
								<Select
									value={paymentStatus}
									onValueChange={setPaymentStatus}
									disabled={updateKitMutation.isPending}
								>
									<SelectTrigger
										id={paymentStatusField}
										className="rounded-none"
									>
										<SelectValue placeholder="Select status" />
									</SelectTrigger>
									<SelectContent className="rounded-none">
										<SelectItem value="unpaid">Unpaid</SelectItem>
										<SelectItem value="paid">Paid</SelectItem>
										<SelectItem value="waived">Waived</SelectItem>
										<SelectItem value="sponsored">Sponsored</SelectItem>
									</SelectContent>
								</Select>
							</Field>
							<Field orientation="vertical">
								<FieldLabel htmlFor={amountPaidField}>Amount Paid</FieldLabel>
								<Input
									id={amountPaidField}
									type="number"
									value={amountPaid}
									onChange={(e) => setAmountPaid(e.target.value)}
									placeholder="0.00"
									disabled={updateKitMutation.isPending}
									className="rounded-none"
								/>
							</Field>
							<Field orientation="vertical">
								<FieldLabel htmlFor={paymentNoteField}>Payment Note</FieldLabel>
								<Textarea
									id={paymentNoteField}
									value={paymentNote}
									onChange={(e) => setPaymentNote(e.target.value)}
									placeholder="Any payment notes..."
									disabled={updateKitMutation.isPending}
									className="rounded-none min-h-[80px]"
								/>
							</Field>
						</div>

						<FieldSeparator />

						{/* Buttons */}
						<div className="flex justify-end gap-2">
							<Button
								type="button"
								variant="outline"
								onClick={onClose}
								disabled={updateKitMutation.isPending}
							>
								Cancel
							</Button>
							<Button type="submit" disabled={updateKitMutation.isPending}>
								{updateKitMutation.isPending ? "Saving..." : "Save Changes"}
							</Button>
						</div>
					</FieldGroup>
				</FieldSet>
			</form>
		</section>
	);
}
