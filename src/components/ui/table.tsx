import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

type TableProps = React.HTMLAttributes<HTMLTableElement> & {
  /** Pin the last column (e.g. Actions) to the right while scrolling horizontally. */
  stickyActions?: boolean;
  /** Cap table body height; keeps the top horizontal scrollbar visible while rows scroll. */
  maxHeight?: string;
};

const scrollBarClassName = cn(
  "w-full overflow-x-auto",
  "[scrollbar-gutter:stable]",
  "[&::-webkit-scrollbar]:h-2.5",
  "[&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-muted/60",
  "[&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-muted-foreground/35",
  "hover:[&::-webkit-scrollbar-thumb]:bg-muted-foreground/55",
);

const hideScrollBarClassName = cn(
  "w-full overflow-x-auto",
  "[scrollbar-width:none] [-ms-overflow-style:none]",
  "[&::-webkit-scrollbar]:h-0 [&::-webkit-scrollbar]:w-0",
);

const Table = React.forwardRef<HTMLTableElement, TableProps>(
  ({ className, stickyActions = false, maxHeight, ...props }, ref) => {
    const scrollRef = React.useRef<HTMLDivElement>(null);
    const topScrollRef = React.useRef<HTMLDivElement>(null);
    const syncingScroll = React.useRef(false);
    const [canScrollLeft, setCanScrollLeft] = React.useState(false);
    const [canScrollRight, setCanScrollRight] = React.useState(false);
    const [hasOverflow, setHasOverflow] = React.useState(false);
    const [contentWidth, setContentWidth] = React.useState(0);

    const updateScrollHints = React.useCallback(() => {
      const el = scrollRef.current;
      if (!el) {
        setCanScrollLeft(false);
        setCanScrollRight(false);
        setHasOverflow(false);
        setContentWidth(0);
        return;
      }
      const maxScroll = el.scrollWidth - el.clientWidth;
      const overflow = maxScroll > 2;
      setHasOverflow(overflow);
      setContentWidth(el.scrollWidth);
      setCanScrollLeft(overflow && el.scrollLeft > 2);
      setCanScrollRight(overflow && el.scrollLeft < maxScroll - 2);
    }, []);

    const syncFrom = React.useCallback((source: "top" | "main") => {
      const main = scrollRef.current;
      const top = topScrollRef.current;
      if (!main || !top || syncingScroll.current) return;
      syncingScroll.current = true;
      if (source === "top") {
        main.scrollLeft = top.scrollLeft;
      } else {
        top.scrollLeft = main.scrollLeft;
      }
      syncingScroll.current = false;
      updateScrollHints();
    }, [updateScrollHints]);

    React.useEffect(() => {
      const el = scrollRef.current;
      if (!el) return;

      updateScrollHints();

      const resizeObserver = new ResizeObserver(updateScrollHints);
      resizeObserver.observe(el);
      if (el.firstElementChild) resizeObserver.observe(el.firstElementChild);

      const mutationObserver = new MutationObserver(updateScrollHints);
      mutationObserver.observe(el, { childList: true, subtree: true, characterData: true });

      window.addEventListener("resize", updateScrollHints);

      return () => {
        resizeObserver.disconnect();
        mutationObserver.disconnect();
        window.removeEventListener("resize", updateScrollHints);
      };
    }, [updateScrollHints]);

    React.useEffect(() => {
      if (!hasOverflow) return;
      const main = scrollRef.current;
      const top = topScrollRef.current;
      if (!main || !top) return;
      top.scrollLeft = main.scrollLeft;
    }, [hasOverflow, contentWidth]);

    function scrollByDir(dir: "left" | "right") {
      const el = scrollRef.current;
      if (!el) return;
      el.scrollBy({ left: dir === "right" ? 220 : -220, behavior: "smooth" });
    }

    return (
      <div className={cn("min-w-0 w-full", maxHeight && "flex min-h-0 flex-col")} style={maxHeight ? { maxHeight } : undefined}>
        {hasOverflow && (
          <div
            ref={topScrollRef}
            aria-hidden
            onScroll={() => syncFrom("top")}
            className={cn(scrollBarClassName, "mb-1.5 h-2.5 shrink-0")}
          >
            <div className="h-2.5" style={{ width: Math.max(contentWidth, 1) }} />
          </div>
        )}

        <div className={cn("relative min-w-0 w-full", maxHeight && "min-h-0 flex-1 overflow-y-auto")}>
          <div
            ref={scrollRef}
            onScroll={() => syncFrom("main")}
            className={cn(hideScrollBarClassName, "min-w-0")}
          >
            <table
              ref={ref}
              className={cn(
                "w-full min-w-max table-auto caption-bottom text-sm [&_td:first-child]:pl-6 [&_th:first-child]:pl-6",
                maxHeight &&
                  "[&_thead]:sticky [&_thead]:top-0 [&_thead]:z-20 [&_thead]:bg-card [&_thead]:shadow-[0_1px_0_hsl(var(--border))]",
                stickyActions &&
                  cn(
                    "[&_th:last-child]:sticky [&_th:last-child]:right-0 [&_th:last-child]:z-30",
                    "[&_th:last-child]:bg-card [&_th:last-child]:shadow-[-6px_0_8px_-6px_rgba(0,0,0,0.15)]",
                    "[&_td:last-child]:sticky [&_td:last-child]:right-0 [&_td:last-child]:z-20",
                    "[&_td:last-child]:bg-card [&_td:last-child]:shadow-[-6px_0_8px_-6px_rgba(0,0,0,0.15)]",
                    "[&_tr:hover>td:last-child]:bg-muted",
                    "[&_tr[data-state=selected]>td:last-child]:bg-muted",
                  ),
                className,
              )}
              {...props}
            />
          </div>

          <div
            aria-hidden
            className={cn(
              "pointer-events-none absolute inset-y-0 left-0 z-10 w-8 bg-gradient-to-r from-card to-transparent transition-opacity",
              canScrollLeft ? "opacity-100" : "opacity-0",
            )}
          />
          {!stickyActions && (
            <div
              aria-hidden
              className={cn(
                "pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-card to-transparent transition-opacity",
                canScrollRight ? "opacity-100" : "opacity-0",
              )}
            />
          )}

          {canScrollLeft && (
            <button
              type="button"
              aria-label="Scroll table left"
              onClick={() => scrollByDir("left")}
              className="absolute left-1 top-1/2 z-40 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full border border-border/60 bg-background/80 text-muted-foreground shadow-sm hover:bg-muted hover:text-foreground"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          )}
          {canScrollRight && (
            <button
              type="button"
              aria-label="Scroll table right"
              onClick={() => scrollByDir("right")}
              className={cn(
                "absolute top-1/2 z-40 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full border border-border/60 bg-background/80 text-muted-foreground shadow-sm hover:bg-muted hover:text-foreground",
                stickyActions ? "right-16" : "right-1",
              )}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    );
  },
);
Table.displayName = "Table";

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead ref={ref} className={cn("[&_tr]:border-b", className)} {...props} />
));
TableHeader.displayName = "TableHeader";

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody ref={ref} className={cn("[&_tr:last-child]:border-0", className)} {...props} />
));
TableBody.displayName = "TableBody";

const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn("border-t bg-muted/50 font-medium [&>tr]:last:border-b-0", className)}
    {...props}
  />
));
TableFooter.displayName = "TableFooter";

const TableRow = React.forwardRef<HTMLTableRowElement, React.HTMLAttributes<HTMLTableRowElement>>(
  ({ className, ...props }, ref) => (
    <tr
      ref={ref}
      className={cn(
        "border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
        className,
      )}
      {...props}
    />
  ),
);
TableRow.displayName = "TableRow";

const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      "h-8 whitespace-nowrap px-2 py-1 text-left align-middle text-xs font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
      className,
    )}
    {...props}
  />
));
TableHead.displayName = "TableHead";

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn(
      "whitespace-nowrap px-2 py-1 align-middle text-sm leading-5 [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
      className,
    )}
    {...props}
  />
));
TableCell.displayName = "TableCell";

const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption ref={ref} className={cn("mt-4 text-sm text-muted-foreground", className)} {...props} />
));
TableCaption.displayName = "TableCaption";

export { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption };
