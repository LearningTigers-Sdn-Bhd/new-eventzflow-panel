"use client";

import { Upload } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
	type FileWithPreview,
	formatBytes,
	useFileUpload,
} from "@/hooks/use-file-upload";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
	value?: string | File; // URL or File object
	onChange?: (file: File | null) => void;
	className?: string;
	disabled?: boolean;
	maxSize?: number; // Default 5MB
	fillHeight?: boolean; // If true, fills the available height instead of fixed height
}

export default function ImageUpload({
	value,
	onChange,
	className,
	disabled = false,
	maxSize = 5 * 1024 * 1024, // 5MB
	fillHeight = false,
}: ImageUploadProps) {
	const [previewUrl, setPreviewUrl] = useState<string | null>(null);
	const prevValueRef = useRef<string | File | undefined>(undefined);

	// Initialize file upload hook
	const [
		{ files, isDragging, errors },
		{
			addFiles,
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
		accept: "image/*",
		multiple: false,
		// We call onChange only when files are added or changed via the hook's internal mechanisms
		onFilesChange: (newFiles) => {
			const firstFile = newFiles[0]?.file;
			if (firstFile instanceof File) {
				onChange?.(firstFile);
			} else if (newFiles.length === 0) {
				// Don't clear automatically if we have a value URL but no hook files
				// Only clear if clearFiles was called
			}
		}
	});

	// Sync value prop with internal state
	useEffect(() => {
		if (prevValueRef.current === value) {
			return;
		}

		prevValueRef.current = value;

		if (typeof value === "string" && value) {
			setPreviewUrl(value);
		} else if (value instanceof File) {
			const preview = URL.createObjectURL(value);
			setPreviewUrl(preview);
			return () => URL.revokeObjectURL(preview);
		} else if (!value) {
			setPreviewUrl(null);
		}
	}, [value]);

	// Hook's files take precedence for preview if a new file is selected
	const currentFile = files[0];
	const displayPreview = currentFile?.preview || previewUrl;

	const handleRemove = () => {
		clearFiles();
		setPreviewUrl(null);
		onChange?.(null);
	};

	return (
		<div
			className={cn(
				"w-full",
				fillHeight ? "flex h-full min-h-0 flex-col" : "space-y-2",
				className,
			)}
		>
			<div
				aria-label="Image upload drop zone"
				className={cn(
					"relative flex flex-col items-center justify-center overflow-hidden rounded-lg border border-dashed transition-colors",
					isDragging
						? "border-primary bg-primary/5"
						: "border-muted-foreground/25 hover:border-muted-foreground/50",
					disabled && "pointer-events-none cursor-not-allowed opacity-60",
					fillHeight
						? "min-h-40 min-w-0 flex-1"
						: displayPreview
							? "h-64"
							: "h-40",
					"bg-muted/30",
				)}
				onClick={!displayPreview ? openFileDialog : undefined}
				onDragEnter={handleDragEnter}
				onDragLeave={handleDragLeave}
				onDragOver={handleDragOver}
				onDrop={handleDrop}
			>
				<input {...getInputProps()} disabled={disabled} className="sr-only" />

				{displayPreview ? (
					<div className="relative h-full w-full">
						<img
							src={displayPreview}
							alt="Preview"
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
