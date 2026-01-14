"use client";

import type {
	EditorConfig,
	LexicalNode,
	NodeKey,
	SerializedLexicalNode,
	Spread,
} from "lexical";
import { $applyNodeReplacement, DecoratorNode } from "lexical";
import * as React from "react";
import { Suspense } from "react";

const CtaComponent = React.lazy(() => import("./cta-component"));

export interface CtaPayload {
	title?: string;
	description?: string;
	buttonText?: string;
	buttonUrl?: string;
	key?: NodeKey;
}

export type SerializedCtaNode = Spread<
	{
		title: string;
		description: string;
		buttonText: string;
		buttonUrl: string;
	},
	SerializedLexicalNode
>;

export class CtaNode extends DecoratorNode<React.ReactNode> {
	__title: string;
	__description: string;
	__buttonText: string;
	__buttonUrl: string;

	static getType(): string {
		return "cta-block";
	}

	static clone(node: CtaNode): CtaNode {
		return new CtaNode(
			node.__title,
			node.__description,
			node.__buttonText,
			node.__buttonUrl,
			node.__key,
		);
	}

	static importJSON(serializedNode: SerializedCtaNode): CtaNode {
		const { title, description, buttonText, buttonUrl } = serializedNode;
		const node = $createCtaNode({
			title,
			description,
			buttonText,
			buttonUrl,
		});
		return node;
	}

	constructor(
		title?: string,
		description?: string,
		buttonText?: string,
		buttonUrl?: string,
		key?: NodeKey,
	) {
		super(key);
		this.__title = title || "";
		this.__description = description || "";
		this.__buttonText = buttonText || "Get Started";
		this.__buttonUrl = buttonUrl || "";
	}

	exportJSON(): SerializedCtaNode {
		return {
			title: this.__title,
			description: this.__description,
			buttonText: this.__buttonText,
			buttonUrl: this.__buttonUrl,
			type: "cta-block",
			version: 1,
		};
	}

	updateAttributes(attributes: {
		title?: string;
		description?: string;
		buttonText?: string;
		buttonUrl?: string;
	}): void {
		const writable = this.getWritable();
		if (attributes.title !== undefined) writable.__title = attributes.title;
		if (attributes.description !== undefined)
			writable.__description = attributes.description;
		if (attributes.buttonText !== undefined)
			writable.__buttonText = attributes.buttonText;
		if (attributes.buttonUrl !== undefined)
			writable.__buttonUrl = attributes.buttonUrl;
	}

	createDOM(_config: EditorConfig): HTMLElement {
		const div = document.createElement("div");
		div.className = "cta-block";
		return div;
	}

	updateDOM(): boolean {
		return false;
	}

	decorate(): React.ReactNode {
		return (
			<Suspense fallback={null}>
				<CtaComponent
					title={this.__title}
					description={this.__description}
					buttonText={this.__buttonText}
					buttonUrl={this.__buttonUrl}
					nodeKey={this.getKey()}
				/>
			</Suspense>
		);
	}
}

export function $createCtaNode({
	title,
	description,
	buttonText,
	buttonUrl,
	key,
}: CtaPayload): CtaNode {
	return $applyNodeReplacement(
		new CtaNode(title, description, buttonText, buttonUrl, key),
	);
}

export function $isCtaNode(
	node: LexicalNode | null | undefined,
): node is CtaNode {
	return node instanceof CtaNode;
}
