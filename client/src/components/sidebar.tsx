import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Home,
  PawPrint,
  Calendar,
  Users,
  LogOut,
  User,
  Settings,
  Menu,
  X,
  ChevronLeft,
  Sun,
  Moon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useState, useEffect } from "react";

export function Sidebar() {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const isMobile = useIsMobile();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(
    window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  );

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const navItems = [
    { href: "/", icon: Home, label: "Dashboard" },
    { href: "/horses", icon: PawPrint, label: "Pferde" },
    { href: "/calendar", icon: Calendar, label: "Kalender" },
    { href: "/users", icon: Users, label: "Benutzer" },
  ];

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const SidebarContent = () => (
    <div className="h-full flex flex-col">
      <div className="p-6 flex-1">
        <div className="flex items-center justify-between mb-6">
          <h2 className={cn(
            "text-2xl font-bold text-sidebar-foreground transition-all duration-200",
            isCollapsed && "opacity-0 w-0"
          )}>
            Stallverwaltung
          </h2>
          {!isMobile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="shrink-0"
            >
              <ChevronLeft className={cn(
                "w-4 h-4 transition-transform duration-200",
                isCollapsed && "rotate-180"
              )} />
            </Button>
          )}
        </div>
        <nav className="space-y-2">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <a
                className={cn(
                  "flex items-center gap-3 px-3 py-3 rounded-md text-sidebar-foreground hover:bg-sidebar-accent transition-colors",
                  location === item.href && "bg-sidebar-accent"
                )}
              >
                <item.icon className="w-5 h-5 shrink-0" />
                <span className={cn(
                  "transition-all duration-200",
                  isCollapsed && "opacity-0 w-0"
                )}>
                  {item.label}
                </span>
              </a>
            </Link>
          ))}
        </nav>
      </div>

      <div className="p-6 border-t border-border">
        <div className="flex items-center justify-between mb-4">
          <div className={cn(
            "flex items-center transition-all duration-200",
            isCollapsed && "opacity-0 w-0"
          )}>
            <User className="w-5 h-5 mr-2 shrink-0" />
            <span className="text-sm font-medium">
              {user?.first_name} {user?.last_name}
            </span>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Settings className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <Link href="/profile">
                <DropdownMenuItem>
                  <User className="w-4 h-4 mr-2" />
                  Profil anzeigen
                </DropdownMenuItem>
              </Link>
              <Link href="/profile/edit">
                <DropdownMenuItem>
                  <Settings className="w-4 h-4 mr-2" />
                  Profil bearbeiten
                </DropdownMenuItem>
              </Link>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={toggleTheme}>
                {theme === 'light' ? (
                  <>
                    <Moon className="w-4 h-4 mr-2" />
                    Dark Mode
                  </>
                ) : (
                  <>
                    <Sun className="w-4 h-4 mr-2" />
                    Light Mode
                  </>
                )}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start",
            isCollapsed && "w-10 px-0 justify-center"
          )}
          onClick={() => logoutMutation.mutate()}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span className={cn(
            "ml-2 transition-all duration-200",
            isCollapsed && "opacity-0 w-0"
          )}>
            Abmelden
          </span>
        </Button>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <>
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="fixed top-4 left-4 z-40"
            >
              <Menu className="w-6 h-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80 p-0">
            <SidebarContent />
          </SheetContent>
        </Sheet>
      </>
    );
  }

  return (
    <div className={cn(
      "min-h-screen bg-sidebar border-r border-border transition-all duration-200",
      isCollapsed ? "w-[4.5rem]" : "w-64"
    )}>
      <SidebarContent />
    </div>
  );
}