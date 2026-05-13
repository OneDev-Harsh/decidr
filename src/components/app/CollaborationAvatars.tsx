"use client";

import { useEffect, useState } from "react";
import { insforge } from "@/lib/insforge";
import { motion, AnimatePresence } from "framer-motion";

interface ActiveUser {
  user_id: string;
  full_name: string;
  avatar_url?: string;
  last_seen: string;
}

interface CollaborationAvatarsProps {
  channel: string;
}

export function CollaborationAvatars({ channel }: CollaborationAvatarsProps) {
  const [activeUsers, setActiveUsers] = useState<Record<string, ActiveUser>>({});

  useEffect(() => {
    const handlePresence = (payload: any) => {
      if (payload.meta.channel === channel && payload.user_id) {
        setActiveUsers(prev => ({
          ...prev,
          [payload.user_id]: payload
        }));
      }
    };

    insforge.realtime.on('presence', handlePresence);

    // Cleanup stale users
    const interval = setInterval(() => {
      const now = Date.now();
      setActiveUsers(prev => {
        const next = { ...prev };
        let changed = false;
        Object.entries(next).forEach(([id, user]) => {
          if (now - new Date(user.last_seen).getTime() > 45000) { // 45 seconds timeout
            delete next[id];
            changed = true;
          }
        });
        return changed ? next : prev;
      });
    }, 10000);

    return () => {
      insforge.realtime.off('presence', handlePresence);
      clearInterval(interval);
    };
  }, [channel]);

  const users = Object.values(activeUsers);

  if (users.length === 0) return null;

  return (
    <div className="flex items-center -space-x-2 overflow-hidden">
      <AnimatePresence>
        {users.map((user) => (
          <motion.div
            key={user.user_id}
            initial={{ opacity: 0, scale: 0.8, x: 10 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.8, x: 10 }}
            className="relative"
            title={user.full_name}
          >
            <div className="h-7 w-7 rounded-full border-2 border-black bg-[#1a1a1a] flex items-center justify-center text-[10px] font-bold text-white shadow-xl overflow-hidden">
              {user.avatar_url ? (
                <img src={user.avatar_url} alt={user.full_name} className="h-full w-full object-cover" />
              ) : (
                user.full_name.charAt(0).toUpperCase()
              )}
            </div>
            <div className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-zinc-100 border border-black" />
          </motion.div>
        ))}
      </AnimatePresence>
      {users.length > 0 && (
        <span className="ml-4 text-[11px] font-medium text-zinc-500">
          {users.length} {users.length === 1 ? 'user' : 'users'} active
        </span>
      )}
    </div>
  );
}
