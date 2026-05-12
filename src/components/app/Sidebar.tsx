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
import { NotificationCenter } from "./NotificationCenter";

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

      // Fetch workspaces where user is a member (owner or joined)
      const { data: workspacesData } = await insforge.database
        .from('workspaces')
        .select('*, workspace_members!inner(user_id)')
        .eq('workspace_members.user_id', userData.user.id)
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
    
    // Manually clear the auth cookie for middleware
    document.cookie = "insforge-auth-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    
    // Use window.location.href to ensure a full page reload and middleware re-evaluation
    window.location.href = "/login";
  }

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Workspaces", href: "/workspaces", icon: FolderKanban },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <motion.div 
      initial={false}
      animate={{ width: isCollapsed ? 64 : 240 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className="flex h-screen flex-col border-r border-white/10 bg-[#0a0a0a] relative"
    >
      <div className="flex h-14 shrink-0 items-center px-4 justify-between">
        <AnimatePresence mode="wait">
          {!isCollapsed ? (
            <motion.div 
              key="logo"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2"
            >
              <Link href="/dashboard" className="flex items-center gap-2.5">
                <div className="h-6 w-6 rounded-md bg-white flex items-center justify-center shrink-0">
                  <span className="text-black font-bold text-xs">D</span>
                </div>
                <span className="text-[15px] font-semibold text-white">Decidr</span>
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
              <div className="h-6 w-6 rounded-md bg-white flex items-center justify-center">
                <span className="text-black font-bold text-xs">D</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-16 h-6 w-6 rounded-full border border-white/10 bg-[#0a0a0a] text-zinc-400 hover:text-white z-50 shadow-sm"
      >
        {isCollapsed ? <Menu className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
      </Button>

      <div className="flex flex-1 flex-col overflow-y-auto px-3 py-4">
        <nav className="flex-1 space-y-0.5">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center rounded-md px-2.5 py-1.5 text-[14px] transition-colors ${
                  isActive
                    ? "bg-white/10 text-white font-medium"
                    : "text-zinc-400 hover:bg-white/5 hover:text-white"
                } ${isCollapsed ? "justify-center" : ""}`}
                title={isCollapsed ? item.name : ""}
              >
                <item.icon
                  strokeWidth={isActive ? 2.5 : 2}
                  className={`h-4 w-4 flex-shrink-0 ${
                    isActive ? "text-white" : "text-zinc-400 group-hover:text-white"
                  } ${!isCollapsed ? "mr-3" : ""}`}
                  aria-hidden="true"
                />
                {!isCollapsed && (
                  <span>{item.name}</span>
                )}
              </Link>
            );
          })}

          <div className="mt-8">
            {!isCollapsed && (
              <div className="flex items-center justify-between px-2.5 py-2">
                <h3 className="text-[11px] font-medium text-zinc-500">
                  Workspaces
                </h3>
                <Link href="/workspaces/new" className="text-zinc-500 hover:text-white transition-colors">
                  <Plus className="h-3.5 w-3.5" />
                </Link>
              </div>
            )}
            <div className={`mt-1 space-y-0.5 ${isCollapsed ? "flex flex-col items-center" : ""}`}>
              {loading ? (
                !isCollapsed && (
                  <div className="px-2.5 py-1.5 text-[13px] text-zinc-500 flex items-center">
                    <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" />
                    Loading...
                  </div>
                )
              ) : workspaces.length === 0 ? (
                !isCollapsed && <div className="px-2.5 py-1.5 text-[13px] text-zinc-500">No workspaces yet.</div>
              ) : (
                workspaces.map((ws) => (
                  <Link
                    key={ws.id}
                    href={`/workspaces/${ws.id}`}
                    className={`group flex items-center rounded-md px-2.5 py-1.5 text-[13px] transition-colors ${
                      pathname.includes(`/workspaces/${ws.id}`)
                        ? "bg-white/10 text-white font-medium"
                        : "text-zinc-400 hover:bg-white/5 hover:text-white"
                    } ${isCollapsed ? "justify-center" : ""}`}
                    title={isCollapsed ? ws.name : ""}
                  >
                    <div className={`h-5 w-5 rounded border border-white/10 flex items-center justify-center text-[10px] font-medium transition-colors flex-shrink-0 ${
                      pathname.includes(`/workspaces/${ws.id}`) ? "bg-white/10 text-white" : "bg-transparent text-zinc-500 group-hover:text-white group-hover:bg-white/5"
                    } ${!isCollapsed ? "mr-2.5" : ""}`}>
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

      <div className="flex shrink-0 p-3">
        <div className={`flex w-full items-center justify-between px-1 ${isCollapsed ? "flex-col gap-4" : ""}`}>
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-full bg-white/10 flex items-center justify-center text-white text-[11px] font-medium shrink-0">
              {user?.email?.charAt(0) || "U"}
            </div>
            {!isCollapsed && (
              <div className="truncate max-w-[120px]">
                <p className="text-[13px] font-medium text-zinc-200 truncate">{user?.profile?.full_name || user?.email}</p>
              </div>
            )}
          </div>
          <div className="flex items-center gap-1">
            <NotificationCenter />
            <button
              onClick={handleSignOut}
              className="text-zinc-500 hover:text-white transition-colors p-1 shrink-0"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
