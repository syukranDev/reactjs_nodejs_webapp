"use client";

import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown, ChevronUp } from "lucide-react";

import { cn } from "@/lib/utils";

const Select = SelectPrimitive.Root;

const SelectGroup = SelectPrimitive.Group;

const SelectValue = SelectPrimitive.Value;

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      "flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background cursor-pointer data-[placeholder]:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
      className,
    )}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <ChevronDown className="h-4 w-4 opacity-50" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
));
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

const SelectScrollUpButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollUpButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollUpButton
    ref={ref}
    className={cn("flex cursor-default items-center justify-center py-1", className)}
    {...props}
  >
    <ChevronUp className="h-4 w-4" />
  </SelectPrimitive.ScrollUpButton>
));
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName;

const SelectScrollDownButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollDownButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollDownButton
    ref={ref}
    className={cn("flex cursor-default items-center justify-center py-1", className)}
    {...props}
  >
    <ChevronDown className="h-4 w-4" />
  </SelectPrimitive.ScrollDownButton>
));
SelectScrollDownButton.displayName = SelectPrimitive.ScrollDownButton.displayName;

function selectItemSearchText(node: React.ReactNode): string {
  if (node == null || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(selectItemSearchText).join(" ");
  if (React.isValidElement(node)) {
    const props = node.props as { children?: React.ReactNode };
    return selectItemSearchText(props.children);
  }
  return "";
}

const SEARCH_FOCUS_GRACE_MS = 1000;
let searchInteractedAt = 0;

function noteSearchInteraction() {
  searchInteractedAt = Date.now();
}

let openedViewportHeight = 0;

function keyboardOrSearchIsActive() {
  if (Date.now() - searchInteractedAt < SEARCH_FOCUS_GRACE_MS) return true;
  const active = document.activeElement;
  if (active instanceof Element && active.closest("[data-select-search]")) return true;
  const height = window.visualViewport?.height ?? window.innerHeight;
  return openedViewportHeight - height > 80;
}

function useKeepSelectOpenWhileSearching() {
  const restoreRef = React.useRef<(() => void) | null>(null);

  React.useLayoutEffect(() => {
    openedViewportHeight = window.visualViewport?.height ?? window.innerHeight;
    const origAdd = window.addEventListener.bind(window);
    const origRemove = window.removeEventListener.bind(window);
    const wrapped = new Map<EventListener, EventListener>();

    window.addEventListener = ((
      type: string,
      listener: EventListenerOrEventListenerObject,
      options?: boolean | AddEventListenerOptions,
    ) => {
      if ((type === "resize" || type === "blur") && typeof listener === "function") {
        const wrap: EventListener = (event) => {
          if (keyboardOrSearchIsActive()) return;
          listener(event);
        };
        wrapped.set(listener, wrap);
        origAdd(type, wrap, options);
        return;
      }
      origAdd(type, listener, options);
    }) as typeof window.addEventListener;

    window.removeEventListener = ((
      type: string,
      listener: EventListenerOrEventListenerObject,
      options?: boolean | EventListenerOptions,
    ) => {
      if (typeof listener === "function" && wrapped.has(listener)) {
        const wrap = wrapped.get(listener);
        wrapped.delete(listener);
        if (wrap) origRemove(type, wrap, options);
        return;
      }
      origRemove(type, listener, options);
    }) as typeof window.removeEventListener;

    restoreRef.current = () => {
      window.addEventListener = origAdd;
      window.removeEventListener = origRemove;
    };
  }, []);

  React.useEffect(() => {
    return () => restoreRef.current?.();
  }, []);
}

function filterSelectChildren(children: React.ReactNode, query: string): { nodes: React.ReactNode; matchCount: number } {
  let matchCount = 0;
  const nodes = React.Children.map(children, (child) => {
    if (!React.isValidElement(child)) return child;
    const type = child.type as { displayName?: string };
    if (type?.displayName === "SelectItem") {
      const props = child.props as { children?: React.ReactNode; value?: string; className?: string };
      const text = `${selectItemSearchText(props.children)} ${props.value ?? ""}`.toLowerCase();
      if (text.includes(query)) {
        matchCount += 1;
        return child;
      }
      return React.cloneElement(child, { className: cn(props.className, "hidden") });
    }
    const nested = (child.props as { children?: React.ReactNode }).children;
    if (nested != null) {
      const next = filterSelectChildren(nested, query);
      matchCount += next.matchCount;
      return React.cloneElement(child, undefined, next.nodes);
    }
    return child;
  });
  return { nodes, matchCount };
}

const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = "popper", ...props }, ref) => {
  const [search, setSearch] = React.useState("");
  const searchRef = React.useRef<HTMLInputElement>(null);
  const choosingItemRef = React.useRef(false);
  const refocusTries = React.useRef(0);
  const query = search.trim().toLowerCase();
  const filtered = query ? filterSelectChildren(children, query) : { nodes: children, matchCount: 1 };
  useKeepSelectOpenWhileSearching();

  React.useEffect(() => {
    if (!window.matchMedia("(pointer: coarse)").matches) return;
    const handle = window.setTimeout(() => {
      noteSearchInteraction();
      searchRef.current?.focus({ preventScroll: true });
    }, 0);
    return () => window.clearTimeout(handle);
  }, []);

  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        ref={ref}
        className={cn(
          "relative z-50 max-h-(--radix-select-content-available-height) min-w-[8rem] overflow-y-auto overflow-x-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-(--radix-select-content-transform-origin)",
          position === "popper" &&
            "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
          className,
        )}
        position={position}
        {...props}
      >
        <div
          data-select-search=""
          className="sticky top-0 z-10 border-b border-border bg-popover p-1.5"
          onPointerDown={(event) => {
            noteSearchInteraction();
            event.stopPropagation();
          }}
          onTouchStart={() => noteSearchInteraction()}
        >
          <input
            ref={searchRef}
            value={search}
            placeholder="Search"
            autoComplete="off"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            enterKeyHint="search"
            className="flex h-8 w-full rounded-md border border-input bg-transparent px-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring"
            onChange={(event) => setSearch(event.target.value)}
            onFocus={noteSearchInteraction}
            onKeyDown={(event) => event.stopPropagation()}
            onBlur={(event) => {
              if (choosingItemRef.current || refocusTries.current > 4) return;
              const next = event.relatedTarget;
              const movedToOption = next instanceof Element && next.getAttribute("role") === "option";
              const keyboardBlur = next == null && window.matchMedia("(pointer: coarse)").matches;
              if (!movedToOption && !keyboardBlur) return;
              noteSearchInteraction();
              refocusTries.current += 1;
              requestAnimationFrame(() => {
                if (!choosingItemRef.current) searchRef.current?.focus({ preventScroll: true });
              });
            }}
          />
        </div>
        <SelectScrollUpButton />
        <SelectPrimitive.Viewport
          className={cn(
            "p-1",
          position === "popper" && "w-full min-w-[var(--radix-select-trigger-width)]",
          )}
          onPointerDownCapture={() => {
            choosingItemRef.current = true;
          }}
          onPointerUpCapture={() => {
            window.setTimeout(() => {
              choosingItemRef.current = false;
            }, 300);
          }}
        >
          {filtered.nodes}
          {query && filtered.matchCount === 0 ? (
            <div className="px-2 py-1.5 text-sm text-muted-foreground">No matches</div>
          ) : null}
        </SelectPrimitive.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
});
SelectContent.displayName = SelectPrimitive.Content.displayName;

const SelectLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={cn("px-2 py-1.5 text-sm font-semibold", className)}
    {...props}
  />
));
SelectLabel.displayName = SelectPrimitive.Label.displayName;

const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className,
    )}
    {...props}
  >
    <span className="absolute right-2 flex h-3.5 w-3.5 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <Check className="h-4 w-4" />
      </SelectPrimitive.ItemIndicator>
    </span>
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
));
SelectItem.displayName = SelectPrimitive.Item.displayName;

const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-muted", className)}
    {...props}
  />
));
SelectSeparator.displayName = SelectPrimitive.Separator.displayName;

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
};
