"use client";

import {
	useMutation,
	useQueries,
	useQuery,
	useQueryClient,
} from "@tanstack/react-query";
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
import { getPlan, getPlans } from "@/lib/api/plan";
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
	const [planObjectId, setPlanObjectId] = useState(
		passBundle?.planObject?.id ? String(passBundle.planObject.id) : "",
	);

	const formsQuery = useQuery({
		queryKey: ["event", eventId, "registration-forms"],
		queryFn: () => getEventRegistrationForms({ eventId }),
	});

	const ticketTypesQuery = useQuery({
		queryKey: ["event", eventId, "ticket-types"],
		queryFn: () => getEventTicketTypes({ eventId }),
	});

	const plansQuery = useQuery({
		queryKey: ["event", eventId, "plans"],
		queryFn: () => getPlans(eventId),
	});

	// The plans index endpoint doesn't include plan_objects (only #show does),
	// so fetch each plan's detail to read its table objects.
	const planDetailQueries = useQueries({
		queries: (plansQuery.data ?? []).map((plan) => ({
			queryKey: ["plan", String(plan.id)],
			queryFn: () => getPlan(String(plan.id)),
			enabled: plansQuery.isSuccess,
		})),
	});

	// Tables only — a bundle can only auto-assign tickets to a table object,
	// not walls/doors/stage/label/floor.
	const tableOptions = planDetailQueries.flatMap((query) => {
		const plan = query.data;
		if (!plan) return [];
		return (plan.plan_objects ?? [])
			.filter((object) => object.object_type === "table")
			.map((table) => ({
				id: table.id,
				label: `${plan.name} — ${table.label ?? `Table ${table.id}`}`,
			}));
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
				plan_object_id: planObjectId ? Number.parseInt(planObjectId, 10) : null,
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

				{tableOptions.length > 0 && (
					<div className="space-y-2">
						<Label>Table (optional)</Label>
						<Select
							value={planObjectId || "none"}
							onValueChange={(value) =>
								setPlanObjectId(value === "none" ? "" : value)
							}
						>
							<SelectTrigger className="w-full rounded-none">
								<SelectValue placeholder="No table — assigned manually" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="none">No table — assigned manually</SelectItem>
								{tableOptions.map((table) => (
									<SelectItem key={table.id} value={String(table.id)}>
										{table.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						<p className="text-muted-foreground text-xs">
							Every ticket registered through this bundle link is auto-assigned
							to this table.
						</p>
					</div>
				)}

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
