"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	createPassBundle,
	type PassBundle,
	type PassBundlePaymentMode,
	type PassBundlePaymentStatus,
	type PassBundleStatus,
	updatePassBundle,
} from "@/lib/api/pass-bundle";
import { getEventRegistrationForms } from "@/lib/api/registration-form";
import { getEventTicketTypes } from "@/lib/api/ticket-type";
import {
	passBundleStatusLabel,
	paymentModeLabel,
	paymentStatusLabel,
} from "./pass-bundle-labels";

interface PassBundleFormProps {
	eventId: string;
	passBundle?: PassBundle;
	onClose: () => void;
}

export function PassBundleForm({
	eventId,
	passBundle,
	onClose,
}: PassBundleFormProps) {
	const queryClient = useQueryClient();

	const [name, setName] = useState(passBundle?.name ?? "");
	const [passLimit, setPassLimit] = useState(
		String(passBundle?.passLimit ?? 10),
	);
	const [registrationFormId, setRegistrationFormId] = useState(
		passBundle?.registrationForm.id
			? String(passBundle.registrationForm.id)
			: "",
	);
	const [ticketTypeId, setTicketTypeId] = useState(
		passBundle?.ticketType.id ? String(passBundle.ticketType.id) : "",
	);
	const [paymentMode, setPaymentMode] = useState<PassBundlePaymentMode>(
		passBundle?.paymentMode ?? "free",
	);
	const [paymentStatus, setPaymentStatus] = useState<PassBundlePaymentStatus>(
		passBundle?.paymentStatus ?? "not_required",
	);
	const [status, setStatus] = useState<PassBundleStatus>(
		passBundle?.status ?? "active",
	);
	const [expiresAt, setExpiresAt] = useState(
		passBundle?.expiresAt?.slice(0, 10) ?? "",
	);

	const formsQuery = useQuery({
		queryKey: ["event", eventId, "registration-forms"],
		queryFn: () => getEventRegistrationForms({ eventId }),
	});

	const ticketTypesQuery = useQuery({
		queryKey: ["event", eventId, "ticket-types"],
		queryFn: () => getEventTicketTypes({ eventId }),
	});

	useEffect(() => {
		if (paymentMode === "free") {
			setPaymentStatus("not_required");
		}
		if (paymentMode === "pay_offline" && paymentStatus === "not_required") {
			setPaymentStatus("unpaid");
		}
	}, [paymentMode, paymentStatus]);

	const mutation = useMutation({
		mutationFn: () => {
			const payload = {
				eventId,
				name,
				pass_limit: Number.parseInt(passLimit, 10),
				registration_form_id: Number.parseInt(registrationFormId, 10),
				ticket_type_id: Number.parseInt(ticketTypeId, 10),
				payment_mode: paymentMode,
				payment_status: paymentStatus,
				status,
				expires_at: expiresAt ? new Date(expiresAt).toISOString() : null,
			};

			if (passBundle) {
				return updatePassBundle({
					...payload,
					passBundleId: passBundle.id,
				});
			}

			return createPassBundle(payload);
		},
		onSuccess: () => {
			toast.success(passBundle ? "Bundle Pass updated" : "Bundle Pass created");
			queryClient.invalidateQueries({
				queryKey: ["event", eventId, "bundle-passes"],
			});
			onClose();
		},
		onError: (error: Error) => {
			toast.error(error.message || "Unable to save Bundle Pass");
		},
	});

	const parsedLimit = Number.parseInt(passLimit, 10);
	const canSubmit =
		name.trim().length > 0 &&
		Number.isInteger(parsedLimit) &&
		parsedLimit >= 0 &&
		registrationFormId.length > 0 &&
		ticketTypeId.length > 0;

	return (
		<div className="h-full w-full p-0 md:p-4">
			<form
				className="space-y-5"
				onSubmit={(event) => {
					event.preventDefault();
					if (canSubmit) mutation.mutate();
				}}
			>
				<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
					<div className="space-y-2 md:col-span-2">
						<Label htmlFor="bundle-owner">Bundle Owner</Label>
						<Input
							id="bundle-owner"
							value={name}
							onChange={(event) => setName(event.target.value)}
							placeholder="STB"
							className="rounded-none"
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="pass-limit">Pass Limit</Label>
						<Input
							id="pass-limit"
							type="number"
							min={0}
							value={passLimit}
							onChange={(event) => setPassLimit(event.target.value)}
							className="rounded-none"
						/>
					</div>
				</div>

				<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
					<div className="space-y-2">
						<Label>Registration Form</Label>
						<Select
							value={registrationFormId}
							onValueChange={setRegistrationFormId}
						>
							<SelectTrigger className="w-full rounded-none">
								<SelectValue placeholder="Select registration form" />
							</SelectTrigger>
							<SelectContent>
								{formsQuery.data?.map((form) => (
									<SelectItem key={form.id} value={String(form.id)}>
										{form.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
					<div className="space-y-2">
						<Label>Ticket Type</Label>
						<Select value={ticketTypeId} onValueChange={setTicketTypeId}>
							<SelectTrigger className="w-full rounded-none">
								<SelectValue placeholder="Select ticket type" />
							</SelectTrigger>
							<SelectContent>
								{ticketTypesQuery.data?.map((ticketType) => (
									<SelectItem key={ticketType.id} value={String(ticketType.id)}>
										{ticketType.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				</div>

				<div className="grid gap-4 md:grid-cols-2">
					<div className="space-y-2">
						<Label>Payment Mode</Label>
						<Select
							value={paymentMode}
							onValueChange={(value) =>
								setPaymentMode(value as PassBundlePaymentMode)
							}
						>
							<SelectTrigger className="w-full rounded-none">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{Object.entries(paymentModeLabel).map(([value, label]) => (
									<SelectItem key={value} value={value}>
										{label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div className="space-y-2">
						<Label>Payment Status</Label>
						<Select
							value={paymentStatus}
							onValueChange={(value) =>
								setPaymentStatus(value as PassBundlePaymentStatus)
							}
						>
							<SelectTrigger className="w-full rounded-none">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{Object.entries(paymentStatusLabel).map(([value, label]) => (
									<SelectItem key={value} value={value}>
										{label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				</div>

				<div className="grid gap-4 md:grid-cols-2">
					<div className="space-y-2">
						<Label>Status</Label>
						<Select
							value={status}
							onValueChange={(value) => setStatus(value as PassBundleStatus)}
						>
							<SelectTrigger className="w-full rounded-none">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{Object.entries(passBundleStatusLabel).map(([value, label]) => (
									<SelectItem key={value} value={value}>
										{label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div className="space-y-2">
						<Label htmlFor="expires-at">Expiry Date</Label>
						<Input
							id="expires-at"
							type="date"
							value={expiresAt}
							onChange={(event) => setExpiresAt(event.target.value)}
							className="rounded-none"
						/>
					</div>
				</div>

				<div className="flex w-full flex-col gap-2 md:flex-row md:justify-end">
					<Button
						type="button"
						variant="outline"
						onClick={onClose}
						className="rounded-none py-6 md:py-4"
					>
						Cancel
					</Button>
					<Button
						type="submit"
						disabled={!canSubmit || mutation.isPending}
						className="rounded-none py-6 md:py-4"
					>
						{passBundle ? "Save Bundle Pass" : "Create Bundle Pass"}
					</Button>
				</div>
			</form>
		</div>
	);
}
