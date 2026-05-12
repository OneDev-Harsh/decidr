"use client";

import { useState, useEffect } from "react";
import { insforge } from "@/lib/insforge";
import { MessageSquare, Send, Reply, CheckCircle, Trash2, Loader2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { useCallback } from "react";

interface Comment {
  id: string;
  content: string;
  user_id: string;
  project_id: string;
  parent_id: string | null;
  resolved_at: string | null;
  created_at: string;
  profiles: {
    full_name: string;
    username: string;
    avatar_url: string;
  };
  replies?: Comment[];
}

interface DiscussionSectionProps {
  projectId: string;
}

export function DiscussionSection({ projectId }: DiscussionSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const loadData = useCallback(async () => {
    const { data: userData } = await insforge.auth.getCurrentUser();
    setCurrentUser(userData?.user);

    const { data, error } = await insforge.database
      .from('comments')
      .select(`
        *,
        profiles (
          full_name,
          username,
          avatar_url
        )
      `)
      .eq('project_id', projectId)
      .order('created_at', { ascending: true });

    if (data) {
      // Build thread structure
      const commentMap: Record<string, Comment> = {};
      const roots: Comment[] = [];

      data.forEach((c: any) => {
        commentMap[c.id] = { ...c, replies: [] };
      });

      data.forEach((c: any) => {
        if (c.parent_id && commentMap[c.parent_id]) {
          commentMap[c.parent_id].replies!.push(commentMap[c.id]);
        } else {
          roots.push(commentMap[c.id]);
        }
      });

      setComments(roots);
    }
    setLoading(false);
  }, [projectId]);

  useEffect(() => {
    loadData();

    const initRealtime = async () => {
      try {
        console.log("Connecting to real-time for project:", projectId);
        await insforge.realtime.connect();
        
        // Listen for errors
        insforge.realtime.on('error', (err: any) => console.error("Real-time error:", err));
        insforge.realtime.on('connect_error', (err: any) => console.error("Real-time connection error:", err));

        const { ok, error } = await insforge.realtime.subscribe(`comments:${projectId}`);
        if (!ok) console.error("Subscription failed:", error);
        else console.log("Subscribed to comments channel:", `comments:${projectId}`);
      } catch (err) {
        console.error("Real-time connection setup failed:", err);
      }
    };
    initRealtime();

    const handleCommentChange = (payload: any) => {
      console.log("EVENT RECEIVED:", payload);
      const channel = (payload.meta?.channel || "").toLowerCase();
      const target = `comments:${projectId}`.toLowerCase();
      
      if (channel === target || channel.includes(projectId.toLowerCase())) {
        console.log("Triggering re-fetch for project:", projectId);
        loadData();
      }
    };

    insforge.realtime.on('COMMENT_CHANGE', handleCommentChange);

    return () => {
      insforge.realtime.unsubscribe(`comments:${projectId}`);
      insforge.realtime.off('COMMENT_CHANGE', handleCommentChange);
    };
  }, [projectId]);

  const handleSubmit = async (e: React.FormEvent, parentId: string | null = null) => {
    e.preventDefault();
    const form = e.currentTarget as HTMLFormElement;
    const content = parentId ? (form.elements as any).reply.value : newComment;
    if (!content.trim()) return;

    setSubmitting(true);
    const { error } = await insforge.database
      .from('comments')
      .insert([{
        project_id: projectId,
        user_id: currentUser.id,
        content,
        parent_id: parentId
      }]);

    if (!error) {
      if (!parentId) setNewComment("");
      else form.reset();
      
      // Client-side broadcast as fallback
      insforge.realtime.publish(`comments:${projectId}`, 'COMMENT_CHANGE', { 
        project_id: projectId,
        action: 'INSERT'
      });
    }
    setSubmitting(false);
  };

  const handleResolve = async (commentId: string, isResolved: boolean) => {
    // Optimistic update
    const updateComment = (list: Comment[]): Comment[] => {
      return list.map(c => {
        if (c.id === commentId) return { ...c, resolved_at: isResolved ? new Date().toISOString() : null };
        if (c.replies) return { ...c, replies: updateComment(c.replies) };
        return c;
      });
    };
    setComments(prev => updateComment(prev));

    const { error } = await insforge.database
      .from('comments')
      .update({ resolved_at: isResolved ? new Date().toISOString() : null })
      .eq('id', commentId);
    
    if (error) {
      alert("Failed to update comment: " + error.message);
      loadData(); // Revert on error
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!confirm("Are you sure you want to delete this comment?")) return;
    
    // Optimistic update
    const filterComment = (list: Comment[]): Comment[] => {
      return list
        .filter(c => c.id !== commentId)
        .map(c => ({ ...c, replies: c.replies ? filterComment(c.replies) : [] }));
    };
    setComments(prev => filterComment(prev));

    const { error } = await insforge.database
      .from('comments')
      .delete()
      .eq('id', commentId);

    if (error) {
      alert("Failed to delete comment: " + error.message);
      loadData(); // Revert on error
    }
  };

  if (loading) {
    return (
      <div className="p-12 flex items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-zinc-500" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-24">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Project Discussions</h2>
          <p className="text-[14px] text-zinc-500">Collaborative intelligence review and strategy debate.</p>
        </div>
      </div>

      <div className="space-y-6">
        <AnimatePresence initial={false}>
          {comments.map((comment) => (
            <CommentItem 
              key={comment.id} 
              comment={comment} 
              currentUser={currentUser}
              onReply={handleSubmit}
              onResolve={handleResolve}
              onDelete={handleDelete}
            />
          ))}
        </AnimatePresence>

        {comments.length === 0 && (
          <div className="py-12 text-center border border-dashed border-white/10 rounded-xl">
            <MessageSquare className="h-8 w-8 text-zinc-600 mx-auto mb-3" />
            <p className="text-zinc-500 text-[14px]">No discussions yet. Start the conversation.</p>
          </div>
        )}
      </div>

      <div className="sticky bottom-8 bg-[#0a0a0a] border border-white/10 rounded-xl p-4 shadow-2xl">
        <form onSubmit={(e) => handleSubmit(e)} className="flex gap-4">
          <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center shrink-0">
            <User className="h-5 w-5 text-zinc-500" />
          </div>
          <div className="flex-1 relative">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment or mention @someone..."
              rows={1}
              className="w-full bg-black border border-white/10 rounded-lg px-4 py-2.5 text-[14px] text-white focus:outline-none focus:ring-1 focus:ring-white/20 transition-all resize-none min-h-[44px]"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e as any);
                }
              }}
            />
          </div>
          <Button 
            type="submit" 
            disabled={submitting || !newComment.trim()}
            className="bg-white hover:bg-zinc-200 text-black h-11 px-6 font-medium rounded-lg shrink-0"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </form>
      </div>
    </div>
  );
}

function CommentItem({ comment, currentUser, onReply, onResolve, onDelete, depth = 0 }: any) {
  const [isReplying, setIsReplying] = useState(false);
  const isAuthor = currentUser?.id === comment.user_id;
  const isResolved = !!comment.resolved_at;

  return (
    <motion.div 
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className={`space-y-4 ${depth > 0 ? 'ml-12 mt-4' : ''}`}
    >
      <div className={`bg-[#0a0a0a] border ${isResolved ? 'border-emerald-500/20 bg-emerald-500/[0.01]' : 'border-white/10'} rounded-xl p-5 shadow-sm group relative`}>
        <div className="flex items-start gap-4">
          <div className="h-9 w-9 rounded-full bg-white/5 flex items-center justify-center shrink-0 border border-white/5">
            {comment.profiles?.avatar_url ? (
              <img src={comment.profiles.avatar_url} className="h-full w-full rounded-full object-cover" />
            ) : (
              <span className="text-white text-[11px] font-medium">{comment.profiles?.full_name?.charAt(0) || "U"}</span>
            )}
          </div>
          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[14px] font-semibold text-white">{comment.profiles?.full_name || comment.profiles?.username}</span>
                <span className="text-[11px] text-zinc-500">•</span>
                <span className="text-[11px] text-zinc-500">{formatDistanceToNow(new Date(comment.created_at))} ago</span>
                {isResolved && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-medium border border-emerald-500/20">
                    <CheckCircle className="h-2.5 w-2.5" /> Resolved
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {!isResolved && (
                  <button 
                    onClick={() => onResolve(comment.id, true)}
                    className="p-1.5 text-zinc-500 hover:text-emerald-400 transition-colors"
                    title="Mark as resolved"
                  >
                    <CheckCircle className="h-4 w-4" />
                  </button>
                )}
                {isAuthor && (
                  <button 
                    onClick={() => onDelete(comment.id)}
                    className="p-1.5 text-zinc-500 hover:text-red-400 transition-colors"
                    title="Delete comment"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
            <p className={`text-[14px] leading-relaxed ${isResolved ? 'text-zinc-500 line-through' : 'text-zinc-300'}`}>
              {comment.content}
            </p>
            <div className="pt-2 flex items-center gap-4">
              {!isResolved && (
                <button 
                  onClick={() => setIsReplying(!isReplying)}
                  className="text-[12px] font-medium text-zinc-500 hover:text-white flex items-center gap-1.5 transition-colors"
                >
                  <Reply className="h-3.5 w-3.5" /> Reply
                </button>
              )}
              {isResolved && (
                <button 
                  onClick={() => onResolve(comment.id, false)}
                  className="text-[12px] font-medium text-zinc-500 hover:text-white transition-colors"
                >
                  Reopen Thread
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isReplying && (
          <motion.form 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={(e) => {
              onReply(e, comment.id);
              setIsReplying(false);
            }}
            className="ml-12 flex gap-3"
          >
            <textarea
              name="reply"
              placeholder="Write a reply..."
              autoFocus
              className="flex-1 bg-black border border-white/10 rounded-lg px-4 py-2 text-[13px] text-white focus:outline-none focus:ring-1 focus:ring-white/20 transition-all resize-none h-10"
            />
            <Button type="submit" size="sm" className="bg-white text-black hover:bg-zinc-200">Reply</Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => setIsReplying(false)} className="text-zinc-500">Cancel</Button>
          </motion.form>
        )}
      </AnimatePresence>

      {comment.replies?.map((reply: Comment) => (
        <CommentItem 
          key={reply.id} 
          comment={reply} 
          currentUser={currentUser}
          onReply={onReply}
          onResolve={onResolve}
          onDelete={onDelete}
          depth={depth + 1}
        />
      ))}
    </motion.div>
  );
}
