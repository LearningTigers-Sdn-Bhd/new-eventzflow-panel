"use client";

import { type Editor, Extension, type Range } from "@tiptap/core";
import Suggestion from "@tiptap/suggestion";
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

export interface SuggestionItem {
	title: string;
	description: string;
	icon: LucideIcon;
	command: (props: { editor: Editor; range: Range }) => void;
}

export const SlashCommands = Extension.create({
	name: "slashCommands",

	addOptions() {
		return {
			suggestion: {
				char: "/",
				command: ({
					editor,
					range,
					props,
				}: {
					editor: Editor;
					range: Range;
					props: SuggestionItem;
				}) => {
					props.command({ editor, range });
				},
			},
		};
	},

	addProseMirrorPlugins() {
		return [
			Suggestion({
				editor: this.editor,
				...this.options.suggestion,
			}),
		];
	},
});

export const suggestionItems: SuggestionItem[] = [
	{
		title: "Heading 1",
		description: "Big section heading",
		icon: Heading1,
		command: ({ editor, range }: { editor: Editor; range: Range }) => {
			editor
				.chain()
				.focus()
				.deleteRange(range)
				.setNode("heading", { level: 1 })
				.run();
		},
	},
	{
		title: "Heading 2",
		description: "Medium section heading",
		icon: Heading2,
		command: ({ editor, range }: { editor: Editor; range: Range }) => {
			editor
				.chain()
				.focus()
				.deleteRange(range)
				.setNode("heading", { level: 2 })
				.run();
		},
	},
	{
		title: "Heading 3",
		description: "Small section heading",
		icon: Heading3,
		command: ({ editor, range }: { editor: Editor; range: Range }) => {
			editor
				.chain()
				.focus()
				.deleteRange(range)
				.setNode("heading", { level: 3 })
				.run();
		},
	},
	{
		title: "Bullet List",
		description: "Create a simple bullet list",
		icon: List,
		command: ({ editor, range }: { editor: Editor; range: Range }) => {
			editor.chain().focus().deleteRange(range).toggleBulletList().run();
		},
	},
	{
		title: "Numbered List",
		description: "Create a list with numbering",
		icon: ListOrdered,
		command: ({ editor, range }: { editor: Editor; range: Range }) => {
			editor.chain().focus().deleteRange(range).toggleOrderedList().run();
		},
	},
	{
		title: "Checklist",
		description: "Create a task list with checkboxes",
		icon: ListTodo,
		command: ({ editor, range }: { editor: Editor; range: Range }) => {
			editor.chain().focus().deleteRange(range).toggleTaskList().run();
		},
	},
	{
		title: "CTA Block",
		description: "Insert a call-to-action block",
		icon: Megaphone,
		command: ({ editor, range }: { editor: Editor; range: Range }) => {
			editor
				.chain()
				.focus()
				.deleteRange(range)
				.insertContent({ type: "ctaBlock" })
				.run();
		},
	},
	{
		title: "Quote",
		description: "Capture a quotation",
		icon: Quote,
		command: ({ editor, range }: { editor: Editor; range: Range }) => {
			editor.chain().focus().deleteRange(range).toggleBlockquote().run();
		},
	},
	{
		title: "Code Block",
		description: "Code snippet with highlighting",
		icon: Code,
		command: ({ editor, range }: { editor: Editor; range: Range }) => {
			editor.chain().focus().deleteRange(range).toggleCodeBlock().run();
		},
	},
	{
		title: "Table",
		description: "Insert a 3x3 table",
		icon: Table,
		command: ({ editor, range }: { editor: Editor; range: Range }) => {
			editor
				.chain()
				.focus()
				.deleteRange(range)
				.insertTable({ rows: 3, cols: 3, withHeaderRow: true })
				.run();
		},
	},
];
