"use client";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { Image } from "lucide-react";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { INSERT_IMAGE_COMMAND } from "./images-plugin";

export function InsertImageToolbarButton() {
	const [editor] = useLexicalComposerContext();
	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
		const files = event.target.files;
		if (files && files.length > 0) {
			const file = files[0];
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
