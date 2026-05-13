"use client";

import { useState } from "react";
import { insforge } from "@/lib/insforge";
import { Button } from "@/components/ui/button";
import { 
  Plus, 
  CheckCircle2, 
  Circle, 
  Trash2, 
  User, 
  AlertCircle,
  Loader2,
  Calendar
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ProjectTasksSectionProps {
  projectId: string;
  tasks: any[];
  onUpdate: () => void;
}

export function ProjectTasksSection({ projectId, tasks, onUpdate }: ProjectTasksSectionProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleAddTask(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setLoading(true);

    const { data: userData } = await insforge.auth.getCurrentUser();

    const { error } = await insforge.database
      .from('project_tasks')
      .insert([{
        project_id: projectId,
        title: newTitle,
        assigned_to: userData?.user?.id
      }]);

    if (!error) {
      setNewTitle("");
      setIsAdding(false);
      onUpdate();
    }
    setLoading(false);
  }

  async function toggleTask(task: any) {
    const { error } = await insforge.database
      .from('project_tasks')
      .update({ is_completed: !task.is_completed })
      .eq('id', task.id);

    if (!error) onUpdate();
  }

  async function deleteTask(id: string) {
    const { error } = await insforge.database
      .from('project_tasks')
      .delete()
      .eq('id', id);

    if (!error) onUpdate();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-[15px] font-medium text-white">Action Items</h3>
          <p className="text-[13px] text-zinc-500">Track implementation of strategic decisions.</p>
        </div>
        <Button onClick={() => setIsAdding(true)} className="bg-white hover:bg-zinc-200 text-black h-9 text-[13px] font-medium">
          <Plus className="mr-2 h-4 w-4" /> Add Task
        </Button>
      </div>

      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {isAdding && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0a0a0a] border border-brand-crimson/30 rounded-xl p-4 mb-4 shadow-2xl shadow-brand-crimson/5"
            >
              <form onSubmit={handleAddTask} className="flex gap-3">
                <input 
                  autoFocus
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="What needs to be done?"
                  className="flex-1 bg-black border border-white/10 rounded-lg px-4 py-2 text-white text-[14px] focus:border-brand-crimson/50 outline-none transition-all"
                />
                <Button type="button" variant="ghost" onClick={() => setIsAdding(false)} className="text-zinc-500 hover:text-white h-10 px-4">Cancel</Button>
                <Button disabled={loading || !newTitle.trim()} className="bg-brand-crimson hover:bg-brand-crimson/90 text-white h-10 px-6 font-medium">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
                </Button>
              </form>
            </motion.div>
          )}

          {tasks.length === 0 && !isAdding ? (
            <div className="py-20 text-center border border-white/5 rounded-xl bg-white/[0.01]">
              <CheckCircle2 className="h-10 w-10 text-zinc-800 mx-auto mb-4" />
              <p className="text-zinc-500 text-[14px]">The roadmap is clear. No pending actions.</p>
            </div>
          ) : (
            tasks.map((task) => (
              <motion.div 
                layout
                key={task.id}
                className={`group flex items-center justify-between p-4 rounded-xl border transition-all ${
                  task.is_completed 
                  ? 'bg-black/40 border-white/[0.03] opacity-60' 
                  : 'bg-[#0a0a0a] border-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex items-center gap-4 flex-1">
                  <button onClick={() => toggleTask(task)} className="shrink-0">
                    {task.is_completed ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    ) : (
                      <Circle className="h-5 w-5 text-zinc-600 group-hover:text-white transition-colors" />
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className={`text-[14px] font-medium transition-all ${
                      task.is_completed ? 'text-zinc-600 line-through' : 'text-zinc-200'
                    }`}>
                      {task.title}
                    </p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <div className="flex items-center gap-1.5 text-[11px] text-zinc-500">
                        <User className="h-3 w-3" />
                        <span>{task.profiles?.full_name || "Unassigned"}</span>
                      </div>
                      <span className="text-zinc-800">•</span>
                      <div className="flex items-center gap-1.5 text-[11px] text-zinc-500">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(task.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => deleteTask(task.id)}
                    className="h-8 w-8 p-0 text-zinc-600 hover:text-red-500 hover:bg-red-500/5"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
