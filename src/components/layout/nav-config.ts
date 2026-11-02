import { Home, StickyNote } from "lucide-react";

export type NavItem = {
  title: string;
  to: "/home" | "/notes";
  icon: typeof Home;
};

export const NAV_ITEMS: NavItem[] = [
  { title: "Home", to: "/home", icon: Home },
  { title: "Notes", to: "/notes", icon: StickyNote },
];
