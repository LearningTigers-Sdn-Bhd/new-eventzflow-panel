"use client";

import { ListTree, X } from "lucide-react";
import parse, {
  type DOMNode,
  domToReact,
  Element,
  type HTMLReactParserOptions,
  Text,
} from "html-react-parser";
import DOMPurify from "isomorphic-dompurify";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  DesktopView,
  MobileTabletView,
  ResponsiveLayout,
} from "@/components/admin-ui/layout/responsive-layout";
import { cn } from "@/lib/utils";
import { CtaBlockView } from "./extensions/cta-block-view";

// --- Context & Types ---

interface Heading {
  id: string;
  text: string;
  level: number;
}

interface PublicContentContextValue {
  content: ReactNode;
  headings: Heading[];
  activeId: string | null;
  contentRef: React.RefObject<HTMLDivElement | null>;
  scrollToHeading: (id: string) => void;
  navVisible: boolean;
  setNavVisible: (visible: boolean) => void;
}

const PublicContentContext = createContext<PublicContentContextValue | null>(
  null,
);

export function usePublicContentContext() {
  const context = useContext(PublicContentContext);
  if (!context) {
    throw new Error(
      "usePublicContentContext must be used within a PublicContent",
    );
  }
  return context;
}

// --- Provider Component ---

interface PublicContentProps {
  value: string;
  navVisible?: boolean;
  children?: ReactNode;
  className?: string;
}

export function PublicContent({
  value,
  navVisible: initialNavVisible = true,
  children,
  className,
}: PublicContentProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [navVisible, setNavVisible] = useState(initialNavVisible);
  const contentRef = useRef<HTMLDivElement>(null);

  // Sync with prop if it changes
  useEffect(() => {
    setNavVisible(initialNavVisible);
  }, [initialNavVisible]);

  // Parse content and extract headings
  const { content, headings } = useMemo(() => {
    const extractedHeadings: Heading[] = [];
    const idCounts: Record<string, number> = {};
    const sanitized = DOMPurify.sanitize(value, {
      ADD_ATTR: [
        "data-type",
        "data-title",
        "data-description",
        "data-button-text",
        "data-button-url",
      ],
    });

    const options: HTMLReactParserOptions = {
      replace: (domNode) => {
        if (domNode instanceof Element && domNode.attribs) {
          // Handle CTA Block
          if (
            domNode.name === "div" &&
            domNode.attribs["data-type"] === "cta-block"
          ) {
            return (
              <CtaBlockView
                title={domNode.attribs["data-title"]}
                description={domNode.attribs["data-description"]}
                buttonText={domNode.attribs["data-button-text"]}
                buttonUrl={domNode.attribs["data-button-url"]}
              />
            );
          }

          // Handle Headings for TOC
          if (/^h[1-3]$/.test(domNode.name)) {
            const level = Number.parseInt(domNode.name.substring(1), 10);
            const firstChild = domNode.children[0];
            const text =
              firstChild instanceof Text ? firstChild.data : "Untitled";
            let id = text.toLowerCase().replace(/[^a-z0-9]+/g, "-");

            // Ensure ID uniqueness
            if (idCounts[id] !== undefined) {
              idCounts[id]++;
              id = `${id}-${idCounts[id]}`;
            } else {
              idCounts[id] = 0;
            }

            extractedHeadings.push({ id, text, level });

            const Tag = domNode.name as "h1" | "h2" | "h3";
            return (
              <Tag {...domNode.attribs} id={id}>
                {domToReact(domNode.children as DOMNode[], options)}
              </Tag>
            );
          }
        }
      },
    };

    return {
      content: parse(sanitized, options),
      headings: extractedHeadings,
    };
  }, [value]);

  // Scroll spy
  useEffect(() => {
    if (!navVisible || headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: "-10% 0% -80% 0%" },
    );

    // We need to wait for the DOM to update with the new parsed content
    setTimeout(() => {
      const headingElements =
        contentRef.current?.querySelectorAll("h1, h2, h3");
      headingElements?.forEach((el) => {
        observer.observe(el);
      });
    }, 0);

    return () => observer.disconnect();
  }, [navVisible, headings]); // re-run when content updates (via headings)

  const scrollToHeading = useCallback((id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -80;
      const y =
        element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
      setActiveId(id);
    }
  }, []);

  const contextValue = useMemo(
    () => ({
      content,
      headings,
      activeId,
      contentRef,
      scrollToHeading,
      navVisible,
      setNavVisible,
    }),
    [content, headings, activeId, scrollToHeading, navVisible],
  );

  return (
    <PublicContentContext.Provider value={contextValue}>
      <ResponsiveLayout
        className={cn("relative flex w-full flex-col border", className)}
      >
        <DesktopView className="flex w-full flex-col">{children}</DesktopView>
        <MobileTabletView className="flex w-full flex-col">
          {children}
        </MobileTabletView>
      </ResponsiveLayout>
    </PublicContentContext.Provider>
  );
}

// --- Sub-components ---

interface PublicContentOutlineProps {
  className?: string;
  style?: "block" | "inset";
  side?: "left" | "right";
}

export function PublicContentOutline({
  className,
  style = "block",
  side = "left",
}: PublicContentOutlineProps) {
  const { headings, activeId, scrollToHeading, navVisible, setNavVisible } =
    usePublicContentContext();

  if (!navVisible || headings.length === 0) return null;

  const containerClass = cn(
    "flex h-screen flex-col overflow-hidden bg-card transition-all duration-200",
    style === "block" && "sticky top-0 w-64 shrink-0 border",
    style === "inset" && "h-full w-full border-x shadow-sm",
    side === "right" && style === "block" && "border-l",
    side === "left" && style === "block" && "border-r",
    className,
  );

  return (
    <div className={containerClass}>
      <div className="flex shrink-0 items-center justify-between gap-2 border-b px-4 py-4">
        <div className="flex items-center gap-2">
          <ListTree className="size-4" />
          <span className="font-semibold text-sm">Table of Contents</span>
        </div>
        <button
          type="button"
          onClick={() => setNavVisible(false)}
          className="rounded-md p-1 hover:bg-muted"
          title="Close sidebar"
        >
          <X className="size-4" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        <nav className="space-y-1 pb-10">
          {headings.map((heading) => (
            <button
              key={heading.id}
              type="button"
              onClick={() => scrollToHeading(heading.id)}
              className={cn(
                "group flex w-full items-start gap-2 border-transparent border-l-2 px-2 py-1.5 text-left text-xs transition-all hover:bg-muted",
                heading.level === 1 ? "font-bold" : "text-muted-foreground",
                heading.level === 2 && "pl-4",
                heading.level === 3 && "pl-6",
                activeId === heading.id &&
                  "border-primary bg-muted text-primary",
              )}
            >
              <svg
                className={cn(
                  "mt-0.5 h-3 w-3 shrink-0 opacity-0 group-hover:opacity-50",
                  activeId === heading.id && "text-primary opacity-100",
                )}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <title>Hash icon</title>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"
                />
              </svg>
              <span className="truncate">{heading.text || "Untitled"}</span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}

interface PublicContentAreaProps {
  className?: string;
  children?: ReactNode;
}

export function PublicContentArea({
  className,
  children,
}: PublicContentAreaProps) {
  const { content, contentRef, navVisible, setNavVisible, headings } =
    usePublicContentContext();

  return (
    <div className={cn("relative min-h-screen flex-1", className)}>
      {!navVisible && headings.length > 0 && (
        <button
          type="button"
          onClick={() => setNavVisible(true)}
          className="sticky top-2.5 left-2.5 z-30 flex size-10 items-center justify-center rounded-md border bg-background opacity-50 shadow-sm transition-all hover:opacity-100"
          title="Show table of contents"
        >
          <ListTree className="size-5" />
        </button>
      )}
      {children}
      <div className="flex-1" ref={contentRef}>
        <div className="tiptap prose prose-sm dark:prose-invert max-w-none px-4 py-8 md:px-12">
          {content}
        </div>
      </div>
    </div>
  );
}
