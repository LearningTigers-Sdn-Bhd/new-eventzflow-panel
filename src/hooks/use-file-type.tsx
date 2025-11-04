"use client";

import {
	FileArchiveIcon,
	FileSpreadsheetIcon,
	FileTextIcon,
	HeadphonesIcon,
	ImageIcon,
	VideoIcon,
} from "lucide-react";
import type * as React from "react";

import type { FileMetadata } from "./use-file-upload";

export function getFileIcon(file: File | FileMetadata): React.ReactElement {
	const type = file instanceof File ? file.type : file.type;
	if (type.startsWith("image/")) return <ImageIcon className="size-4" />;
	if (type.startsWith("video/")) return <VideoIcon className="size-4" />;
	if (type.startsWith("audio/")) return <HeadphonesIcon className="size-4" />;
	if (type.includes("pdf")) return <FileTextIcon className="size-4" />;
	if (type.includes("word") || type.includes("doc"))
		return <FileTextIcon className="size-4" />;
	if (type.includes("excel") || type.includes("sheet"))
		return <FileSpreadsheetIcon className="size-4" />;
	if (type.includes("zip") || type.includes("rar"))
		return <FileArchiveIcon className="size-4" />;
	return <FileTextIcon className="size-4" />;
}

export function getFileTypeLabel(file: File | FileMetadata): string {
	const fileName = file instanceof File ? file.name : file.name;
	const fileType = file instanceof File ? file.type : file.type;

	// Get file extension
	const extension = fileName.substring(fileName.lastIndexOf(".")).toLowerCase();

	// Check by extension first (more reliable)
	if (extension === ".xlsx" || extension === ".xls" || extension === ".csv") {
		return "Excel";
	}
	if (extension === ".doc" || extension === ".docx") {
		return "Word";
	}
	if (extension === ".pdf") {
		return "PDF";
	}
	if ([".zip", ".rar", ".7z", ".tar", ".gz"].includes(extension)) {
		return "Archive";
	}
	if (extension === ".json") {
		return "JSON";
	}

	// Fallback to MIME type
	if (fileType.startsWith("image/")) return "Image";
	if (fileType.startsWith("video/")) return "Video";
	if (fileType.startsWith("audio/")) return "Audio";
	if (fileType.includes("pdf")) return "PDF";
	// Check Excel before Word to avoid conflicts
	if (
		fileType.includes("excel") ||
		fileType.includes("sheet") ||
		fileType.includes("spreadsheet")
	) {
		return "Excel";
	}
	if (fileType.includes("word") || fileType.includes("doc")) {
		return "Word";
	}
	if (fileType.includes("zip") || fileType.includes("rar")) {
		return "Archive";
	}
	if (fileType.includes("json")) return "JSON";
	if (fileType.includes("text") || fileType === "text/csv") {
		return "Text";
	}

	return "File";
}

export function getFileTypeBadgeColor(file: File | FileMetadata): string {
	const fileName = file instanceof File ? file.name : file.name;
	const fileType = file instanceof File ? file.type : file.type;

	// Get file extension
	const extension = fileName.substring(fileName.lastIndexOf(".")).toLowerCase();

	// Check by extension first (more reliable)
	if (extension === ".xlsx" || extension === ".xls" || extension === ".csv") {
		// Excel - Green color
		return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800";
	}
	if (extension === ".doc" || extension === ".docx") {
		// Word - Blue color
		return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800";
	}
	if (extension === ".pdf") {
		// PDF - Red color
		return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800";
	}
	if ([".zip", ".rar", ".7z", ".tar", ".gz"].includes(extension)) {
		// Archive - Orange color
		return "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800";
	}
	if (extension === ".json") {
		// JSON - Purple color
		return "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800";
	}

	// Fallback to MIME type
	if (fileType.startsWith("image/")) {
		return "bg-pink-100 text-pink-800 border-pink-200 dark:bg-pink-900/20 dark:text-pink-400 dark:border-pink-800";
	}
	if (fileType.startsWith("video/")) {
		return "bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-400 dark:border-indigo-800";
	}
	if (fileType.startsWith("audio/")) {
		return "bg-cyan-100 text-cyan-800 border-cyan-200 dark:bg-cyan-900/20 dark:text-cyan-400 dark:border-cyan-800";
	}
	if (fileType.includes("pdf")) {
		return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800";
	}
	if (
		fileType.includes("excel") ||
		fileType.includes("sheet") ||
		fileType.includes("spreadsheet")
	) {
		return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800";
	}
	if (fileType.includes("word") || fileType.includes("doc")) {
		return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800";
	}
	if (fileType.includes("zip") || fileType.includes("rar")) {
		return "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800";
	}
	if (fileType.includes("json")) {
		return "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800";
	}
	if (fileType.includes("text") || fileType === "text/csv") {
		return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800";
	}

	// Default - Gray
	return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800";
}
