"use client";

import { $generateHtmlFromNodes, $generateNodesFromDOM } from "@lexical/html";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import type { EditorState } from "lexical";
import { $getRoot, $insertNodes } from "lexical";
import type { ReactNode } from "react";
import { useEffect, useMemo } from "react";

import { cn } from "@/lib/utils";
import { EditorNodes } from "./nodes";
import { EditorTheme } from "./themes/editor-theme";
import "./styles.css";

import {
	DesktopView,
	MobileTabletView,
	ResponsiveLayout,
} from "@/components/admin-ui/layout/responsive-layout";
import { RichEditorProvider, useRichEditorContext } from "./context";
import { RichEditorContentArea } from "./rich-editor-content-area";
import { RichEditorFooter } from "./rich-editor-footer";
import { RichEditorOutline } from "./rich-editor-outline";
import { RichEditorToolbar } from "./rich-editor-toolbar";
import { ToolbarLeftSlot, ToolbarRightSlot } from "./toolbar-slots";

// HTML Plugin to handle initial content and updates
const HtmlPlugin = ({
	initialHtml,
	onHtmlChange,
}: {
	initialHtml?: string;
	onHtmlChange: (html: string) => void;
}) => {
	const [editor] = useLexicalComposerContext();

	useEffect(() => {
		if (initialHtml !== undefined) {
			editor.update(() => {
				const currentHtml = $generateHtmlFromNodes(editor);
				if (currentHtml !== initialHtml) {
					const parser = new DOMParser();
					const dom = parser.parseFromString(initialHtml, "text/html");
					const nodes = $generateNodesFromDOM(editor, dom);
					$getRoot().clear();
					$getRoot().select();
					$insertNodes(nodes);
				}
			});
		}
	}, [editor, initialHtml]);

	return (
		<OnChangePlugin
			onChange={(editorState: EditorState) => {
				editorState.read(() => {
					const html = $generateHtmlFromNodes(editor);
					onHtmlChange(html);
				});
			}}
		/>
	);
};

interface RichEditorProps {
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
	className?: string;
	minHeight?: string;
	children?: ReactNode;
	disabledExtensions?: string[];
	disabledGroups?: string[];
}

interface CollectedChildren {
	toolbar: ReactNode;
	outline: ReactNode;
	contentArea: ReactNode;
	footer: ReactNode;
	outlineConfig: { style: "block" | "inset"; side: "left" | "right" } | null;
}

function collectChildren(children: ReactNode): CollectedChildren {
	const childrenArray = children
		? Array.isArray(children)
			? children
			: [children]
		: [];

	let toolbar: ReactNode = null;
	let outline: ReactNode = null;
	let contentArea: ReactNode = null;
	let footer: ReactNode = null;
	let outlineConfig: CollectedChildren["outlineConfig"] = null;

	for (const child of childrenArray) {
		if (!child || typeof child === "string" || typeof child === "number")
			continue;

		const childElement = child as React.ReactElement;
		const childType = childElement.type;
		const childProps = childElement.props;

		// Check for RichEditorToolbar component
		if (childType === RichEditorToolbar) {
			toolbar = child;
			continue;
		}

		// Check for RichEditorOutline component
		if (childType === RichEditorOutline) {
			outline = child;
			outlineConfig = {
				style: (childProps as { style?: "block" | "inset" }).style || "block",
				side: (childProps as { side?: "left" | "right" }).side || "left",
			};
			continue;
		}

		// Check for RichEditorContentArea component
		if (childType === RichEditorContentArea) {
			contentArea = child;
			continue;
		}

		// Check for RichEditorFooter component
		if (childType === RichEditorFooter) {
			footer = child;
			continue;
		}

		// Fallback: check for div with slots (legacy support or loose composition)
		if (
			childType === "div" &&
			childProps &&
			typeof childProps === "object" &&
			"children" in childProps &&
			Array.isArray(childProps.children)
		) {
			const hasLeftSlot = childProps.children.some(
				(c: ReactNode) => (c as React.ReactElement)?.type === ToolbarLeftSlot,
			);
			const hasRightSlot = childProps.children.some(
				(c: ReactNode) => (c as React.ReactElement)?.type === ToolbarRightSlot,
			);
			if (hasLeftSlot || hasRightSlot) {
				toolbar = child;
			}
		}
	}

	return { toolbar, outline, contentArea, footer, outlineConfig };
}

function RichEditorLayout({
	children,
	className,
	placeholder,
	minHeight,
}: {
	children: ReactNode;
	className?: string;
	placeholder?: string;
	minHeight?: string;
}) {
	const { outlineVisible, setHasOutline } = useRichEditorContext();
	const collected = useMemo(() => collectChildren(children), [children]);
	const { outlineConfig } = collected;

	useEffect(() => {
		setHasOutline(!!collected.outline);
	}, [collected.outline, setHasOutline]);

	// If no collected children, render default layout (Backward Compatibility)
	if (
		!collected.toolbar &&
		!collected.contentArea &&
		!collected.outline &&
		!collected.footer
	) {
		return (
			<div className={cn("relative flex w-full flex-col border", className)}>
				<RichEditorToolbar>{children}</RichEditorToolbar>
				<RichEditorContentArea
					placeholder={placeholder}
					minHeight={minHeight}
				/>
				<RichEditorFooter />
			</div>
		);
	}

	const isBlockStyle = outlineConfig?.style === "block";
	const isLeftSide = outlineConfig?.side === "left";
	const isOutlineVisible = !!collected.outline && outlineVisible;

	const renderDesktopContent = () => {
		if (!collected.toolbar) {
			return (
				<div className="flex h-full flex-col">
					{collected.outline}
					{collected.contentArea}
					{collected.footer}
				</div>
			);
		}

		if (isBlockStyle) {
			const gridCols = isOutlineVisible
				? isLeftSide
					? "grid-cols-[240px_1fr]"
					: "grid-cols-[1fr_240px]"
				: "grid-cols-1";

			return (
				<>
					<div className={cn("grid w-full items-start", gridCols)}>
						{isLeftSide && isOutlineVisible && (
							<div className="sticky top-0 h-screen overflow-y-auto border-r">
								{collected.outline}
							</div>
						)}

						<div className="flex min-w-0 flex-col">
							{collected.toolbar}
							{collected.contentArea}
						</div>

						{!isLeftSide && isOutlineVisible && (
							<div className="sticky top-0 h-screen overflow-y-auto border-l">
								{collected.outline}
							</div>
						)}
					</div>
					{collected.footer}
				</>
			);
		}

		const gridCols = isOutlineVisible
			? isLeftSide
				? "grid-cols-[240px_1fr]"
				: "grid-cols-[1fr_240px]"
			: "grid-cols-1";

		return (
			<>
				{collected.toolbar}
				<div className={cn("grid w-full items-start", gridCols)}>
					{isLeftSide && isOutlineVisible && (
						<div className="sticky top-13 h-[calc(100vh-3.25rem)] overflow-y-auto border-r">
							{collected.outline}
						</div>
					)}

					<div className="min-w-0 flex-1">{collected.contentArea}</div>

					{!isLeftSide && isOutlineVisible && (
						<div className="sticky top-13 h-[calc(100vh-3.25rem)] overflow-y-auto border-l">
							{collected.outline}
						</div>
					)}
				</div>
				{collected.footer}
			</>
		);
	};

	const renderMobileContent = () => {
		return (
			<>
				<div className="sticky top-0 z-20 flex flex-col bg-background shadow-sm">
					<div className="z-10">{collected.toolbar}</div>
					{isOutlineVisible && (
						<div className="max-h-[30vh] shrink-0 overflow-y-auto border-b bg-muted/5">
							{collected.outline}
						</div>
					)}
				</div>
				<div className="flex-1">{collected.contentArea}</div>
				{collected.footer}
			</>
		);
	};

	return (
		<ResponsiveLayout
			className={cn("relative flex w-full flex-col border", className)}
		>
			<DesktopView className="flex w-full flex-col">
				{renderDesktopContent()}
			</DesktopView>
			<MobileTabletView className="flex w-full flex-col">
				{renderMobileContent()}
			</MobileTabletView>
		</ResponsiveLayout>
	);
}

export function RichEditor({
	value,
	onChange,
	placeholder = "Start writing...",
	className,
	minHeight = "200px",
	children,
	disabledExtensions = [],
	disabledGroups = [],
}: RichEditorProps) {
	const initialConfig = {
		namespace: "RichEditor",
		theme: EditorTheme,
		onError(error: Error) {
			console.error(error);
		},
		nodes: EditorNodes,
		editable: true,
	};

	return (
		<LexicalComposer initialConfig={initialConfig}>
			<RichEditorProvider
				disabledExtensions={disabledExtensions}
				disabledGroups={disabledGroups}
			>
				<RichEditorLayout
					className={className}
					placeholder={placeholder}
					minHeight={minHeight}
				>
					{children}
				</RichEditorLayout>
				<HtmlPlugin initialHtml={value} onHtmlChange={onChange} />
			</RichEditorProvider>
		</LexicalComposer>
	);
}
