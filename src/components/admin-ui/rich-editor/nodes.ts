import { CodeHighlightNode, CodeNode } from "@lexical/code";
import { AutoLinkNode, LinkNode } from "@lexical/link";
import { ListItemNode, ListNode } from "@lexical/list";
import { MarkNode } from "@lexical/mark";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { TableCellNode, TableNode, TableRowNode } from "@lexical/table";
import type { Klass, LexicalNode } from "lexical";
import { CtaNode } from "./nodes/cta-node";
import { ImageNode } from "./nodes/image-node";

export const EditorNodes: Array<Klass<LexicalNode>> = [
	HeadingNode,
	ListNode,
	ListItemNode,
	QuoteNode,
	CodeNode,
	CodeHighlightNode,
	TableNode,
	TableCellNode,
	TableRowNode,
	AutoLinkNode,
	LinkNode,
	ImageNode,
	CtaNode,
	MarkNode,
];
