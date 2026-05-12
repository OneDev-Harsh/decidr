"use client";

import { useState, useEffect, useCallback } from "react";
import { insforge } from "@/lib/insforge";
import { Search, UserPlus, Check, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { debounce } from "lodash";

interface UserProfile {
  id: string;
  full_name: string;
  username: string;
  avatar_url: string;
  email: string;
}

interface UserSearchProps {
  workspaceId: string;
  onInvite?: (userId: string) => void;
}

export function UserSearch({ workspaceId, onInvite }: UserSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [inviting, setInviting] = useState<string | null>(null);
  const [invited, setInvited] = useState<string[]>([]);

  const searchUsers = useCallback(
    debounce(async (searchQuery: string) => {
      if (searchQuery.length < 2) {
        setResults([]);
        return;
      }

      setLoading(true);
      const { data, error } = await insforge.database
        .from('profiles')
        .select('*')
        .or(`username.ilike.%${searchQuery}%,full_name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`)
        .limit(5);

      if (data) {
        setResults(data);
      }
      setLoading(false);
    }, 300),
    []
  );

  useEffect(() => {
    searchUsers(query);
  }, [query, searchUsers]);

  const handleInvite = async (user: UserProfile) => {
    setInviting(user.id);
    
    // Check if already a member
    const { data: member } = await insforge.database
      .from('workspace_members')
      .select('id')
      .eq('workspace_id', workspaceId)
      .eq('user_id', user.id)
      .single();

    if (member) {
      alert("User is already a member of this workspace.");
      setInviting(null);
      return;
    }

    // Create invite
    const { data: userData } = await insforge.auth.getCurrentUser();
    const inviterId = userData?.user?.id;

    if (!inviterId) {
      alert("You must be logged in to invite users.");
      setInviting(null);
      return;
    }

    const token = Math.random().toString(36).substring(2, 15);
    const { error } = await insforge.database
      .from('invites')
      .insert([{
        workspace_id: workspaceId,
        inviter_id: inviterId,
        user_id: user.id,
        email: user.email,
        token,
        role: 'member',
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
      }]);

    if (!error) {
      setInvited([...invited, user.id]);
      if (onInvite) onInvite(user.id);
    } else {
      console.error("Error sending invite:", error);
      alert("Error sending invite. Please try again.");
    }
    
    setInviting(null);
  };

  return (
    <div className="w-full space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
        <input
          type="text"
          placeholder="Search by username, name, or email..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full bg-black border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:ring-1 focus:ring-white/20 transition-all text-[14px]"
        />
        {query && (
          <button 
            onClick={() => setQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <AnimatePresence>
        {query.length >= 2 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-[#0a0a0a] border border-white/10 rounded-lg overflow-hidden shadow-2xl"
          >
            {loading ? (
              <div className="p-8 flex items-center justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-zinc-500" />
              </div>
            ) : results.length === 0 ? (
              <div className="p-8 text-center text-zinc-500 text-[13px]">
                No users found matching "{query}"
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {results.map((user) => (
                  <div key={user.id} className="p-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center text-white text-[11px] font-medium">
                        {user.avatar_url ? (
                          <img src={user.avatar_url} alt={user.full_name} className="h-full w-full rounded-full object-cover" />
                        ) : (
                          user.full_name?.charAt(0) || user.username?.charAt(0) || "U"
                        )}
                      </div>
                      <div>
                        <p className="text-[14px] font-medium text-white">{user.full_name || user.username}</p>
                        <p className="text-[12px] text-zinc-500">@{user.username || 'anonymous'}</p>
                      </div>
                    </div>
                    
                    {invited.includes(user.id) ? (
                      <div className="flex items-center gap-1.5 text-emerald-500 text-[13px] font-medium px-3">
                        <Check className="h-4 w-4" />
                        Invited
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={inviting === user.id}
                        onClick={() => handleInvite(user)}
                        className="border-white/10 text-white hover:bg-white/5 h-8 gap-2"
                      >
                        {inviting === user.id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <UserPlus className="h-3 w-3" />
                        )}
                        Invite
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
