import type { CSSProperties, ReactNode } from "react";

import { cn } from "@/lib/utils";

type PageFadeInProps = {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
};

export function PageFadeIn({ children, className, style }: PageFadeInProps) {
  return (
    <div className={cn("page-fade-in inv-enter-forward flex flex-1 flex-col", className)} style={style}>
      {children}
    </div>
  );
}
