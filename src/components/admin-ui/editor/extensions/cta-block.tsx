"use client";

import { mergeAttributes, Node } from "@tiptap/core";
import {
	type NodeViewProps,
	NodeViewWrapper,
	ReactNodeViewRenderer,
} from "@tiptap/react";
import { ExternalLink, Megaphone } from "lucide-react";
import { useState } from "react";
import { FormGroupContainer } from "@/components/admin-ui/form/form-group-container";
import { InputLabel } from "@/components/admin-ui/form/input-label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const CtaComponent = ({
	node,
	updateAttributes,
	selected,
	editor,
}: NodeViewProps) => {
	const { title, description, buttonText, buttonUrl } = node.attrs;
	const [isEditing, setIsEditing] = useState(false);
	const isEditable = editor.isEditable;

	return (
		<NodeViewWrapper className="not-prose my-12">
			<div
				className={cn(
					"relative border-t-4 border-r border-b border-l-4 p-8 transition-all duration-300",
					"rounded-none",
					selected && isEditable
						? "border-primary bg-primary/5 shadow-[8px_8px_0px_0px_hsl(var(--primary)/0.1)]"
						: "border-foreground bg-background shadow-[8px_8px_0px_0px_rgba(0,0,0,0.05)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.02)]",
				)}
			>
				<div className="mb-8 flex items-center gap-3">
					<div className="flex h-10 w-10 items-center justify-center border border-foreground bg-background">
						<Megaphone className="h-5 w-5" />
					</div>
					<div className="h-px flex-1 bg-foreground/10" />
				</div>

				{isEditing && isEditable ? (
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
								value={title}
								onChange={(val) => updateAttributes({ title: val })}
								placeholder="Enter a bold headline..."
								variant="no-rounded"
								className="text-foreground"
							/>
							<InputLabel
								label="Description"
								value={description}
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
									value={buttonText}
									onChange={(val) => updateAttributes({ buttonText: val })}
									placeholder="e.g. JOIN NOW"
									variant="no-rounded"
									className="text-foreground"
								/>
								<InputLabel
									label="URL"
									value={buttonUrl}
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
							onClick={() => setIsEditing(false)}
							className="mt-2 w-full rounded-none font-bold uppercase tracking-widest transition-transform active:scale-[0.98]"
						>
							Save Configuration
						</Button>
					</div>
				) : (
					<div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
						<div className="flex-1 space-y-2">
							<h3 className="font-black font-title text-3xl text-foreground uppercase leading-none tracking-tighter">
								{title || "UNLEASH THE POTENTIAL"}
							</h3>
							<p className="max-w-md text-muted-foreground text-sm leading-relaxed">
								{description ||
									"Provide a clear and concise description of the value proposition to engage your audience immediately."}
							</p>
						</div>
						<div className="flex flex-col items-center gap-4">
							{buttonUrl && !isEditable ? (
								<a
									href={buttonUrl}
									target="_blank"
									rel="noopener noreferrer"
									className="inline-flex h-14 min-w-[180px] cursor-pointer items-center justify-center rounded-none border-2 border-foreground bg-foreground px-4 font-bold text-background uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 hover:translate-x-0.5 hover:translate-y-0.5 hover:bg-background hover:text-foreground hover:shadow-none dark:shadow-foreground/30"
								>
									{buttonText || "Get Started"}
									<ExternalLink className="ml-2 h-4 w-4" />
								</a>
							) : (
								<Button className="h-14 min-w-[180px] cursor-pointer rounded-none border-2 border-foreground bg-foreground font-bold text-background uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 hover:translate-x-0.5 hover:translate-y-0.5 hover:bg-background hover:text-foreground hover:shadow-none dark:shadow-foreground/30">
									{buttonText || "Get Started"}
									<ExternalLink className="ml-2 h-4 w-4" />
								</Button>
							)}

							{isEditable && (
								<button
									type="button"
									onClick={() => setIsEditing(true)}
									className="font-bold text-[10px] text-muted-foreground uppercase tracking-tighter underline-offset-4 hover:text-foreground hover:underline"
								>
									[ Edit Module ]
								</button>
							)}
						</div>
					</div>
				)}
			</div>
		</NodeViewWrapper>
	);
};

export const CtaBlock = Node.create({
	name: "ctaBlock",
	group: "block",
	atom: true,

	addAttributes() {
		return {
			title: { default: "" },
			description: { default: "" },
			buttonText: { default: "Get Started" },
			buttonUrl: { default: "" },
		};
	},

	parseHTML() {
		return [{ tag: 'div[data-type="cta-block"]' }];
	},

	renderHTML({ HTMLAttributes }) {
		return [
			"div",
			mergeAttributes(HTMLAttributes, { "data-type": "cta-block" }),
		];
	},

	addNodeView() {
		return ReactNodeViewRenderer(CtaComponent);
	},
});
