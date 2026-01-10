"use client";

import type { SuggestionProps } from "@tiptap/suggestion";
import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { cn } from "@/lib/utils";
import type { SuggestionItem } from "./extensions/slash-commands";

export interface CommandListProps extends SuggestionProps<SuggestionItem> {}

export interface CommandListRef {
  onKeyDown: (props: { event: KeyboardEvent }) => boolean;
}

export const CommandList = forwardRef<CommandListRef, CommandListProps>(
  (props, ref) => {
    const [selectedIndex, setSelectedIndex] = useState(0);

    const selectItem = (index: number) => {
      const item = props.items[index];
      if (item) {
        props.command(item);
      }
    };

    useEffect(() => setSelectedIndex(0), []);

    useImperativeHandle(ref, () => ({
      onKeyDown: ({ event }: { event: KeyboardEvent }) => {
        if (event.key === "ArrowUp") {
          setSelectedIndex(
            (selectedIndex + props.items.length - 1) % props.items.length,
          );
          return true;
        }

        if (event.key === "ArrowDown") {
          setSelectedIndex((selectedIndex + 1) % props.items.length);
          return true;
        }

        if (event.key === "Enter") {
          selectItem(selectedIndex);
          return true;
        }

        return false;
      },
    }));

    return (
      <div className="fade-in zoom-in z-50 min-w-75 animate-in overflow-hidden rounded-lg border bg-background p-1 shadow-xl duration-150">
        <div className="px-2 py-1.5 font-medium text-[10px] text-muted-foreground uppercase tracking-wider">
          Blocks
        </div>
        {props.items.length > 0 ? (
          props.items.map((item, index) => (
            <button
              key={item.title}
              type="button"
              onClick={() => selectItem(index)}
              className={cn(
                "flex w-full items-center gap-3 rounded-md px-2 py-2 text-left text-sm transition-colors",
                index === selectedIndex
                  ? "bg-accent text-accent-foreground"
                  : "hover:bg-muted",
              )}
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border bg-muted/50 group-hover:bg-background">
                <item.icon className="h-4 w-4" />
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="font-medium">{item.title}</span>
                <span className="truncate text-muted-foreground text-xs">
                  {item.description}
                </span>
              </div>
            </button>
          ))
        ) : (
          <div className="px-2 py-1.5 text-muted-foreground text-sm">
            No results found
          </div>
        )}
      </div>
    );
  },
);

CommandList.displayName = "CommandList";
