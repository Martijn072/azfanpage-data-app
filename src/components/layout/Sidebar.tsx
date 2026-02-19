import { useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Calendar,
  FileSearch,
  BarChart3,
  Trophy,
  Users,
  Palette,
  PenTool,
  Settings,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";

const navItems = [
  { title: "Dashboard", path: "/", icon: LayoutDashboard },
  { title: "Wedstrijden", path: "/wedstrijden", icon: Calendar },
  { title: "Voorbeschouwing", path: "/voorbeschouwing", icon: FileSearch },
  { title: "Nabeschouwing", path: "/nabeschouwing", icon: BarChart3 },
  { title: "Competitie", path: "/competitie", icon: Trophy },
  { title: "Spelers", path: "/spelers", icon: Users },
  { title: "Visuals", path: "/visuals", icon: Palette },
];

const futureItems = [
  { title: "Editor", path: "/editor", icon: PenTool, disabled: true },
  { title: "Instellingen", path: "/instellingen", icon: Settings, disabled: true },
];

interface SidebarProps {
  isMobile: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const Sidebar = ({ isMobile, open, onOpenChange }: SidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  const handleNav = (path: string) => {
    navigate(path);
    if (isMobile) onOpenChange(false);
  };

  const navContent = (
    <>
      {/* Logo */}
      <div className="h-14 flex items-center px-4 border-b border-border justify-between">
        <img
          src="/lovable-uploads/02689d46-9781-412f-9093-feef3e99cfe2.png"
          alt="AZ Fanpage"
          className={cn("h-8 w-auto cursor-pointer", !isMobile && collapsed && "mx-auto")}
          onClick={() => handleNav("/")}
        />
        {isMobile && (
          <button onClick={() => onOpenChange(false)} className="p-1.5 rounded-md text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Nav items */}
      <nav className="flex-1 py-3 px-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <button
            key={item.path}
            onClick={() => handleNav(item.path)}
            className={cn(
              "w-full flex items-center gap-3 h-10 px-3 rounded-lg text-app-body transition-colors duration-150",
              isActive(item.path)
                ? "bg-primary/10 text-primary font-semibold border-l-[3px] border-primary"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            )}
          >
            <item.icon className={cn("h-5 w-5 shrink-0", isActive(item.path) ? "text-primary" : "text-muted-foreground")} />
            {(isMobile || !collapsed) && <span className="truncate">{item.title}</span>}
          </button>
        ))}

        <div className="my-3 border-t border-border" />

        {futureItems.map((item) => (
          <button
            key={item.path}
            disabled
            className="w-full flex items-center gap-3 h-10 px-3 rounded-lg text-app-body text-muted-foreground/40 cursor-not-allowed"
          >
            <item.icon className="h-5 w-5 shrink-0" />
            {(isMobile || !collapsed) && <span className="truncate">{item.title}</span>}
          </button>
        ))}
      </nav>

      {/* Collapse toggle (desktop only) */}
      {!isMobile && (
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="h-10 flex items-center justify-center border-t border-border text-muted-foreground hover:text-foreground transition-colors"
          aria-label={collapsed ? "Sidebar uitklappen" : "Sidebar inklappen"}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      )}
    </>
  );

  // Mobile: Sheet drawer
  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="left" className="p-0 w-64 flex flex-col [&>button.absolute]:hidden">
          <SheetTitle className="sr-only">Navigatiemenu</SheetTitle>
          {navContent}
        </SheetContent>
      </Sheet>
    );
  }

  // Desktop: fixed sidebar
  return (
    <aside
      className={cn(
        "h-screen sticky top-0 bg-card border-r border-border flex flex-col transition-all duration-250 ease-in-out z-40",
        collapsed ? "w-16" : "w-60"
      )}
    >
      {navContent}
    </aside>
  );
};
