"use client";

import { useState } from "react";
import { UserSearch } from "./UserSearch";
import { X, Copy, Check, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceId: string;
  workspaceName: string;
}

export function InviteModal({ isOpen, onClose, workspaceId, workspaceName }: InviteModalProps) {
  const [copied, setCopied] = useState(false);
  const inviteLink = `${window.location.origin}/invites/ws_${workspaceId}`; // Simplified for demo, will implement real tokens

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg bg-[#0a0a0a] border border-white/10 rounded-xl shadow-2xl overflow-hidden"
          >
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-zinc-400" />
                <div>
                  <h2 className="text-lg font-semibold text-white">Invite Collaborators</h2>
                  <p className="text-[13px] text-zinc-500">Invite people to {workspaceName}</p>
                </div>
              </div>
              <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-8">
              <div>
                <label className="text-[13px] font-medium text-zinc-300 mb-3 block">Search by username or email</label>
                <UserSearch workspaceId={workspaceId} />
              </div>

              <div className="pt-6 border-t border-white/5">
                <label className="text-[13px] font-medium text-zinc-300 mb-3 block">Share invite link</label>
                <div className="flex gap-2">
                  <div className="flex-1 bg-black border border-white/10 rounded-lg px-4 py-2 text-zinc-400 text-[14px] truncate flex items-center h-10">
                    {inviteLink}
                  </div>
                  <Button
                    onClick={handleCopy}
                    variant="outline"
                    className="border-white/10 text-white hover:bg-white/5 h-10 w-24 gap-2"
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4 text-emerald-500" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
                <p className="mt-2 text-[11px] text-zinc-600 italic">
                  Anyone with this link will be able to join as a member.
                </p>
              </div>
            </div>

            <div className="p-6 bg-white/[0.02] border-t border-white/5 flex justify-end">
              <Button onClick={onClose} className="bg-white hover:bg-zinc-200 text-black font-medium h-9 px-6 rounded-md shadow-sm">
                Done
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
