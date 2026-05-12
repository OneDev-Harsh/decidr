"use client";

import { useEffect, useState } from "react";
import { insforge } from "@/lib/insforge";
import { useParams } from "next/navigation";

export function PresenceManager() {
  const params = useParams();
  const workspaceId = params.workspaceId as string;
  const projectId = params.projectId as string;
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    async function init() {
      const { data } = await insforge.auth.getCurrentUser();
      if (data?.user) {
        setUser(data.user);
        await insforge.realtime.connect();
      }
    }
    init();
  }, []);

  useEffect(() => {
    if (!user || !insforge.realtime.isConnected) return;

    const channels: string[] = [];
    if (workspaceId) channels.push(`presence:workspace:${workspaceId}`);
    if (projectId) channels.push(`presence:project:${projectId}`);

    const subscribeAndAnnounce = async () => {
      for (const channel of channels) {
        await insforge.realtime.subscribe(channel);
        // Announce presence
        await insforge.realtime.publish(channel, 'presence', {
          user_id: user.id,
          full_name: user.profile?.full_name || user.email,
          avatar_url: user.profile?.avatar_url,
          last_seen: new Date().toISOString()
        });
      }
    };

    subscribeAndAnnounce();

    const interval = setInterval(async () => {
      for (const channel of channels) {
        await insforge.realtime.publish(channel, 'presence', {
          user_id: user.id,
          full_name: user.profile?.full_name || user.email,
          avatar_url: user.profile?.avatar_url,
          last_seen: new Date().toISOString()
        });
      }
    }, 30000); // Every 30 seconds

    return () => {
      clearInterval(interval);
      channels.forEach(ch => insforge.realtime.unsubscribe(ch));
    };
  }, [user, workspaceId, projectId]);

  return null;
}
