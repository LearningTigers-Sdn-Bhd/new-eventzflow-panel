"use client";

import { Upload } from "lucide-react";
import { useEffect, useState, useRef } from "react";
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
}

export default function ImageUpload({
	value,
	onChange,
	className,
	disabled = false,
	maxSize = 5 * 1024 * 1024, // 5MB
}: ImageUploadProps) {
	// We need to track the preview URL separately
	const [previewUrl, setPreviewUrl] = useState<string | null>(null);
	const prevValueRef = useRef<string | File | undefined>(undefined);

	// Initialize file upload hook
	const [
		{ files, isDragging, errors },
		{
			addFiles,
			removeFile,
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
	});

	useEffect(() => {
		const firstFile = files[0]?.file;
		if (firstFile instanceof File) {
			onChange?.(firstFile);
		}
		// Don't call onChange(null) here - only call it explicitly when user removes the image
		// Otherwise it will clear existing URL values when the component mounts
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
		} else if (value instanceof File) {
			// If the value is a File, ensure preview is correct
			const preview = URL.createObjectURL(value);
			setPreviewUrl(preview);
			return () => URL.revokeObjectURL(preview);
		} else if (!value && files.length === 0) {
			// Only clear if we don't have a current file being uploaded
			setPreviewUrl(null);
		}
	}, [value, files.length]);

	// Hook's files take precedence for preview if a new file is selected
	const currentFile = files[0];
	const displayPreview = currentFile?.preview || previewUrl;

	const handleRemove = () => {
		clearFiles();
		setPreviewUrl(null);
		onChange?.(null);
	};

	return (
		<div className={cn("w-full space-y-2", className)}>
			<div
				aria-label="Image upload drop zone"
				className={cn(
					"relative flex flex-col items-center justify-center rounded-lg border border-dashed transition-colors overflow-hidden",
					isDragging
						? "border-primary bg-primary/5"
						: "border-muted-foreground/25 hover:border-muted-foreground/50",
					disabled && "opacity-60 cursor-not-allowed pointer-events-none",
					displayPreview ? "h-64" : "h-40",
					"bg-muted/30"
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
								isDragging && "bg-primary/10"
							)}
						>
							<Upload className="h-5 w-5 text-muted-foreground" />
						</div>
						<div className="space-y-1">
							<p className="text-sm font-medium">
								Drag & drop or click to upload
							</p>
							<p className="text-xs text-muted-foreground">
								Max size: {formatBytes(maxSize)}
							</p>
						</div>
					</div>
				)}
			</div>

			{errors.length > 0 && (
				<p className="text-xs text-destructive">{errors[0]}</p>
			)}
		</div>
	);
}
