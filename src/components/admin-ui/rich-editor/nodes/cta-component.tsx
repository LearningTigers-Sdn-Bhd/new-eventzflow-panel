"use client";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useLexicalNodeSelection } from "@lexical/react/useLexicalNodeSelection";
import { mergeRegister } from "@lexical/utils";
import type { NodeKey } from "lexical";
import {
	$getNodeByKey,
	$getSelection,
	$isNodeSelection,
	CLICK_COMMAND,
	COMMAND_PRIORITY_LOW,
	KEY_BACKSPACE_COMMAND,
	KEY_DELETE_COMMAND,
} from "lexical";
import { ExternalLink, Megaphone } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { FormGroupContainer } from "@/components/admin-ui/form/form-group-container";
import { InputLabel } from "@/components/admin-ui/form/input-label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CtaBlockView } from "../../new-editor/extensions/cta-block-view";
import { $isCtaNode } from "./cta-node";

export default function CtaComponent({
	title,
	description,
	buttonText,
	buttonUrl,
	nodeKey,
}: {
	title: string;
	description: string;
	buttonText: string;
	buttonUrl: string;
	nodeKey: NodeKey;
}) {
	const [editor] = useLexicalComposerContext();
	const [isSelected, setSelected, clearSelection] =
		useLexicalNodeSelection(nodeKey);
	const [isEditing, setIsEditing] = useState(false);

	// Synchronize state with node attributes for the form
	const [formData, setFormData] = useState({
		title,
		description,
		buttonText,
		buttonUrl,
	});

	useEffect(() => {
		setFormData({ title, description, buttonText, buttonUrl });
	}, [title, description, buttonText, buttonUrl]);

	const onDelete = useCallback(
		(payload: KeyboardEvent) => {
			if (isSelected && $isNodeSelection($getSelection())) {
				const event: KeyboardEvent = payload;
				event.preventDefault();
				const node = $getNodeByKey(nodeKey);
				if ($isCtaNode(node)) {
					node.remove();
				}
			}
			return false;
		},
		[isSelected, nodeKey],
	);

	useEffect(() => {
		return mergeRegister(
			editor.registerCommand<MouseEvent>(
				CLICK_COMMAND,
				(event) => {
					if (isEditing) {
						return false;
					}

					const ctaElement = editor.getElementByKey(nodeKey);
					if (
						event.target === ctaElement ||
						ctaElement?.contains(event.target as Node)
					) {
						if (event.shiftKey) {
							setSelected(!isSelected);
						} else {
							clearSelection();
							setSelected(true);
						}
						return true;
					}

					return false;
				},
				COMMAND_PRIORITY_LOW,
			),
			editor.registerCommand(
				KEY_DELETE_COMMAND,
				onDelete,
				COMMAND_PRIORITY_LOW,
			),
			editor.registerCommand(
				KEY_BACKSPACE_COMMAND,
				onDelete,
				COMMAND_PRIORITY_LOW,
			),
		);
	}, [
		editor,
		isEditing,
		onDelete,
		isSelected,
		nodeKey,
		setSelected,
		clearSelection,
	]);

	const updateAttributes = (updates: Partial<typeof formData>) => {
		const newData = { ...formData, ...updates };
		setFormData(newData);
		editor.update(() => {
			const node = $getNodeByKey(nodeKey);
			if ($isCtaNode(node)) {
				node.updateAttributes(updates);
			}
		});
	};

	const handleEdit = () => {
		setIsEditing(true);
		setSelected(true);
	};

	const handleSave = () => {
		setIsEditing(false);
	};

	if (isEditing) {
		return (
			<div className="not-prose my-12">
				<div
					className={cn(
						"relative border-t-4 border-r border-b border-l-4 p-8 transition-all duration-300",
						"rounded-none",
						"border-primary bg-primary/5 shadow-[8px_8px_0px_0px_hsl(var(--primary)/0.1)]",
					)}
				>
					<div className="mb-8 flex items-center gap-3">
						<div className="flex h-10 w-10 items-center justify-center border border-foreground bg-background">
							<Megaphone className="h-5 w-5" />
						</div>
						<div className="h-px flex-1 bg-foreground/10" />
					</div>

					<div className="grid gap-6 border border-foreground/20 bg-muted/30 p-6">
						<FormGroupContainer
							title={{
								icon: Megaphone,
								label: "Call To Action Banner",
								description: "Configure the main message of your CTA.",
							}}
						>
							<InputLabel
								label="Title"
								value={formData.title}
								onChange={(val) => updateAttributes({ title: val })}
								placeholder="Enter a bold headline..."
								variant="no-rounded"
								className="text-foreground"
							/>
							<InputLabel
								label="Description"
								value={formData.description}
								onChange={(val) => updateAttributes({ description: val })}
								placeholder="A short compelling message."
								variant="no-rounded"
								className="text-foreground"
							/>
						</FormGroupContainer>

						<FormGroupContainer
							title={{
								icon: ExternalLink,
								label: "Action Button",
								description: "Configure the call-to-action button.",
							}}
						>
							<div className="grid w-full grid-cols-2 gap-4">
								<InputLabel
									label="Button Text"
									value={formData.buttonText}
									onChange={(val) => updateAttributes({ buttonText: val })}
									placeholder="e.g. JOIN NOW"
									variant="no-rounded"
									className="text-foreground"
								/>
								<InputLabel
									label="URL"
									value={formData.buttonUrl}
									onChange={(val) => updateAttributes({ buttonUrl: val })}
									placeholder="https://..."
									variant="no-rounded"
									className="text-foreground"
								/>
							</div>
						</FormGroupContainer>

						<Button
							variant="default"
							size="sm"
							onClick={handleSave}
							className="mt-2 w-full rounded-none font-bold uppercase tracking-widest transition-transform active:scale-[0.98]"
						>
							Save Configuration
						</Button>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div
			className={cn(
				"outline-none transition-all",
				isSelected && "outline-2 outline-primary",
			)}
		>
			<CtaBlockView
				title={title}
				description={description}
				buttonText={buttonText}
				buttonUrl={buttonUrl}
				isEditable={editor.isEditable()}
				onEdit={handleEdit}
				selected={isSelected}
			/>
		</div>
	);
}
