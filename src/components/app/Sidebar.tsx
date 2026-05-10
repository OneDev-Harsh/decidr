"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { insforge } from "@/lib/insforge";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LayoutDashboard, 
  FolderKanban, 
  Settings, 
  LogOut, 
  Plus,
  Loader2,
  ChevronLeft,
  Menu,
  Search
} from "lucide-react";
import { Button } from "@/components/ui/button";

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    async function loadData() {
      // Fetch user
      const { data: userData, error: userError } = await insforge.auth.getCurrentUser();
      if (userError || !userData?.user) {
        router.push("/login");
        return;
      }
      
      // Fetch profile
      const { data: profileData } = await insforge.database
        .from('profiles')
        .select('*')
        .eq('id', userData.user.id)
        .single();
      
      if (profileData) {
        setUser({ ...userData.user, profile: profileData });
      } else {
        setUser(userData.user);
      }

      // Fetch workspaces where user is owner or member
      const { data: workspacesData } = await insforge.database
        .from('workspaces')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (workspacesData) {
        setWorkspaces(workspacesData);
      }
      
      setLoading(false);
    }
    loadData();
  }, [router]);

  async function handleSignOut() {
    await insforge.auth.signOut();
    router.push("/login");
  }

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    //{ name: "Search", href: "#", icon: Search, shortcut: "⌘K" },
    { name: "Workspaces", href: "/workspaces", icon: FolderKanban },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <motion.div 
      initial={false}
      animate={{ width: isCollapsed ? 80 : 256 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="flex h-screen flex-col border-r border-white/5 bg-black relative"
    >
      <div className="flex h-16 shrink-0 items-center px-6 border-b border-white/5 justify-between">
        <AnimatePresence mode="wait">
          {!isCollapsed ? (
            <motion.div 
              key="logo"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="flex items-center gap-2"
            >
              <Link href="/dashboard" className="flex items-center gap-2">
                <div className="h-8 w-8 rounded bg-brand-maroon flex items-center justify-center shrink-0">
                  <span className="text-white font-bold">D</span>
                </div>
                <span className="text-xl font-bold tracking-tight text-white">Decidr</span>
              </Link>
            </motion.div>
          ) : (
            <motion.div 
              key="logo-collapsed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mx-auto"
            >
              <div className="h-8 w-8 rounded bg-brand-maroon flex items-center justify-center">
                <span className="text-white font-bold">D</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-20 h-6 w-6 rounded-full border border-white/10 bg-black text-gray-400 hover:text-white z-50 shadow-lg"
      >
        {isCollapsed ? <Menu className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
      </Button>

      <div className="flex flex-1 flex-col overflow-y-auto px-4 py-4">
        <nav className="flex-1 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center rounded-md px-2 py-2 text-sm font-medium ${
                  isActive
                    ? "bg-brand-maroon/20 text-brand-crimson"
                    : "text-gray-400 hover:bg-white/5 hover:text-white"
                } ${isCollapsed ? "justify-center" : ""}`}
                title={isCollapsed ? item.name : ""}
              >
                <item.icon
                  className={`h-5 w-5 flex-shrink-0 ${
                    isActive ? "text-brand-crimson" : "text-gray-400 group-hover:text-white"
                  } ${!isCollapsed ? "mr-3" : ""}`}
                  aria-hidden="true"
                />
                {!isCollapsed && (
                  <div className="flex-1 flex items-center justify-between">
                    <span>{item.name}</span>
                    {item.shortcut && (
                      <span className="text-[10px] text-gray-700 font-mono group-hover:text-gray-500 transition-colors">
                        {item.shortcut}
                      </span>
                    )}
                  </div>
                )}
              </Link>
            );
          })}

          <div className="mt-8">
            {!isCollapsed && (
              <div className="flex items-center justify-between px-2 py-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Workspaces
                </h3>
                <Link href="/workspaces/new" className="text-gray-400 hover:text-white transition-colors">
                  <Plus className="h-4 w-4" />
                </Link>
              </div>
            )}
            <div className={`mt-2 space-y-1 ${isCollapsed ? "flex flex-col items-center" : ""}`}>
              {loading ? (
                !isCollapsed && (
                  <div className="px-2 py-2 text-sm text-gray-500 flex items-center">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Loading...
                  </div>
                )
              ) : workspaces.length === 0 ? (
                !isCollapsed && <div className="px-2 py-2 text-sm text-gray-500">No workspaces yet.</div>
              ) : (
                workspaces.map((ws) => (
                  <Link
                    key={ws.id}
                    href={`/workspaces/${ws.id}`}
                    className={`group flex items-center rounded-md px-2 py-2 text-sm font-medium ${
                      pathname.includes(`/workspaces/${ws.id}`)
                        ? "bg-brand-maroon/20 text-brand-crimson"
                        : "text-gray-400 hover:bg-white/5 hover:text-white"
                    } ${isCollapsed ? "justify-center" : ""}`}
                    title={isCollapsed ? ws.name : ""}
                  >
                    <div className={`h-6 w-6 rounded border border-white/5 bg-white/5 flex items-center justify-center text-[10px] font-bold text-gray-500 group-hover:text-white group-hover:bg-brand-maroon/40 group-hover:border-brand-maroon/20 transition-all flex-shrink-0 ${!isCollapsed ? "mr-3" : ""}`}>
                      {ws.name.substring(0, 2).toUpperCase()}
                    </div>
                    {!isCollapsed && <span className="truncate">{ws.name}</span>}
                  </Link>
                ))
              )}
            </div>
          </div>
        </nav>
      </div>

      <div className="flex shrink-0 border-t border-white/5 p-4">
        <div className={`flex w-full items-center justify-between px-2 ${isCollapsed ? "flex-col gap-4" : ""}`}>
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center text-white text-xs font-bold uppercase overflow-hidden shrink-0">
              {user?.email?.charAt(0) || "U"}
            </div>
            {!isCollapsed && (
              <div className="ml-3 truncate max-w-[120px]">
                <p className="text-sm font-medium text-white truncate">{user?.profile?.full_name || user?.email}</p>
              </div>
            )}
          </div>
          <button
            onClick={handleSignOut}
            className="text-gray-400 hover:text-white transition-colors p-2 shrink-0"
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
