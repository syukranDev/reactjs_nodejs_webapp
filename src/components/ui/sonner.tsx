import {
  CircleAlert,
  CircleCheck,
  Info,
  Loader2,
  TriangleAlert,
  X,
} from "lucide-react";
import { Toaster as Sonner, type ToasterProps } from "sonner";

import { useTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";

const Toaster = ({ className, ...props }: ToasterProps) => {
  const { resolvedTheme } = useTheme();

  return (
    <Sonner
      theme={resolvedTheme}
      position="top-right"
      closeButton
      expand={false}
      visibleToasts={4}
      gap={10}
      duration={4000}
      icons={{
        success: <CircleCheck className="h-4 w-4 text-primary" />,
        error: <CircleAlert className="h-4 w-4 text-primary" />,
        warning: <TriangleAlert className="h-4 w-4 text-primary" />,
        info: <Info className="h-4 w-4 text-primary" />,
        loading: <Loader2 className="h-4 w-4 animate-spin text-primary" />,
        close: <X className="h-3.5 w-3.5" />,
      }}
      className={cn("toaster group", className)}
      toastOptions={{
        classNames: {
          toast: cn(
            "group toast",
            "group-[.toaster]:pointer-events-auto",
            "group-[.toaster]:flex group-[.toaster]:items-start group-[.toaster]:gap-3",
            "group-[.toaster]:w-[min(100vw-2rem,22.5rem)]",
            "group-[.toaster]:rounded-[var(--radius)]",
            "group-[.toaster]:border group-[.toaster]:border-border",
            "group-[.toaster]:bg-card group-[.toaster]:text-card-foreground",
            "group-[.toaster]:shadow-[var(--shadow-card)]",
            "group-[.toaster]:px-4 group-[.toaster]:py-3",
            "group-[.toaster]:font-[family-name:var(--font-sans)]",
            "group-[.toaster]:text-sm",
            "data-[type=warning]:border-[color-mix(in_oklab,var(--warning)_35%,var(--border))]",
            "data-[type=warning]:bg-[color-mix(in_oklab,var(--warning)_12%,var(--card))]",
            "data-[type=info]:border-[color-mix(in_oklab,var(--primary)_25%,var(--border))]",
            "data-[type=info]:bg-[color-mix(in_oklab,var(--primary)_7%,var(--card))]",
            "data-[type=success]:border-[color-mix(in_oklab,var(--primary)_25%,var(--border))]",
            "data-[type=success]:bg-[color-mix(in_oklab,var(--primary)_7%,var(--card))]",
            "data-[type=error]:border-[oklch(0.48_0.13_15)]",
            "data-[type=error]:bg-[color-mix(in_oklab,var(--primary)_7%,var(--card))]",
            "dark:data-[type=error]:border-[oklch(0.62_0.12_15)]",
            "data-[type=loading]:border-[color-mix(in_oklab,var(--primary)_25%,var(--border))]",
            "data-[type=loading]:bg-[color-mix(in_oklab,var(--primary)_7%,var(--card))]",
          ),
          title: "group-[.toast]:text-sm group-[.toast]:font-medium group-[.toast]:leading-snug group-[.toast]:text-foreground",
          description: "group-[.toast]:mt-0.5 group-[.toast]:text-xs group-[.toast]:leading-relaxed group-[.toast]:text-muted-foreground",
          icon: "group-[.toast]:mt-0.5 group-[.toast]:shrink-0",
          closeButton: cn(
            "group-[.toast]:!left-auto group-[.toast]:!right-2 group-[.toast]:!top-1/2",
            "group-[.toast]:!-translate-y-1/2",
            "group-[.toast]:!flex group-[.toast]:!h-6 group-[.toast]:!w-6",
            "group-[.toast]:!items-center group-[.toast]:!justify-center",
            "group-[.toast]:!rounded-full group-[.toast]:!border-border group-[.toast]:!bg-card",
            "group-[.toast]:!p-0 group-[.toast]:!m-0 group-[.toast]:!text-muted-foreground",
            "group-[.toast]:hover:!bg-muted group-[.toast]:hover:!text-foreground",
          ),
          actionButton: cn(
            "group-[.toast]:rounded-md group-[.toast]:px-2.5 group-[.toast]:py-1.5",
            "group-[.toast]:text-xs group-[.toast]:font-medium",
            "group-[.toast]:bg-[image:var(--gradient-primary)]",
            "group-[.toast]:text-primary-foreground",
            "group-[.toast]:hover:opacity-90",
          ),
          cancelButton: cn(
            "group-[.toast]:rounded-md group-[.toast]:border group-[.toast]:border-border",
            "group-[.toast]:bg-background group-[.toast]:px-2.5 group-[.toast]:py-1.5",
            "group-[.toast]:text-xs group-[.toast]:font-medium group-[.toast]:text-muted-foreground",
            "group-[.toast]:hover:bg-muted group-[.toast]:hover:text-foreground",
          ),
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
