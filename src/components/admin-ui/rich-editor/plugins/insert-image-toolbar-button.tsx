"use client";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { Image } from "lucide-react";
import { useRef } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { INSERT_IMAGE_COMMAND } from "./images-plugin";

// Maximum file size for rich editor images (10MB - matches backend)
const MAX_RICH_EDITOR_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export function InsertImageToolbarButton() {
	const [editor] = useLexicalComposerContext();
	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
		const files = event.target.files;
		if (files && files.length > 0) {
			const file = files[0];

			// Client-side validation for better UX
			if (file.size > MAX_RICH_EDITOR_FILE_SIZE) {
				const maxSizeMB = MAX_RICH_EDITOR_FILE_SIZE / (1024 * 1024);
				const currentSizeMB = (file.size / (1024 * 1024)).toFixed(2);
				toast.error(
					`File size (${currentSizeMB}MB) exceeds maximum allowed size of ${maxSizeMB}MB`,
					{ duration: 5000 },
				);
				// Reset file input
				if (fileInputRef.current) {
					fileInputRef.current.value = "";
				}
				return;
			}

			editor.dispatchCommand(INSERT_IMAGE_COMMAND, file);
		}
		// Reset file input
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	};

	return (
		<>
			<Button
				variant="ghost"
				size="sm"
				onClick={() => fileInputRef.current?.click()}
				aria-label="Upload Image"
			>
				<Image className="h-4 w-4" />
			</Button>
			<input
				type="file"
				ref={fileInputRef}
				onChange={handleImageUpload}
				className="hidden"
				accept="image/*"
			/>
		</>
	);
}
