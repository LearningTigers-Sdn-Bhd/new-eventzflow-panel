"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	FileText,
	Loader2,
	Mail,
	Pencil,
	Phone,
	Save,
	Upload,
	User2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { ErrorState, LoadingState } from "@/components/data-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/auth/use-auth";
import { useDialog } from "@/hooks/use-dialog";
import { formatBytes, useFileUpload } from "@/hooks/use-file-upload";
import {
	getContractor,
	updateContractorProfile,
	uploadContractorGuidelinesPdf,
} from "@/lib/api/contractor";
import { cn } from "@/lib/utils";
import { ContractorEditProfileContent } from "./contractor-edit-profile-dialog";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

interface ContractorProfileViewProps {
	eventId: string;
}

export function ContractorProfileView({ eventId }: ContractorProfileViewProps) {
	const { user } = useAuth();
	const { openDialog } = useDialog();
	const queryClient = useQueryClient();
	const [isUploading, setIsUploading] = useState(false);
	const [standardPackageInfo, setStandardPackageInfo] = useState<string>("");
	const [isStandardPackageInitialized, setIsStandardPackageInitialized] =
		useState(false);
	const [isEditingStandardPackage, setIsEditingStandardPackage] =
		useState(false);

	const {
		data: contractor,
		isLoading,
		error,
	} = useQuery({
		queryKey: ["contractor", user?.id],
		queryFn: () => getContractor(user!.id),
		enabled: !!user?.id,
	});

	const uploadPdfMutation = useMutation({
		mutationFn: (file: File) =>
			uploadContractorGuidelinesPdf(
				contractor!.exhibition_contractor_profile!.id,
				file,
			),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["contractor", user?.id] });
			toast.success("Guidelines PDF uploaded successfully");
			setIsUploading(false);
			clearFiles();
		},
		onError: (error: Error) => {
			toast.error("Failed to upload PDF", {
				description: error.message,
			});
			setIsUploading(false);
		},
	});

	const updateStandardPackageMutation = useMutation({
		mutationFn: (standardPackageInfo: string) =>
			updateContractorProfile(contractor!.exhibition_contractor_profile!.id, {
				standard_package_info: standardPackageInfo,
			}),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["contractor", user?.id] });
			toast.success("Standard package information saved successfully");
			setIsEditingStandardPackage(false);
		},
		onError: (error: Error) => {
			toast.error("Failed to save standard package information", {
				description: error.message,
			});
		},
	});

	// Initialize standard package info when contractor data loads
	if (
		contractor?.exhibition_contractor_profile?.standard_package_info &&
		!isStandardPackageInitialized
	) {
		setStandardPackageInfo(
			contractor.exhibition_contractor_profile.standard_package_info,
		);
		setIsStandardPackageInitialized(true);
	}

	const [
		{ files, isDragging, errors: fileErrors },
		{
			handleDragEnter,
			handleDragLeave,
			handleDragOver,
			handleDrop,
			openFileDialog,
			getInputProps,
			clearFiles,
		},
	] = useFileUpload({
		maxFiles: 1,
		maxSize: MAX_FILE_SIZE,
		accept: ".pdf,application/pdf",
		multiple: false,
		onFilesAdded: (addedFiles) => {
			if (addedFiles.length > 0 && addedFiles[0].file instanceof File) {
				setIsUploading(true);
				uploadPdfMutation.mutate(addedFiles[0].file as File);
			}
		},
		onError: (errors) => {
			toast.error(errors[0]);
		},
	});

	if (isLoading) {
		return (
			<LoadingState
				title="Loading contractor profile..."
				description="Please wait while we fetch your profile information..."
			/>
		);
	}

	if (error) {
		return (
			<ErrorState
				title="Failed to load profile"
				description="We couldn't load your contractor profile. Please try again."
				action={<Button onClick={() => window.location.reload()}>Retry</Button>}
			/>
		);
	}

	if (!contractor) {
		return (
			<ErrorState
				title="Profile not found"
				description="Your contractor profile doesn't exist."
			/>
		);
	}

	const profile = contractor.exhibition_contractor_profile;

	const handleEditProfile = () => {
		openDialog({
			component: ContractorEditProfileContent,
			props: {
				contractor,
			},
			config: {
				title: "Edit Profile",
				description: "Update your contact details",
				size: "md",
			},
		});
	};

	return (
		<section className="space-y-6 border-t border-dashed">
			<div className="flex flex-col gap-3 border-b border-dashed p-4 sm:flex-row sm:items-start sm:justify-between">
				<div className="space-y-1">
					<p className="font-semibold text-muted-foreground text-xs uppercase tracking-wide">
						Contractor Profile
					</p>
					<h2 className="font-semibold text-2xl tracking-tight">
						{contractor.full_name}
					</h2>
					<p className="text-muted-foreground text-sm">
						Exhibition contractor profile and company information
					</p>
				</div>
				<div className="flex items-center gap-2">
					<Badge
						variant="outline"
						className={`rounded-none px-2 py-0.5 font-medium text-xs capitalize ${
							contractor.status === "active"
								? "border-green-500 text-green-600"
								: "border-red-500 text-red-600"
						}`}
					>
						{contractor.status}
					</Badge>
					<Button
						variant="outline"
						size="sm"
						onClick={handleEditProfile}
						className="rounded-none"
					>
						<Pencil className="mr-2 h-4 w-4" />
						Edit Profile
					</Button>
				</div>
			</div>

			<div className="p-4">
				<div className="border bg-background/60 p-4">
					<div className="grid gap-8 md:grid-cols-2">
						<div className="space-y-3">
							<p className="font-medium text-muted-foreground uppercase">
								Account Information
							</p>
							<div className="space-y-3">
								<div className="flex items-start gap-3">
									<Mail className="mt-0.5 h-4 w-4 text-muted-foreground" />
									<div>
										<p className="font-medium text-muted-foreground text-xs uppercase">
											Email
										</p>
										<p>{contractor.email}</p>
									</div>
								</div>
								<div className="flex items-start gap-3">
									<Phone className="mt-0.5 h-4 w-4 text-muted-foreground" />
									<div>
										<p className="font-medium text-muted-foreground text-xs uppercase">
											Phone
										</p>
										{contractor.phone ? (
											<p>{contractor.phone}</p>
										) : (
											<p className="text-muted-foreground/60 italic">
												Not provided
											</p>
										)}
									</div>
								</div>
							</div>
						</div>

						{profile && (
							<div className="space-y-3 border-t pt-4 md:border-t-0 md:border-l md:pt-0 md:pl-8">
								<p className="font-medium text-muted-foreground uppercase">
									Contact Details
								</p>
								<div className="space-y-3">
									<div className="flex items-start gap-3">
										<User2 className="mt-0.5 h-4 w-4 text-muted-foreground" />
										<div>
											<p className="font-medium text-muted-foreground text-xs uppercase">
												Contact Person
											</p>
											<p>{profile.contact_person || "-"}</p>
										</div>
									</div>
									<div className="flex items-start gap-3">
										<Mail className="mt-0.5 h-4 w-4 text-muted-foreground" />
										<div>
											<p className="font-medium text-muted-foreground text-xs uppercase">
												Contact Email
											</p>
											<p>{profile.contact_email || "-"}</p>
										</div>
									</div>
									<div className="flex items-start gap-3">
										<Phone className="mt-0.5 h-4 w-4 text-muted-foreground" />
										<div>
											<p className="font-medium text-muted-foreground text-xs uppercase">
												Contact Phone
											</p>
											<p>{profile.contact_phone || "-"}</p>
										</div>
									</div>
								</div>
							</div>
						)}
					</div>

					{/* Guidelines PDF Section */}
					<div className="mt-6 border-t pt-4">
						<p className="mb-2 font-medium text-muted-foreground uppercase">
							Guidelines & Rules Document
						</p>
						<p className="mb-3 text-muted-foreground">
							Upload a PDF containing rules, terms & conditions, and guidelines
							for exhibitors. This document will be visible to all exhibitors
							assigned to your events.
						</p>

						{profile?.guidelines_pdf_url ? (
							<div className="space-y-3">
								{/* Current PDF Display */}
								<div className="flex items-center gap-4 border bg-muted/30 p-4">
									<div className="flex h-14 w-14 items-center justify-center bg-muted">
										<FileText className="h-8 w-8 text-muted-foreground" />
									</div>
									<div className="min-w-0 flex-1">
										<p className="truncate font-medium text-sm">
											{profile.guidelines_pdf_filename || "Guidelines PDF"}
										</p>
										<p className="text-muted-foreground text-xs">
											Exhibitor rules, terms & conditions
										</p>
									</div>
									<a
										href={profile.guidelines_pdf_url}
										target="_blank"
										rel="noopener noreferrer"
										className="inline-flex items-center gap-2 bg-primary px-4 py-2 font-medium text-primary-foreground text-sm transition-colors hover:bg-primary/90"
									>
										View PDF
									</a>
								</div>

								{/* Replace Upload Zone */}
								<div
									onClick={!isUploading ? openFileDialog : undefined}
									onDragEnter={handleDragEnter}
									onDragLeave={handleDragLeave}
									onDragOver={handleDragOver}
									onDrop={handleDrop}
									className={cn(
										"relative cursor-pointer border-2 border-dashed p-4 text-center transition-all",
										isDragging
											? "border-primary bg-primary/5"
											: "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50",
										isUploading && "pointer-events-none opacity-60",
									)}
								>
									<input
										{...getInputProps()}
										disabled={isUploading}
										className="sr-only"
									/>
									<div className="flex items-center justify-center gap-3">
										{isUploading ? (
											<Loader2 className="h-5 w-5 animate-spin text-primary" />
										) : (
											<Upload className="h-5 w-5 text-muted-foreground" />
										)}
										<p className="text-muted-foreground text-sm">
											{isUploading
												? "Uploading..."
												: "Drag & drop or click to replace PDF"}
										</p>
									</div>
								</div>
							</div>
						) : (
							/* Empty State - Upload Zone */
							<div
								onClick={!isUploading ? openFileDialog : undefined}
								onDragEnter={handleDragEnter}
								onDragLeave={handleDragLeave}
								onDragOver={handleDragOver}
								onDrop={handleDrop}
								className={cn(
									"relative cursor-pointer border-2 border-dashed p-8 text-center transition-all",
									isDragging
										? "border-primary bg-primary/5"
										: "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50",
									isUploading && "pointer-events-none opacity-60",
								)}
							>
								<input
									{...getInputProps()}
									disabled={isUploading}
									className="sr-only"
								/>
								<div className="flex flex-col items-center gap-3">
									<div
										className={cn(
											"flex h-14 w-14 items-center justify-center transition-colors",
											isDragging ? "bg-primary/10" : "bg-muted",
										)}
									>
										{isUploading ? (
											<Loader2 className="h-7 w-7 animate-spin text-primary" />
										) : (
											<Upload className="h-7 w-7 text-muted-foreground" />
										)}
									</div>
									<div className="space-y-1">
										<p className="font-medium text-sm">
											{isUploading
												? "Uploading..."
												: "Drag & drop your PDF here"}
										</p>
										<p className="text-muted-foreground text-xs">
											or click to browse
										</p>
									</div>
									<p className="text-muted-foreground/60 text-xs">
										PDF only, max {formatBytes(MAX_FILE_SIZE)}
									</p>
								</div>
							</div>
						)}

						{fileErrors.length > 0 && (
							<p className="mt-2 text-destructive text-xs">{fileErrors[0]}</p>
						)}
					</div>

					{/* Standard Package Section */}
					<div className="mt-6 border-t pt-4">
						<div className="mb-3 flex items-center justify-between">
							<div>
								<p className="font-medium text-muted-foreground uppercase">
									Standard Package Information
								</p>
								<p className="text-muted-foreground">
									Define the standard fittings included with each booth.
								</p>
							</div>
							{!isEditingStandardPackage && (
								<Button
									variant="outline"
									size="sm"
									onClick={() => setIsEditingStandardPackage(true)}
									className="rounded-none"
								>
									<Pencil className="mr-2 h-4 w-4" />
									Edit
								</Button>
							)}
						</div>

						{isEditingStandardPackage ? (
							<div className="space-y-3">
								<div className="space-y-2">
									<Label htmlFor="standard_package_info" className="text-sm">
										Standard Package Items
									</Label>
									<Textarea
										id="standard_package_info"
										value={standardPackageInfo}
										onChange={(e) => setStandardPackageInfo(e.target.value)}
										rows={8}
										className="resize-none"
									/>
								</div>

								<div className="flex justify-end gap-2">
									<Button
										variant="outline"
										size="sm"
										className="rounded-none"
										onClick={() => {
											setIsEditingStandardPackage(false);
											// Reset to original value
											if (
												contractor?.exhibition_contractor_profile
													?.standard_package_info
											) {
												setStandardPackageInfo(
													contractor.exhibition_contractor_profile
														.standard_package_info,
												);
											} else {
												setStandardPackageInfo("");
											}
										}}
										disabled={updateStandardPackageMutation.isPending}
									>
										Cancel
									</Button>
									<Button
										size="sm"
										className="rounded-none"
										onClick={() =>
											updateStandardPackageMutation.mutate(standardPackageInfo)
										}
										disabled={updateStandardPackageMutation.isPending}
									>
										{updateStandardPackageMutation.isPending ? (
											<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										) : (
											<Save className="mr-2 h-4 w-4" />
										)}
										Save
									</Button>
								</div>
							</div>
						) : (
							<div className="max-h-150 overflow-y-auto border bg-muted/30 p-4">
								{profile?.standard_package_info ? (
									<pre className="whitespace-pre-wrap font-sans text-sm">
										{profile.standard_package_info}
									</pre>
								) : (
									<p className="text-base text-muted-foreground italic">
										No standard package information defined yet. Click Edit to
										add.
									</p>
								)}
							</div>
						)}
					</div>
				</div>
			</div>
		</section>
	);
}
