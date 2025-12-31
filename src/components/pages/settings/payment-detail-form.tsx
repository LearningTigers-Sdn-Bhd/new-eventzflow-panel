"use client";

import { useForm } from "@tanstack/react-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import z from "zod";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import {
	createPaymentDetail,
	deletePaymentDetail,
	getPaymentDetail,
	updatePaymentDetail,
} from "@/lib/api/payment-detail";

export function PaymentDetailForm() {
	const queryClient = useQueryClient();
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

	const {
		data: paymentDetail,
		isLoading,
		refetch,
	} = useQuery({
		queryKey: ["payment-detail"],
		queryFn: getPaymentDetail,
	});

	const createMutation = useMutation({
		mutationFn: createPaymentDetail,
		onSuccess: () => {
			toast.success("Payment details saved successfully");
			refetch();
		},
		onError: (error) => {
			toast.error(error.message || "Failed to save payment details");
		},
	});

	const updateMutation = useMutation({
		mutationFn: updatePaymentDetail,
		onSuccess: () => {
			toast.success("Payment details updated successfully");
			refetch();
		},
		onError: (error) => {
			toast.error(error.message || "Failed to update payment details");
		},
	});

	const deleteMutation = useMutation({
		mutationFn: deletePaymentDetail,
		onSuccess: () => {
			toast.success("Payment details deleted successfully");
			queryClient.setQueryData(["payment-detail"], null);
			form.reset({
				bank_name: "",
				account_number: "",
				account_name: "",
			});
			setDeleteDialogOpen(false);
		},
		onError: (error) => {
			toast.error(error.message || "Failed to delete payment details");
		},
	});

	const form = useForm({
		defaultValues: {
			bank_name: "",
			account_number: "",
			account_name: "",
		},
		validators: {
			onSubmit: z.object({
				bank_name: z.string().min(1, "Bank name is required"),
				account_number: z.string().min(1, "Account number is required"),
				account_name: z.string().min(1, "Account name is required"),
			}),
		},
		onSubmit: async ({ value }) => {
			if (paymentDetail) {
				await updateMutation.mutateAsync({
					bank_name: value.bank_name.trim(),
					account_number: value.account_number.trim(),
					account_name: value.account_name.trim(),
				});
			} else {
				await createMutation.mutateAsync({
					bank_name: value.bank_name.trim(),
					account_number: value.account_number.trim(),
					account_name: value.account_name.trim(),
				});
			}
		},
	});

	useEffect(() => {
		if (paymentDetail) {
			form.reset({
				bank_name: paymentDetail.bank_name || "",
				account_number: paymentDetail.account_number || "",
				account_name: paymentDetail.account_name || "",
			});
		}
	}, [paymentDetail, form]);

	if (isLoading) {
		return (
			<div className="flex items-center justify-center py-8">
				<Spinner className="h-6 w-6" />
			</div>
		);
	}

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				form.handleSubmit();
			}}
			className="flex flex-col justify-between space-y-4 md:min-h-[320px]"
		>
			<div className="space-y-4">
				<form.Field
					name="bank_name"
					validators={{
						onChange: ({ value }) => {
							if (!value.trim()) {
								return "Bank name is required";
							}
							return undefined;
						},
					}}
				>
					{(field) => (
						<Field data-invalid={field.state.meta.errors.length > 0}>
							<FieldLabel htmlFor={field.name}>Bank Name</FieldLabel>
							<Input
								id={field.name}
								name={field.name}
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(e) => field.handleChange(e.target.value)}
								placeholder="Enter bank name"
								className="rounded-none"
							/>
							{field.state.meta.errors.length > 0 && (
								<FieldError>{String(field.state.meta.errors[0])}</FieldError>
							)}
						</Field>
					)}
				</form.Field>

				<form.Field
					name="account_number"
					validators={{
						onChange: ({ value }) => {
							if (!value.trim()) {
								return "Account number is required";
							}
							return undefined;
						},
					}}
				>
					{(field) => (
						<Field data-invalid={field.state.meta.errors.length > 0}>
							<FieldLabel htmlFor={field.name}>Account Number</FieldLabel>
							<Input
								id={field.name}
								name={field.name}
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(e) => field.handleChange(e.target.value)}
								placeholder="Enter account number"
								className="rounded-none"
							/>
							{field.state.meta.errors.length > 0 && (
								<FieldError>{String(field.state.meta.errors[0])}</FieldError>
							)}
						</Field>
					)}
				</form.Field>

				<form.Field
					name="account_name"
					validators={{
						onChange: ({ value }) => {
							if (!value.trim()) {
								return "Account name is required";
							}
							return undefined;
						},
					}}
				>
					{(field) => (
						<Field data-invalid={field.state.meta.errors.length > 0}>
							<FieldLabel htmlFor={field.name}>Account Name</FieldLabel>
							<Input
								id={field.name}
								name={field.name}
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(e) => field.handleChange(e.target.value)}
								placeholder="Enter account holder name"
								className="rounded-none"
							/>
							{field.state.meta.errors.length > 0 && (
								<FieldError>{String(field.state.meta.errors[0])}</FieldError>
							)}
						</Field>
					)}
				</form.Field>
			</div>

			<div className="flex justify-between">
				{paymentDetail && (
					<Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
						<DialogTrigger asChild>
							<Button
								type="button"
								variant="destructive"
								className="rounded-none"
							>
								<Trash2 className="mr-2 h-4 w-4" />
								Delete
							</Button>
						</DialogTrigger>
						<DialogContent className="rounded-none">
							<DialogHeader>
								<DialogTitle>Delete Payment Details</DialogTitle>
								<DialogDescription>
									Are you sure you want to delete your payment details? This
									action cannot be undone.
								</DialogDescription>
							</DialogHeader>
							<DialogFooter>
								<DialogClose asChild>
									<Button variant="outline" className="rounded-none">
										Cancel
									</Button>
								</DialogClose>
								<Button
									variant="destructive"
									onClick={() => deleteMutation.mutate()}
									disabled={deleteMutation.isPending}
									className="rounded-none"
								>
									{deleteMutation.isPending ? (
										<Spinner className="h-4 w-4" />
									) : (
										"Delete"
									)}
								</Button>
							</DialogFooter>
						</DialogContent>
					</Dialog>
				)}
				<div className={paymentDetail ? "" : "ml-auto"}>
					<form.Subscribe>
						{(state) => (
							<Button
								type="submit"
								disabled={!state.canSubmit || state.isSubmitting}
								className="min-w-[100px] rounded-none"
							>
								{state.isSubmitting ? (
									<Spinner className="h-4 w-4" />
								) : paymentDetail ? (
									"Update"
								) : (
									"Save"
								)}
							</Button>
						)}
					</form.Subscribe>
				</div>
			</div>
		</form>
	);
}
