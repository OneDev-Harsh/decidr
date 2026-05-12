"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { insforge } from "@/lib/insforge";
import { Bell, UserPlus, MessageSquare, AlertTriangle, Check, X, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";

export function NotificationCenter() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    async function loadNotifications() {
      const { data: userData } = await insforge.auth.getCurrentUser();
      if (!userData?.user) return;
      setUser(userData.user);

      const { data } = await insforge.database
        .from('notifications')
        .select('*')
        .eq('user_id', userData.user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (data) setNotifications(data);
      setLoading(false);
    }
    loadNotifications();

    // Real-time subscription
    const initRealtime = async () => {
      if (!user?.id) return;
      await insforge.realtime.connect();
      await insforge.realtime.subscribe(`notifications:${user.id}`);
    };
    initRealtime();

    const handleUpdate = (payload: any) => {
      if (payload.meta.channel === `notifications:${user?.id}`) {
        // Since we don't have the full notification in the trigger payload (just id), 
        // we can re-fetch or just handle the new notification if we update the trigger
        // For simplicity and correctness, let's re-fetch the latest
        const loadLatest = async () => {
          const { data } = await insforge.database
            .from('notifications')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(1);
          if (data?.[0]) {
            setNotifications(prev => {
              if (prev.find(n => n.id === data[0].id)) return prev;
              return [data[0], ...prev];
            });
          }
        };
        loadLatest();
      }
    };

    insforge.realtime.on('NOTIFICATION_CHANGE', handleUpdate);

    return () => {
      if (user?.id) {
        insforge.realtime.unsubscribe(`notifications:${user.id}`);
      }
      insforge.realtime.off('NOTIFICATION_CHANGE', handleUpdate);
    };
  }, [user?.id]);

  const unreadCount = notifications.filter(n => !n.read_at).length;

  const markAsRead = async (id: string) => {
    const { error } = await insforge.database
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('id', id);

    if (!error) {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n));
    }
  };

  const handleNotificationClick = (notification: any) => {
    markAsRead(notification.id);
    setIsOpen(false);

    if (notification.type === 'invite' && notification.data.invite_token) {
      router.push(`/invites/${notification.data.invite_token}`);
    } else if (notification.data.workspace_id) {
      router.push(`/workspaces/${notification.data.workspace_id}`);
    } else if (notification.data.project_id) {
      router.push(`/projects/${notification.data.project_id}`);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'invite': return <UserPlus className="h-4 w-4 text-blue-400" />;
      case 'mention': return <MessageSquare className="h-4 w-4 text-brand-maroon" />;
      case 'contradiction': return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      default: return <Bell className="h-4 w-4 text-zinc-400" />;
    }
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-zinc-400 hover:text-white transition-colors"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-brand-maroon border border-black" />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute left-0 bottom-full mb-4 w-80 bg-[#0a0a0a] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden"
            >
              <div className="p-4 border-b border-white/5 flex items-center justify-between">
                <h3 className="text-[14px] font-semibold text-white">Intelligence Notifications</h3>
                {unreadCount > 0 && (
                  <span className="text-[11px] font-medium text-brand-maroon">{unreadCount} new</span>
                )}
              </div>

              <div className="max-h-96 overflow-y-auto">
                {loading ? (
                  <div className="p-8 flex items-center justify-center">
                    <Loader2 className="h-4 w-4 animate-spin text-zinc-500" />
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="p-8 text-center text-zinc-500 text-[13px]">
                    All protocols clear. No new alerts.
                  </div>
                ) : (
                  <div className="divide-y divide-white/5">
                    {notifications.map((n) => (
                      <div 
                        key={n.id} 
                        className={`p-4 flex gap-3 cursor-pointer transition-colors ${!n.read_at ? 'bg-white/[0.02]' : 'hover:bg-white/[0.01]'}`}
                        onClick={() => handleNotificationClick(n)}
                      >
                        <div className="mt-0.5 shrink-0">
                          {getIcon(n.type)}
                        </div>
                        <div className="flex-1 space-y-1">
                          <p className={`text-[13px] leading-snug ${!n.read_at ? 'text-white font-medium' : 'text-zinc-400'}`}>
                            {n.data.message}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] text-zinc-600">
                              {formatDistanceToNow(new Date(n.created_at))} ago
                            </span>
                            {!n.read_at && (
                              <button className="text-[10px] text-zinc-500 hover:text-white">Mark as read</button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-3 bg-white/[0.02] border-t border-white/5 text-center">
                <button className="text-[11px] font-medium text-zinc-500 hover:text-white transition-colors">
                  View all activity logs
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
