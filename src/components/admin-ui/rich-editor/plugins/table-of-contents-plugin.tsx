"use client";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $isHeadingNode } from "@lexical/rich-text";
import { $getRoot, $isElementNode, type LexicalNode } from "lexical";
import { useCallback, useEffect, useMemo } from "react";
import { type TocItem, useRichEditorContext } from "../context";

function debounce<T extends (...args: unknown[]) => void>(
  fn: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), wait);
  };
}

function areHeadingsEqual(a: TocItem[], b: TocItem[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (
      a[i].id !== b[i].id ||
      a[i].text !== b[i].text ||
      a[i].level !== b[i].level ||
      a[i].position !== b[i].position
    ) {
      return false;
    }
  }
  return true;
}

function extractTocItems(root: LexicalNode): TocItem[] {
  const tocItems: TocItem[] = [];
  let currentPosition = 0;

  function findHeadingsRecursively(node: LexicalNode) {
    if ($isHeadingNode(node)) {
      const tag = node.getTag();
      const level = Number.parseInt(tag.replace("h", ""), 10);
      const text = node.getTextContent();
      const id = node.getKey();

      tocItems.push({
        id,
        text,
        level,
        position: currentPosition,
      });

      currentPosition++;
    }

    if ($isElementNode(node)) {
      const children = node.getChildren();
      for (const child of children) {
        findHeadingsRecursively(child);
      }
    }
  }

  // Deep traversal: check all descendants, not just direct children
  if ($isElementNode(root)) {
    const children = root.getChildren();
    for (const child of children) {
      findHeadingsRecursively(child);
    }
  }

  return tocItems;
}

export function TableOfContentsPlugin() {
  const [editor] = useLexicalComposerContext();
  const { setToc } = useRichEditorContext();

  const updateToc = useCallback(() => {
    editor.getEditorState().read(() => {
      const root = $getRoot();
      const tocItems = extractTocItems(root);

      setToc((prev) => {
        if (areHeadingsEqual(prev, tocItems)) return prev;
        return tocItems;
      });
    });
  }, [editor, setToc]);

  // 200ms debounce (user requirement)
  const debouncedUpdate = useMemo(() => debounce(updateToc, 200), [updateToc]);

  useEffect(() => {
    // Initial update
    updateToc();

    return editor.registerUpdateListener(() => {
      debouncedUpdate();
    });
  }, [editor, debouncedUpdate, updateToc]);

  return null;
}
