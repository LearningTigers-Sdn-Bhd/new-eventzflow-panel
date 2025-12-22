"use client";

import { Upload, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { formatBytes, useFileUpload } from "@/hooks/use-file-upload";
import { cn } from "@/lib/utils";

interface PaymentReceiptUploadProps {
	value?: string | File; // URL or File object
	onChange?: (file: File | null) => void;
	className?: string;
	disabled?: boolean;
	maxSize?: number; // Default 5MB
}

export default function PaymentReceiptUpload({
	value,
	onChange,
	className,
	disabled = false,
	maxSize = 5 * 1024 * 1024, // 5MB
}: PaymentReceiptUploadProps) {
	const [previewUrl, setPreviewUrl] = useState<string | null>(null);
	const [fileType, setFileType] = useState<string | null>(null);
	const prevValueRef = useRef<string | File | undefined>(undefined);

	// Initialize file upload hook with support for images and PDFs
	const [
		{ files, isDragging, errors },
		{
			clearFiles,
			handleDragEnter,
			handleDragLeave,
			handleDragOver,
			handleDrop,
			openFileDialog,
			getInputProps,
		},
	] = useFileUpload({
		maxFiles: 1,
		maxSize,
		accept: "image/*,application/pdf",
		multiple: false,
	});

	useEffect(() => {
		const firstFile = files[0]?.file;
		if (firstFile instanceof File) {
			onChange?.(firstFile);
		}
	}, [files, onChange]);

	// Sync value prop with internal state
	useEffect(() => {
		// Skip if value hasn't changed
		if (prevValueRef.current === value) {
			return;
		}

		prevValueRef.current = value;

		if (typeof value === "string" && value) {
			setPreviewUrl(value);
			// Try to determine file type from URL
			if (value.toLowerCase().endsWith(".pdf")) {
				setFileType("pdf");
			} else {
				setFileType("image");
			}
		} else if (value instanceof File) {
			if (value.type === "application/pdf") {
				setFileType("pdf");
				setPreviewUrl(null);
			} else {
				setFileType("image");
				const preview = URL.createObjectURL(value);
				setPreviewUrl(preview);
				return () => URL.revokeObjectURL(preview);
			}
		} else if (!value && files.length === 0) {
			setPreviewUrl(null);
			setFileType(null);
		}
	}, [value, files.length]);

	// Hook's files take precedence for preview if a new file is selected
	const currentFile = files[0];
	const displayPreview = currentFile?.preview || previewUrl;
	const displayFileType =
		currentFile?.file instanceof File
			? currentFile.file.type === "application/pdf"
				? "pdf"
				: "image"
			: fileType;

	const handleRemove = () => {
		clearFiles();
		setPreviewUrl(null);
		setFileType(null);
		onChange?.(null);
	};

	return (
		<div className={cn("w-full space-y-2", className)}>
			<div
				aria-label="Payment receipt upload drop zone"
				className={cn(
					"relative flex flex-col items-center justify-center overflow-hidden rounded-lg border border-dashed transition-colors",
					isDragging
						? "border-primary bg-primary/5"
						: "border-muted-foreground/25 hover:border-muted-foreground/50",
					disabled && "pointer-events-none cursor-not-allowed opacity-60",
					displayPreview || displayFileType === "pdf" ? "h-64" : "h-40",
					"bg-muted/30",
				)}
				onClick={
					!displayPreview && displayFileType !== "pdf"
						? openFileDialog
						: undefined
				}
				onDragEnter={handleDragEnter}
				onDragLeave={handleDragLeave}
				onDragOver={handleDragOver}
				onDrop={handleDrop}
			>
				<input {...getInputProps()} disabled={disabled} className="sr-only" />

				{displayFileType === "pdf" ? (
					<div className="relative flex h-full w-full flex-col items-center justify-center p-4">
						<div className="space-y-2 text-center">
							<div className="mx-auto flex h-16 w-16 items-center justify-center rounded-lg bg-red-100">
								<svg
									className="h-8 w-8 text-red-600"
									fill="currentColor"
									viewBox="0 0 20 20"
								>
									<path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
								</svg>
							</div>
							<p className="font-medium text-sm">PDF Receipt Uploaded</p>
							{currentFile?.file instanceof File && (
								<p className="text-muted-foreground text-xs">
									{currentFile.file.name} ({formatBytes(currentFile.file.size)})
								</p>
							)}
						</div>
						<div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity hover:opacity-100">
							<Button
								type="button"
								variant="secondary"
								size="sm"
								onClick={openFileDialog}
								className="mr-2"
							>
								Change
							</Button>
							<Button
								type="button"
								variant="destructive"
								size="sm"
								onClick={(e) => {
									e.stopPropagation();
									handleRemove();
								}}
							>
								Remove
							</Button>
						</div>
					</div>
				) : displayPreview ? (
					<div className="relative h-full w-full">
						<img
							src={displayPreview}
							alt="Payment receipt preview"
							className="h-full w-full object-contain p-2"
						/>
						<div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity hover:opacity-100">
							<Button
								type="button"
								variant="secondary"
								size="sm"
								onClick={openFileDialog}
								className="mr-2"
							>
								Change
							</Button>
							<Button
								type="button"
								variant="destructive"
								size="sm"
								onClick={(e) => {
									e.stopPropagation();
									handleRemove();
								}}
							>
								Remove
							</Button>
						</div>
					</div>
				) : (
					<div className="flex flex-col items-center justify-center gap-2 p-4 text-center">
						<div
							className={cn(
								"flex h-10 w-10 items-center justify-center rounded-full bg-muted transition-colors",
								isDragging && "bg-primary/10",
							)}
						>
							<Upload className="h-5 w-5 text-muted-foreground" />
						</div>
						<div className="space-y-1">
							<p className="font-medium text-sm">
								Drag & drop or click to upload
							</p>
							<p className="text-muted-foreground text-xs">
								Images (JPEG, PNG, GIF, WebP) or PDF
							</p>
							<p className="text-muted-foreground text-xs">
								Max size: {formatBytes(maxSize)}
							</p>
						</div>
					</div>
				)}
			</div>

			{errors.length > 0 && (
				<p className="text-destructive text-xs">{errors[0]}</p>
			)}
		</div>
	);
}
