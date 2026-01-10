"use client";

import { $createCodeNode } from "@lexical/code";
import {
	INSERT_CHECK_LIST_COMMAND,
	INSERT_ORDERED_LIST_COMMAND,
	INSERT_UNORDERED_LIST_COMMAND,
} from "@lexical/list";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
	LexicalTypeaheadMenuPlugin,
	MenuOption,
	useBasicTypeaheadTriggerMatch,
} from "@lexical/react/LexicalTypeaheadMenuPlugin";
import { $createHeadingNode, $createQuoteNode } from "@lexical/rich-text";
import { INSERT_TABLE_COMMAND } from "@lexical/table";
import type { LexicalEditor, TextNode } from "lexical";
import { $getSelection, $insertNodes, $isRangeSelection } from "lexical";
import {
	Code,
	Heading1,
	Heading2,
	Heading3,
	List,
	ListOrdered,
	ListTodo,
	type LucideIcon,
	Megaphone,
	Quote,
	Table,
} from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { $createCtaNode } from "../nodes/cta-node";
// ... imports

// ... SlashCommandOption and SlashCommandMenuItem definitions

// Helper function to set block type
import { $setBlocksType } from "@lexical/selection";

class SlashCommandOption extends MenuOption {
	title: string;
	description: string;
	icon: LucideIcon;
	keywords: Array<string>;
	keyboardShortcut?: string;
	onSelect: (editor: LexicalEditor) => void;

	constructor(
		title: string,
		description: string,
		icon: LucideIcon,
		keywords: Array<string>,
		onSelect: (editor: LexicalEditor) => void,
	) {
		super(title);
		this.title = title;
		this.description = description;
		this.icon = icon;
		this.keywords = keywords || [];
		this.onSelect = onSelect;
	}
}

function SlashCommandMenuItem({
	index,
	isSelected,
	onClick,
	onMouseEnter,
	option,
}: {
	index: number;
	isSelected: boolean;
	onClick: () => void;
	onMouseEnter: () => void;
	option: SlashCommandOption;
}) {
	const Icon = option.icon;
	return (
		<div
			key={option.key}
			tabIndex={-1}
			className={cn(
				"group flex cursor-default select-none items-center gap-3 rounded-none px-2 py-2 text-sm outline-none transition-colors",
				isSelected ? "bg-accent text-accent-foreground" : "hover:bg-muted",
			)}
			ref={option.setRefElement}
			role="option"
			aria-selected={isSelected}
			id={`typeahead-item-${index}`}
			onMouseEnter={onMouseEnter}
			onClick={onClick}
			onKeyDown={(e) => {
				if (e.key === "Enter" || e.key === " ") {
					e.preventDefault();
					onClick();
				}
			}}
		>
			<div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-none border bg-muted/50 group-hover:bg-background">
				<Icon className="h-4 w-4" />
			</div>
			<div className="flex flex-col overflow-hidden">
				<span className="font-medium">{option.title}</span>
				<span className="truncate text-muted-foreground text-xs">
					{option.description}
				</span>
			</div>
		</div>
	);
}

export default function SlashCommandPlugin() {
	const [editor] = useLexicalComposerContext();
	const [queryString, setQueryString] = useState<string | null>(null);

	const checkForSlashTrigger = useBasicTypeaheadTriggerMatch("/", {
		minLength: 0,
	});

	const options = useMemo(() => {
		const baseOptions = [
			new SlashCommandOption(
				"Heading 1",
				"Big section heading",
				Heading1,
				["h1", "heading", "header"],
				(editor) => {
					editor.update(() => {
						const selection = $getSelection();
						if ($isRangeSelection(selection)) {
							$setBlocksType(selection, () => $createHeadingNode("h1"));
						}
					});
				},
			),
			new SlashCommandOption(
				"Heading 2",
				"Medium section heading",
				Heading2,
				["h2", "heading", "header"],
				(editor) => {
					editor.update(() => {
						const selection = $getSelection();
						if ($isRangeSelection(selection)) {
							$setBlocksType(selection, () => $createHeadingNode("h2"));
						}
					});
				},
			),
			new SlashCommandOption(
				"Heading 3",
				"Small section heading",
				Heading3,
				["h3", "heading", "header"],
				(editor) => {
					editor.update(() => {
						const selection = $getSelection();
						if ($isRangeSelection(selection)) {
							$setBlocksType(selection, () => $createHeadingNode("h3"));
						}
					});
				},
			),
			new SlashCommandOption(
				"Bullet List",
				"Create a simple bullet list",
				List,
				["ul", "list", "bullet"],
				(editor) => {
					editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
				},
			),
			new SlashCommandOption(
				"Numbered List",
				"Create a list with numbering",
				ListOrdered,
				["ol", "list", "number"],
				(editor) => {
					editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
				},
			),
			new SlashCommandOption(
				"Checklist",
				"Create a task list",
				ListTodo,
				["todo", "task", "check"],
				(editor) => {
					editor.dispatchCommand(INSERT_CHECK_LIST_COMMAND, undefined);
				},
			),
			new SlashCommandOption(
				"Quote",
				"Capture a quotation",
				Quote,
				["quote", "blockquote"],
				(editor) => {
					editor.update(() => {
						const selection = $getSelection();
						if ($isRangeSelection(selection)) {
							$setBlocksType(selection, () => $createQuoteNode());
						}
					});
				},
			),
			new SlashCommandOption(
				"Code Block",
				"Code snippet with highlighting",
				Code,
				["code", "block"],
				(editor) => {
					editor.update(() => {
						const selection = $getSelection();
						if ($isRangeSelection(selection)) {
							$setBlocksType(selection, () => $createCodeNode());
						}
					});
				},
			),
			new SlashCommandOption(
				"Table",
				"Insert a table",
				Table,
				["table", "grid"],
				(editor) => {
					// Columns, Rows, Heading Row (bool), Width?
					editor.dispatchCommand(INSERT_TABLE_COMMAND, {
						columns: "3",
						rows: "3",
						includeHeaders: true,
					});
				},
			),
			new SlashCommandOption(
				"CTA Block",
				"Insert a Call to Action",
				Megaphone,
				["cta", "call", "action"],
				(editor) => {
					editor.update(() => {
						const ctaNode = $createCtaNode({});
						$insertNodes([ctaNode]);
					});
				},
			),
		];

		if (!queryString) {
			return baseOptions;
		}

		const regex = new RegExp(queryString, "i");

		return baseOptions.filter(
			(option) =>
				regex.test(option.title) ||
				option.keywords.some((keyword) => regex.test(keyword)),
		);
	}, [queryString]);

	const onSelectOption = useCallback(
		(
			selectedOption: SlashCommandOption,
			nodeToRemove: TextNode | null,
			closeMenu: () => void,
		) => {
			editor.update(() => {
				if (nodeToRemove) {
					nodeToRemove.remove();
				}
				selectedOption.onSelect(editor);
				closeMenu();
			});
		},
		[editor],
	);

	return (
		<LexicalTypeaheadMenuPlugin<SlashCommandOption>
			onQueryChange={setQueryString}
			onSelectOption={onSelectOption}
			triggerFn={checkForSlashTrigger}
			options={options}
			menuRenderFn={(
				anchorElementRef,
				{ selectedIndex, selectOptionAndCleanUp, setHighlightedIndex },
			) => {
				if (anchorElementRef.current == null || options.length === 0) {
					return null;
				}

				return anchorElementRef.current
					? createPortal(
							<div className="fade-in zoom-in z-50 min-w-48 animate-in overflow-hidden rounded-none border bg-background p-1 shadow-xl duration-150">
								<div className="max-h-[300px] overflow-y-auto">
									{options.map((option, i) => (
										<SlashCommandMenuItem
											index={i}
											isSelected={selectedIndex === i}
											onClick={() => {
												setHighlightedIndex(i);
												selectOptionAndCleanUp(option);
											}}
											onMouseEnter={() => {
												setHighlightedIndex(i);
											}}
											option={option}
											key={option.key}
										/>
									))}
								</div>
							</div>,
							anchorElementRef.current,
						)
					: null;
			}}
		/>
	);
}
