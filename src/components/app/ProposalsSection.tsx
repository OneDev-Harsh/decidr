"use client";

import { useState, useEffect } from "react";
import { insforge } from "@/lib/insforge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  GitPullRequest, 
  GitMerge, 
  GitCommit, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Plus, 
  ArrowRight,
  Loader2,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ProposalsSectionProps {
  projectId: string;
  isOwnerOrAdmin: boolean;
  project: any;
  onMerged?: () => void;
}

export function ProposalsSection({ projectId, isOwnerOrAdmin, project, onMerged }: ProposalsSectionProps) {
  const [proposals, setProposals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState<any>(null);
  const [merging, setMerging] = useState(false);

  useEffect(() => {
    loadProposals();
  }, [projectId]);

  async function loadProposals() {
    setLoading(true);
    const { data, error } = await insforge.database
      .from('proposals')
      .select('*, profiles!creator_id(full_name, username, avatar_url)')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setProposals(data);
    }
    setLoading(false);
  }

  async function handleMerge(proposal: any) {
    setMerging(true);
    try {
      const { data: userData } = await insforge.auth.getCurrentUser();
      if (!userData?.user) throw new Error("Unauthenticated");

      // 1. Update the project with proposed changes
      const { error: updateError } = await insforge.database
        .from('projects')
        .update(proposal.proposed_changes)
        .eq('id', projectId);

      if (updateError) throw updateError;

      // 2. Mark proposal as merged
      const { error: propError } = await insforge.database
        .from('proposals')
        .update({ 
          status: 'merged', 
          merged_at: new Date().toISOString(),
          merged_by: userData.user.id
        })
        .eq('id', proposal.id);

      if (propError) throw propError;

      // 3. Log activity
      await insforge.database.from('project_activity').insert([{
        project_id: projectId,
        user_id: userData.user.id,
        action: 'project.merge_proposal',
        details: `Merged proposal: ${proposal.title}`
      }]);

      await loadProposals();
      if (onMerged) onMerged();
      setSelectedProposal(null);
    } catch (err: any) {
      alert("Merge error: " + err.message);
    } finally {
      setMerging(false);
    }
  }

  async function handleClose(proposalId: string) {
    const { error } = await insforge.database
      .from('proposals')
      .update({ status: 'closed' })
      .eq('id', proposalId);

    if (!error) {
      loadProposals();
      setSelectedProposal(null);
    }
  }

  if (loading) {
    return (
      <div className="py-12 flex justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-zinc-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-[15px] font-medium text-white">Strategic Proposals</h3>
          <p className="text-[13px] text-zinc-500">Suggested modifications to the decision architecture.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="bg-white hover:bg-zinc-200 text-black h-9 text-[13px] font-medium">
          <GitPullRequest className="mr-2 h-4 w-4" /> Propose Change
        </Button>
      </div>

      <div className="grid gap-4">
        {proposals.length === 0 ? (
          <div className="py-12 text-center border border-white/10 rounded-xl bg-[#0a0a0a]">
            <GitPullRequest className="h-8 w-8 text-zinc-700 mx-auto mb-3" />
            <p className="text-zinc-500 text-[14px]">No active proposals detected.</p>
          </div>
        ) : (
          proposals.map((proposal) => (
            <div 
              key={proposal.id} 
              onClick={() => setSelectedProposal(proposal)}
              className="group bg-[#0a0a0a] border border-white/10 rounded-xl p-5 hover:border-white/20 transition-all cursor-pointer relative overflow-hidden"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    proposal.status === 'open' ? 'bg-zinc-800 text-zinc-100' :
                    proposal.status === 'merged' ? 'bg-zinc-800 text-zinc-400' :
                    'bg-zinc-900 text-zinc-600'
                  }`}>
                    {proposal.status === 'open' ? <GitPullRequest className="h-4 w-4" /> : 
                     proposal.status === 'merged' ? <GitMerge className="h-4 w-4" /> : 
                     <XCircle className="h-4 w-4" />}
                  </div>
                  <div>
                    <h4 className="text-[15px] font-medium text-white group-hover:text-brand-crimson transition-colors">{proposal.title}</h4>
                    <p className="text-[12px] text-zinc-500 flex items-center gap-2 mt-0.5">
                      <span className="font-medium text-zinc-400">@{proposal.profiles?.username || "system"}</span>
                      <span>•</span>
                      <span>{new Date(proposal.created_at).toLocaleDateString()}</span>
                    </p>
                  </div>
                </div>
                <div className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest border ${
                  proposal.status === 'open' ? 'border-zinc-700 text-zinc-100 bg-zinc-800' :
                  proposal.status === 'merged' ? 'border-zinc-800 text-zinc-500 bg-zinc-900/50' :
                  'border-zinc-900 text-zinc-600 bg-black'
                }`}>
                  {proposal.status}
                </div>
              </div>
              <p className="text-[13px] text-zinc-400 line-clamp-2 leading-relaxed">
                {proposal.description || "Synthesizing strategic intent..."}
              </p>
              
              <div className="mt-4 pt-4 border-t border-white/[0.05] flex items-center justify-between">
                <div className="flex gap-2">
                  {Object.keys(proposal.proposed_changes).map((key) => (
                    <span key={key} className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] text-zinc-500 uppercase tracking-tighter">
                      {key.replace('_', ' ')}
                    </span>
                  ))}
                </div>
                <ArrowRight className="h-4 w-4 text-zinc-700 group-hover:text-white transition-all transform group-hover:translate-x-1" />
              </div>
            </div>
          ))
        )}
      </div>

      {/* New Proposal Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <NewProposalModal 
            projectId={projectId} 
            project={project}
            onClose={() => setIsModalOpen(false)} 
            onCreated={loadProposals} 
          />
        )}
      </AnimatePresence>

      {/* Proposal Details Modal */}
      <AnimatePresence>
        {selectedProposal && (
          <ProposalDetailsModal 
            proposal={selectedProposal}
            project={project}
            isOwnerOrAdmin={isOwnerOrAdmin}
            merging={merging}
            onMerge={() => handleMerge(selectedProposal)}
            onClose={() => setSelectedProposal(null)}
            onReject={() => handleClose(selectedProposal.id)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function NewProposalModal({ projectId, project, onClose, onCreated }: any) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [changes, setChanges] = useState<any>({
    title: project.title,
    description: project.description,
    problem_statement: project.problem_statement,
    current_state: project.current_state,
    goals: project.goals
  });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const { data: userData } = await insforge.auth.getCurrentUser();
    
    // Construct diff
    const proposedChanges: any = {};
    if (changes.title !== project.title) proposedChanges.title = changes.title;
    if (changes.description !== project.description) proposedChanges.description = changes.description;
    if (changes.problem_statement !== project.problem_statement) proposedChanges.problem_statement = changes.problem_statement;
    if (changes.current_state !== project.current_state) proposedChanges.current_state = changes.current_state;
    if (changes.goals !== project.goals) proposedChanges.goals = changes.goals;

    if (Object.keys(proposedChanges).length === 0) {
      alert("No changes proposed.");
      setLoading(false);
      return;
    }

    const { error } = await insforge.database
      .from('proposals')
      .insert([{
        project_id: projectId,
        creator_id: userData?.user?.id,
        title,
        description,
        proposed_changes: proposedChanges,
        status: 'open'
      }]);

    if (error) {
      alert("Error creating proposal: " + error.message);
    } else {
      onCreated();
      onClose();
    }
    setLoading(false);
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-2xl max-h-[90vh] bg-[#0a0a0a] border border-white/10 rounded-xl shadow-2xl overflow-hidden flex flex-col"
      >
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white tracking-tight">Propose Strategic Change</h2>
            <p className="text-[13px] text-zinc-500">Draft a pull request to modify the decision context.</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="text-zinc-500 hover:text-white h-8 w-8 p-0">
            <Plus className="h-4 w-4 rotate-45" />
          </Button>
        </div>
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[13px] font-medium text-zinc-300">Proposal Title</label>
                <input value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-black border border-white/10 rounded-md px-3 py-2 text-white text-[14px] h-10" placeholder="Briefly describe the change..." required />
              </div>
              <div className="space-y-2">
                <label className="text-[13px] font-medium text-zinc-300">Strategic Rationale</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full min-h-[80px] bg-black border border-white/10 rounded-md px-3 py-2 text-white text-[14px]" placeholder="Why is this change necessary?" />
              </div>
            </div>

            <div className="space-y-6 pt-4 border-t border-white/[0.05]">
              <h4 className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                <GitCommit className="h-3 w-3" /> Modified Fields
              </h4>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[12px] font-bold text-zinc-600 uppercase tracking-widest">Project Title</label>
                  <input value={changes.title} onChange={e => setChanges({...changes, title: e.target.value})} className={`w-full bg-zinc-950 border rounded-lg px-4 py-3 text-[14px] h-11 transition-all focus:outline-none ${changes.title !== project.title ? 'border-zinc-100 text-zinc-100' : 'border-zinc-800 text-zinc-400'}`} />
                </div>
                <div className="space-y-2">
                  <label className="text-[12px] font-bold text-zinc-600 uppercase tracking-widest">Problem Statement</label>
                  <textarea value={changes.problem_statement} onChange={e => setChanges({...changes, problem_statement: e.target.value})} className={`w-full min-h-[100px] bg-zinc-950 border rounded-lg px-4 py-3 text-[14px] transition-all focus:outline-none ${changes.problem_statement !== project.problem_statement ? 'border-zinc-100 text-zinc-100' : 'border-zinc-800 text-zinc-400'}`} />
                </div>
                <div className="space-y-2">
                  <label className="text-[12px] font-bold text-zinc-600 uppercase tracking-widest">Current System State</label>
                  <textarea value={changes.current_state} onChange={e => setChanges({...changes, current_state: e.target.value})} className={`w-full min-h-[100px] bg-zinc-950 border rounded-lg px-4 py-3 text-[14px] transition-all focus:outline-none ${changes.current_state !== project.current_state ? 'border-zinc-100 text-zinc-100' : 'border-zinc-800 text-zinc-400'}`} />
                </div>
                <div className="space-y-2">
                  <label className="text-[12px] font-bold text-zinc-600 uppercase tracking-widest">Goals & Constraints</label>
                  <textarea value={changes.goals} onChange={e => setChanges({...changes, goals: e.target.value})} className={`w-full min-h-[100px] bg-zinc-950 border rounded-lg px-4 py-3 text-[14px] transition-all focus:outline-none ${changes.goals !== project.goals ? 'border-zinc-100 text-zinc-100' : 'border-zinc-800 text-zinc-400'}`} />
                </div>
              </div>
            </div>
          </div>
          <div className="p-4 border-t border-white/10 bg-black/20 flex justify-end gap-3 shrink-0">
            <Button type="button" variant="ghost" onClick={onClose} className="text-zinc-400 hover:text-white h-10">Cancel</Button>
            <Button type="submit" disabled={loading} className="bg-white hover:bg-zinc-200 text-black px-6 h-10 font-medium">
              {loading ? "Initializing..." : "Publish Proposal"}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

function ProposalDetailsModal({ proposal, project, isOwnerOrAdmin, merging, onMerge, onClose, onReject }: any) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-3xl max-h-[90vh] bg-[#0a0a0a] border border-white/10 rounded-xl shadow-2xl overflow-hidden flex flex-col"
      >
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-black/40">
          <div className="flex items-center gap-4">
            <div className={`p-2 rounded-lg bg-zinc-800 text-zinc-100`}>
              <GitPullRequest className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white tracking-tight">{proposal.title}</h2>
              <p className="text-[13px] text-zinc-500">Proposed by @{proposal.profiles?.username} • {new Date(proposal.created_at).toLocaleDateString()}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="text-zinc-500 hover:text-white h-8 w-8 p-0">
            <Plus className="h-4 w-4 rotate-45" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-8">
          <div className="mb-10">
            <h4 className="text-[11px] font-bold text-zinc-600 uppercase tracking-[0.2em] mb-4">Strategic Rationale</h4>
            <div className="p-6 rounded-xl bg-zinc-900/50 border border-zinc-800">
              <p className="text-[15px] text-zinc-200 leading-relaxed font-light">
                {proposal.description || "No specific rationale provided."}
              </p>
            </div>
          </div>

          <div className="space-y-8">
            <h4 className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
              <AlertCircle className="h-3 w-3" /> Proposed Vector Changes
            </h4>

            {Object.entries(proposal.proposed_changes).map(([field, newValue]: [string, any]) => (
              <div key={field} className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-zinc-600 uppercase tracking-widest">{field.replace('_', ' ')}</span>
                  <div className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 text-[10px] font-bold uppercase tracking-widest border border-zinc-700">MODIFIED</div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-zinc-800 rounded-lg overflow-hidden border border-zinc-800">
                  <div className="bg-zinc-950 p-4">
                    <span className="text-[9px] font-bold text-zinc-600 uppercase mb-3 block tracking-widest">Current State</span>
                    <p className="text-[13px] text-zinc-500 font-mono leading-relaxed line-through opacity-50 whitespace-pre-wrap">{project[field] || "EMPTY"}</p>
                  </div>
                  <div className="bg-zinc-900 p-4">
                    <span className="text-[9px] font-bold text-zinc-400 uppercase mb-3 block tracking-widest">Proposed State</span>
                    <p className="text-[13px] text-zinc-100 font-mono leading-relaxed whitespace-pre-wrap">{newValue}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 border-t border-white/10 bg-black/40 flex justify-between items-center">
          <div className="flex gap-2">
            {proposal.status === 'open' && isOwnerOrAdmin && (
              <Button onClick={onReject} variant="ghost" className="text-zinc-500 hover:text-red-400 hover:bg-red-400/5 h-10">
                Reject & Close
              </Button>
            )}
          </div>
          <div className="flex gap-3">
            <Button variant="ghost" onClick={onClose} className="text-zinc-400 hover:text-white h-10">Back to List</Button>
            {proposal.status === 'open' && isOwnerOrAdmin && (
              <Button 
                onClick={onMerge} 
                disabled={merging}
                className="bg-white hover:bg-zinc-200 text-black px-8 h-10 font-bold tracking-tight shadow-2xl"
              >
                {merging ? "Merging..." : "Merge Strategic Change"}
              </Button>
            )}
            {proposal.status === 'merged' && (
              <div className="flex items-center gap-2 text-emerald-500 font-medium text-[14px]">
                <CheckCircle2 className="h-4 w-4" /> Strategic Change Merged
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
