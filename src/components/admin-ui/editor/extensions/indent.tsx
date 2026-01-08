"use client";

import { Extension } from "@tiptap/core";

export interface IndentOptions {
	types: string[];
	minIndent: number;
	maxIndent: number;
}

declare module "@tiptap/core" {
	interface Commands<ReturnType> {
		indent: {
			/**
			 * Set the indent attribute
			 */
			indent: () => ReturnType;
			/**
			 * Unset the indent attribute
			 */
			outdent: () => ReturnType;
		};
	}
}

export const Indent = Extension.create<IndentOptions>({
	name: "indent",

	addOptions() {
		return {
			types: ["heading", "paragraph"],
			minIndent: 0,
			maxIndent: 8,
		};
	},

	addGlobalAttributes() {
		return [
			{
				types: this.options.types,
				attributes: {
					indent: {
						default: 0,
						parseHTML: (element) => Number.parseInt(element.style.marginLeft, 10) / 2 || 0,
						renderHTML: (attributes) => {
							if (!attributes.indent) {
								return {};
							}

							return {
								style: `margin-left: ${attributes.indent * 2}rem;`,
							};
						},
					},
				},
			},
		];
	},

	addCommands() {
		return {
			indent:
				() =>
				({ tr, state, dispatch }) => {
					const { selection } = state;
					tr = tr.setSelection(selection);
					tr.doc.nodesBetween(selection.from, selection.to, (node, pos) => {
						if (this.options.types.includes(node.type.name)) {
							const indent = (node.attrs.indent || 0) + 1;
							if (indent <= this.options.maxIndent) {
								tr = tr.setNodeMarkup(pos, undefined, {
									...node.attrs,
									indent,
								});
							}
						}
					});

					if (dispatch) dispatch(tr);
					return true;
				},
			outdent:
				() =>
				({ tr, state, dispatch }) => {
					const { selection } = state;
					tr = tr.setSelection(selection);
					tr.doc.nodesBetween(selection.from, selection.to, (node, pos) => {
						if (this.options.types.includes(node.type.name)) {
							const indent = (node.attrs.indent || 0) - 1;
							if (indent >= this.options.minIndent) {
								tr = tr.setNodeMarkup(pos, undefined, {
									...node.attrs,
									indent,
								});
							}
						}
					});

					if (dispatch) dispatch(tr);
					return true;
				},
		};
	},
});
