"use client";

import {
	CloudUpload,
	Download,
	FileText,
	RefreshCwIcon,
	Trash2,
	TriangleAlert,
	Upload,
} from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
	Alert,
	AlertContent,
	AlertDescription,
	AlertIcon,
	AlertTitle,
} from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	getFileIcon,
	getFileTypeBadgeColor,
	getFileTypeLabel,
} from "@/hooks/use-file-type";
import {
	type FileWithPreview,
	formatBytes,
	useFileUpload,
} from "@/hooks/use-file-upload";
import { cn } from "@/lib/utils";
import { IconTitle } from "../ui/icon-heading";

interface FileUploadItem extends FileWithPreview {
	progress: number;
	status: "uploading" | "completed" | "error";
	error?: string;
}

interface TableUploadProps {
	maxFiles?: number;
	maxSize?: number;
	accept?: string;
	multiple?: boolean;
	className?: string;
	onFilesChange?: (files: FileWithPreview[]) => void;
	simulateUpload?: boolean;
}

export default function TableUpload({
	maxFiles = 10,
	maxSize = 50 * 1024 * 1024, // 50MB
	accept = "*",
	multiple = true,
	className,
	onFilesChange,
	simulateUpload = true,
}: TableUploadProps) {
	const [uploadFiles, setUploadFiles] = useState<FileUploadItem[]>([]);

	const [
		{ files, isDragging, errors },
		{
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
		maxFiles,
		maxSize,
		accept,
		multiple,
		initialFiles: [],
	});

	useEffect(() => {
		// Sync hook files to local uploadFiles state and notify parent after render
		setUploadFiles((prev) => {
			const prevById = new Map(prev.map((f) => [f.id, f]));
			return files.map((file) => {
				const existing = prevById.get(file.id);
				return existing
					? { ...existing, ...file }
					: { ...file, progress: 0, status: "uploading" as const };
			});
		});
		onFilesChange?.(files);
	}, [files, onFilesChange]);

	// Simulate upload progress
	useEffect(() => {
		if (!simulateUpload) return;

		const interval = setInterval(() => {
			setUploadFiles((prev) =>
				prev.map((file) => {
					if (file.status !== "uploading") return file;

					const increment = Math.random() * 15 + 5; // 5-20% increment
					const newProgress = Math.min(file.progress + increment, 100);

					if (newProgress >= 100) {
						// Randomly decide if upload succeeds or fails
						const shouldFail = Math.random() < 0.1; // 10% chance to fail
						return {
							...file,
							progress: 100,
							status: shouldFail ? ("error" as const) : ("completed" as const),
							error: shouldFail
								? "Upload failed. Please try again."
								: undefined,
						};
					}

					return { ...file, progress: newProgress };
				}),
			);
		}, 500);

		return () => clearInterval(interval);
	}, [simulateUpload]);

	const removeUploadFile = (fileId: string) => {
		setUploadFiles((prev) => prev.filter((file) => file.id !== fileId));
		removeFile(fileId);
	};

	const retryUpload = (fileId: string) => {
		setUploadFiles((prev) =>
			prev.map((file) =>
				file.id === fileId
					? {
							...file,
							progress: 0,
							status: "uploading" as const,
							error: undefined,
						}
					: file,
			),
		);
	};

	return (
		<div className={cn("w-full space-y-4 border-t border-dashed", className)}>
			<div className="border-b border-dashed bg-muted p-2 md:p-4">
				{/* Upload Area */}
				{/* biome-ignore lint: File upload drop zone requires interactive div with drag handlers */}
				<div
					aria-label="File upload drop zone"
					className={cn(
						"relative cursor-pointer border border-dashed bg-background p-6 text-center transition-colors",
						isDragging
							? "border-primary bg-primary/5"
							: "border-muted-foreground/25 hover:border-muted-foreground/50",
					)}
					onClick={openFileDialog}
					onDragEnter={handleDragEnter}
					onDragLeave={handleDragLeave}
					onDragOver={handleDragOver}
					onDrop={handleDrop}
				>
					<input {...getInputProps()} className="sr-only" />

					<div className="flex flex-col items-center gap-4">
						<div
							className={cn(
								"flex h-12 w-12 items-center justify-center bg-muted transition-colors",
								isDragging
									? "border-primary bg-primary/10"
									: "border-muted-foreground/25",
							)}
						>
							<Upload className="h-5 w-5 text-muted-foreground" />
						</div>

						<div className="space-y-2">
							<p className="font-medium text-sm">
								Drop files here or{" "}
								<button
									type="button"
									onClick={openFileDialog}
									className="cursor-pointer text-primary underline-offset-4 hover:underline"
								>
									browse files
								</button>
							</p>
							<p className="text-muted-foreground text-xs">
								Maximum file size: {formatBytes(maxSize)} • Maximum files:{" "}
								{maxFiles}
							</p>
						</div>
					</div>
				</div>
			</div>

			{/* Files Table */}
			{uploadFiles.length > 0 && (
				<div className="space-y-4">
					<div className="flex items-center justify-between border-y border-dashed py-4">
						<div className="flex items-center gap-2 px-2 md:px-4">
							<IconTitle
								icon={FileText}
								title="Uploaded Files"
								description={`${uploadFiles.length} files uploaded`}
							/>
						</div>
						{maxFiles > 1 && (
							<div className="flex gap-2">
								<Button
									onClick={openFileDialog}
									variant="outline"
									size="sm"
									className="rounded-none"
								>
									<CloudUpload />
									Add files
								</Button>
								<Button
									onClick={clearFiles}
									variant="outline"
									size="sm"
									className="rounded-none"
								>
									<Trash2 />
									Remove all
								</Button>
							</div>
						)}
					</div>

					<div className="border">
						<Table>
							<TableHeader>
								<TableRow className="bg-muted text-xs [&>th]:font-semibold">
									<TableHead className="h-9">Name</TableHead>
									<TableHead className="h-9">Type</TableHead>
									<TableHead className="h-9">Size</TableHead>
									<TableHead className="h-9 w-[100px] text-end">
										Actions
									</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{uploadFiles.map((fileItem) => (
									<TableRow key={fileItem.id}>
										<TableCell className="py-2 ps-1.5">
											<div className="flex items-center gap-1">
												<div
													className={cn(
														"relative flex size-8 shrink-0 items-center justify-center text-muted-foreground/80",
													)}
												>
													{fileItem.status === "uploading" ? (
														<div className="relative">
															{/* Circular progress background */}
															<svg
																className="-rotate-90 size-8"
																viewBox="0 0 32 32"
																aria-label={`Uploading ${fileItem.file.name}: ${Math.round(fileItem.progress)}%`}
															>
																<title>{`Uploading ${fileItem.file.name}: ${Math.round(fileItem.progress)}%`}</title>
																<circle
																	cx="16"
																	cy="16"
																	r="14"
																	fill="none"
																	stroke="currentColor"
																	strokeWidth="2"
																	className="text-muted-foreground/20"
																/>
																{/* Progress circle */}
																<circle
																	cx="16"
																	cy="16"
																	r="14"
																	fill="none"
																	stroke="currentColor"
																	strokeWidth="2"
																	strokeDasharray={`${2 * Math.PI * 14}`}
																	strokeDashoffset={`${2 * Math.PI * 14 * (1 - fileItem.progress / 100)}`}
																	className="text-primary transition-all duration-300"
																	strokeLinecap="round"
																/>
															</svg>
															{/* File icon in center */}
															<div className="absolute inset-0 flex items-center justify-center">
																{getFileIcon(fileItem.file)}
															</div>
														</div>
													) : (
														<div className="flex not-[]:size-8 items-center justify-center">
															{getFileIcon(fileItem.file)}
														</div>
													)}
												</div>
												<p className="flex items-center gap-1 truncate font-medium text-sm">
													{fileItem.file.name}
													{fileItem.status === "error" && (
														<Badge
															variant="destructive"
															className="rounded-none"
														>
															Error
														</Badge>
													)}
												</p>
											</div>
										</TableCell>
										<TableCell className="py-2">
											<Badge
												variant="outline"
												className={cn(
													"rounded-none border text-xs",
													getFileTypeBadgeColor(fileItem.file),
												)}
											>
												{getFileTypeLabel(fileItem.file)}
											</Badge>
										</TableCell>
										<TableCell className="py-2 text-muted-foreground text-sm">
											{formatBytes(fileItem.file.size)}
										</TableCell>
										<TableCell className="py-2">
											<div className="flex w-full items-center justify-end gap-1 pe-1.5">
												{fileItem.preview && (
													<Button
														variant="default"
														size="icon"
														className="size-8 rounded-none bg-green-500 hover:bg-green-600"
														asChild
													>
														<Link
															href={fileItem.preview as Route}
															target="_blank"
														>
															<Download className="size-3.5" />
														</Link>
													</Button>
												)}
												{fileItem.status === "error" ? (
													<Button
														onClick={() => retryUpload(fileItem.id)}
														variant="default"
														size="icon"
														className="size-8 rounded-none text-destructive/80 hover:text-destructive"
													>
														<RefreshCwIcon className="size-3.5" />
													</Button>
												) : (
													<Button
														onClick={() => removeUploadFile(fileItem.id)}
														variant="destructive"
														size="icon"
														className="size-8 rounded-none"
													>
														<Trash2 className="size-3.5" />
													</Button>
												)}
											</div>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</div>
				</div>
			)}

			{/* Error Messages */}
			{errors.length > 0 && (
				<Alert variant="destructive" appearance="light" className="mt-5">
					<AlertIcon>
						<TriangleAlert />
					</AlertIcon>
					<AlertContent>
						<AlertTitle>File upload error(s)</AlertTitle>
						<AlertDescription>
							{errors.map((error, index) => (
								<p key={`error-${index}-${error}`} className="last:mb-0">
									{error}
								</p>
							))}
						</AlertDescription>
					</AlertContent>
				</Alert>
			)}
		</div>
	);
}
