"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useId, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	Field,
	FieldDescription,
	FieldGroup,
	FieldLabel,
	FieldSeparator,
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
import type { EventVendor } from "@/lib/api/event-vendor";
import { getEventById } from "@/lib/api/event";
import { updateExhibitorKit } from "@/lib/api/exhibitor-kit";

export interface ManageKitsInfoFormProps {
	vendor: EventVendor;
	onClose?: () => void;
}

export function ManageKitsInfoForm({ vendor }: ManageKitsInfoFormProps) {
	const params = useParams();
	const eventId = Number(params.event_id);
	const kit = vendor.exhibitor_kit;
	const kitId = kit?.id;

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
	const countryField = useId();
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
	const [country, setCountry] = useState(kit?.country || "");
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

	const { data: event } = useQuery({
		queryKey: ["event", eventId],
		queryFn: () => getEventById(eventId.toString()),
	});

	const boothTypeOptions = useMemo(() => {
		const defaults = [
			{ value: "shell_scheme", label: "Shell Scheme" },
			{ value: "raw_space", label: "Raw Space" },
		];
		const customTypes = event?.booth_types || [];
		for (const type of customTypes) {
			if (!defaults.some((o) => o.value === type)) {
				defaults.push({
					value: type,
					label: type
						.split("_")
						.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
						.join(" "),
				});
			}
		}
		return defaults;
	}, [event?.booth_types]);

	const updateKitMutation = useMutation({
		mutationFn: (data: Parameters<typeof updateExhibitorKit>[2]) => {
			if (!kitId) {
				throw new Error("No exhibitor kit found");
			}

			return updateExhibitorKit(eventId, kitId, data);
		},
		onSuccess: () => {
			toast.success("Exhibitor kit updated successfully!");
			queryClient.invalidateQueries({
				queryKey: ["event", eventId.toString(), "vendors"],
			});
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
			booth_type: boothType || undefined,
			booth_dimensions: boothDimensions || undefined,
			side_wall_left_required: sideWallLeftRequired,
			side_wall_right_required: sideWallRightRequired,
			name_on_fascia: nameOnFascia || undefined,
			fascia_upgrade_required: fasciaUpgradeRequired,
			company_name: companyName || undefined,
			company_address: companyAddress || undefined,
			country: country || undefined,
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
		<section className="w-full border border-dashed p-4">
			<form onSubmit={handleSubmit}>
				<FieldGroup className="gap-3 md:gap-4">
					{/* Booth Information */}
					<p className="font-medium text-xs md:text-sm">Booth Information</p>
					<div className="grid grid-cols-2 items-start gap-3 md:grid-cols-4 md:gap-4">
						<Field orientation="vertical">
							<FieldLabel
								htmlFor={boothNumberField}
								className="text-xs md:text-sm"
							>
								Booth Number
							</FieldLabel>
							<Input
								id={boothNumberField}
								value={boothNumber}
								onChange={(e) => setBoothNumber(e.target.value)}
								placeholder="e.g., A-101"
								disabled={updateKitMutation.isPending}
								className="rounded-none text-sm"
							/>
						</Field>
						<Field orientation="vertical">
							<FieldLabel
								htmlFor={boothTypeField}
								className="text-xs md:text-sm"
							>
								Booth Type
							</FieldLabel>
							<Select
								value={boothType}
								onValueChange={setBoothType}
								disabled={updateKitMutation.isPending}
							>
								<SelectTrigger
									id={boothTypeField}
									className="rounded-none text-sm"
								>
									<SelectValue placeholder="Select type" />
								</SelectTrigger>
								<SelectContent className="rounded-none">
									{boothTypeOptions.map((option) => (
										<SelectItem key={option.value} value={option.value}>
											{option.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</Field>
						<Field orientation="vertical">
							<FieldLabel
								htmlFor={boothDimensionsField}
								className="text-xs md:text-sm"
							>
								Dimensions
							</FieldLabel>
							<Input
								id={boothDimensionsField}
								value={boothDimensions}
								onChange={(e) => setBoothDimensions(e.target.value)}
								placeholder="e.g., 3m x 3m"
								disabled={updateKitMutation.isPending}
								className="rounded-none text-sm"
							/>
						</Field>
						<Field orientation="vertical">
							<FieldLabel className="text-xs md:text-sm">Side Walls</FieldLabel>
							<div className="flex h-9 items-center gap-3 rounded-none border border-dashed bg-accent px-2 py-2 md:gap-4 md:px-3">
								<div className="flex items-center gap-1.5">
									<Switch
										checked={sideWallLeftRequired}
										onCheckedChange={setSideWallLeftRequired}
										disabled={updateKitMutation.isPending}
									/>
									<span className="text-xs md:text-sm">L</span>
								</div>
								<div className="flex items-center gap-1.5">
									<Switch
										checked={sideWallRightRequired}
										onCheckedChange={setSideWallRightRequired}
										disabled={updateKitMutation.isPending}
									/>
									<span className="text-xs md:text-sm">R</span>
								</div>
							</div>
						</Field>
					</div>

					<FieldSeparator />

					{/* Fascia & Company Information */}
					<p className="font-medium text-xs md:text-sm">Fascia & Company</p>
					<div className="grid grid-cols-2 items-start gap-3 md:grid-cols-4 md:gap-4">
						<Field orientation="vertical">
							<FieldLabel
								htmlFor={nameOnFasciaField}
								className="text-xs md:text-sm"
							>
								Name on Fascia
							</FieldLabel>
							<Input
								id={nameOnFasciaField}
								value={nameOnFascia}
								onChange={(e) => setNameOnFascia(e.target.value)}
								placeholder="Max 30 chars"
								maxLength={30}
								disabled={updateKitMutation.isPending}
								className="rounded-none text-sm"
							/>
							<FieldDescription className="text-xs">
								{nameOnFascia.length}/30
							</FieldDescription>
						</Field>
						<Field orientation="vertical">
							<FieldLabel
								htmlFor={companyNameField}
								className="text-xs md:text-sm"
							>
								Company Name
							</FieldLabel>
							<Input
								id={companyNameField}
								value={companyName}
								onChange={(e) => setCompanyName(e.target.value)}
								placeholder="Company name"
								disabled={updateKitMutation.isPending}
								className="rounded-none text-sm"
							/>
						</Field>
						<Field orientation="vertical">
							<FieldLabel
								htmlFor={companyAddressField}
								className="text-xs md:text-sm"
							>
								Company Address
							</FieldLabel>
							<Input
								id={companyAddressField}
								value={companyAddress}
								onChange={(e) => setCompanyAddress(e.target.value)}
								placeholder="Address"
								disabled={updateKitMutation.isPending}
								className="rounded-none text-sm"
							/>
						</Field>
						<Field orientation="vertical">
							<FieldLabel className="text-xs md:text-sm">
								Fascia Upgrade
							</FieldLabel>
							<div className="flex h-9 items-center gap-2 rounded-none border border-dashed bg-accent px-2 py-2 md:px-3">
								<Switch
									checked={fasciaUpgradeRequired}
									onCheckedChange={setFasciaUpgradeRequired}
									disabled={updateKitMutation.isPending}
								/>
								<span className="text-xs md:text-sm">
									{fasciaUpgradeRequired ? "Yes" : "No"}
								</span>
							</div>
						</Field>
					</div>

					<FieldSeparator />

					{/* PIC Information */}
					<p className="font-medium text-xs md:text-sm">
						Person In Charge (PIC)
					</p>
					<div className="grid grid-cols-1 gap-3 sm:grid-cols-4 md:gap-4">
						<Field orientation="vertical">
							<FieldLabel
								htmlFor={picFullNameField}
								className="text-xs md:text-sm"
							>
								Full Name
							</FieldLabel>
							<Input
								id={picFullNameField}
								value={picFullName}
								onChange={(e) => setPicFullName(e.target.value)}
								placeholder="Full name"
								disabled={updateKitMutation.isPending}
								className="rounded-none text-sm"
							/>
						</Field>
						<Field orientation="vertical">
							<FieldLabel
								htmlFor={picContactNumberField}
								className="text-xs md:text-sm"
							>
								Contact Number
							</FieldLabel>
							<Input
								id={picContactNumberField}
								type="tel"
								value={picContactNumber}
								onChange={(e) => setPicContactNumber(e.target.value)}
								placeholder="Phone number"
								disabled={updateKitMutation.isPending}
								className="rounded-none text-sm"
							/>
						</Field>
						<Field orientation="vertical">
							<FieldLabel
								htmlFor={picEmailField}
								className="text-xs md:text-sm"
							>
								Email
							</FieldLabel>
							<Input
								id={picEmailField}
								type="email"
								value={picEmail}
								onChange={(e) => setPicEmail(e.target.value)}
								placeholder="Email address"
								disabled={updateKitMutation.isPending}
								className="rounded-none text-sm"
							/>
						</Field>
						<Field orientation="vertical">
							<FieldLabel htmlFor={countryField} className="text-xs md:text-sm">
								Country
							</FieldLabel>
							<Input
								id={countryField}
								value={country}
								onChange={(e) => setCountry(e.target.value)}
								placeholder="Country"
								disabled={updateKitMutation.isPending}
								className="rounded-none text-sm"
							/>
						</Field>
					</div>
					<Field orientation="vertical">
						<FieldLabel
							htmlFor={specialRequirementsField}
							className="text-xs md:text-sm"
						>
							Special Requirements
						</FieldLabel>
						<Textarea
							id={specialRequirementsField}
							value={specialRequirements}
							onChange={(e) => setSpecialRequirements(e.target.value)}
							placeholder="Any special requirements..."
							disabled={updateKitMutation.isPending}
							className="min-h-[60px] rounded-none text-sm md:min-h-[80px]"
						/>
					</Field>
					<FieldSeparator />

					{/* Payment Information */}
					<p className="font-medium text-xs md:text-sm">Payment</p>
					<div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4">
						<Field orientation="vertical">
							<FieldLabel
								htmlFor={paymentStatusField}
								className="text-xs md:text-sm"
							>
								Status
							</FieldLabel>
							<Select
								value={paymentStatus}
								onValueChange={setPaymentStatus}
								disabled={updateKitMutation.isPending}
							>
								<SelectTrigger
									id={paymentStatusField}
									className="rounded-none text-sm"
								>
									<SelectValue placeholder="Status" />
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
							<FieldLabel
								htmlFor={amountPaidField}
								className="text-xs md:text-sm"
							>
								Amount Paid
							</FieldLabel>
							<Input
								id={amountPaidField}
								type="number"
								value={amountPaid}
								onChange={(e) => setAmountPaid(e.target.value)}
								placeholder="0.00"
								disabled={updateKitMutation.isPending}
								className="rounded-none text-sm"
							/>
						</Field>
						<Field orientation="vertical" className="col-span-2 sm:col-span-1">
							<FieldLabel
								htmlFor={paymentNoteField}
								className="text-xs md:text-sm"
							>
								Note
							</FieldLabel>
							<Textarea
								id={paymentNoteField}
								value={paymentNote}
								onChange={(e) => setPaymentNote(e.target.value)}
								placeholder="Payment notes..."
								disabled={updateKitMutation.isPending}
								className="min-h-[60px] rounded-none text-sm md:min-h-[80px]"
							/>
						</Field>
					</div>

					<FieldSeparator />

					{/* Buttons */}
					<div className="flex justify-end">
						<Button
							type="submit"
							disabled={updateKitMutation.isPending}
							className="w-full sm:w-auto"
						>
							{updateKitMutation.isPending ? "Saving..." : "Save Changes"}
						</Button>
					</div>
				</FieldGroup>
			</form>
		</section>
	);
}
