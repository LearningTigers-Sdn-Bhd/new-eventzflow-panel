"use client";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getRoot } from "lexical";
import { useEffect, useState } from "react";

export function WordCount() {
  const [editor] = useLexicalComposerContext();
  const [wordCount, setWordCount] = useState(0);

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const root = $getRoot();
        const text = root.getTextContent();
        // Simple word count: split by whitespace and filter empty strings
        const count = text.trim().split(/\s+/).filter((w) => w !== "").length;
        setWordCount(count);
      });
    });
  }, [editor]);

  return (
    <span className="px-4 text-muted-foreground text-xs">
      {wordCount} words
    </span>
  );
}
