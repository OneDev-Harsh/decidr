"use client";

import { useState, useEffect } from "react";
import { insforge } from "@/lib/insforge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Link as LinkIcon, Upload, Loader2, Trash2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function EvidenceManager({ projectId }: { projectId: string }) {
  const [evidenceList, setEvidenceList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingType, setAddingType] = useState<'none' | 'text' | 'link' | 'file'>('none');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadEvidence();
  }, [projectId]);

  async function loadEvidence() {
    setLoading(true);
    const { data, error } = await insforge.database
      .from('evidence')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (data) {
      setEvidenceList(data);
    }
    setLoading(false);
  }

  async function handleDelete(id: string, type: string, filePath: string | null) {
    if (!confirm("Are you sure you want to delete this evidence?")) return;
    
    if (type === 'file' && filePath) {
      await insforge.storage.from('public-evidence').remove(filePath);
    }
    
    await insforge.database.from('evidence').delete().eq('id', id);
    
    // Log activity
    await insforge.database.from('project_activity').insert({
      project_id: projectId,
      action: 'evidence.removed',
      details: `Removed ${type} evidence.`,
    });

    await loadEvidence();
  }

  async function handleAddText(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const title = formData.get("title") as string;
    const content = formData.get("content") as string;

    const { error } = await insforge.database.from('evidence').insert({
      project_id: projectId,
      title,
      content,
      type: 'text'
    });

    if (error) setError(error.message);
    else {
      // Log activity
      await insforge.database.from('project_activity').insert({
        project_id: projectId,
        action: 'evidence.added',
        details: `Note added: ${title}`,
      });
      setAddingType('none');
      await loadEvidence();
    }
    setIsSubmitting(false);
  }

  async function handleAddLink(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const title = formData.get("title") as string;
    const content = formData.get("content") as string; // The URL

    const { error } = await insforge.database.from('evidence').insert({
      project_id: projectId,
      title,
      content,
      type: 'link'
    });

    if (error) setError(error.message);
    else {
      // Log activity
      await insforge.database.from('project_activity').insert({
        project_id: projectId,
        action: 'evidence.added',
        details: `Link added: ${title}`,
      });
      setAddingType('none');
      await loadEvidence();
    }
    setIsSubmitting(false);
  }

  async function handleAddFile(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const file = formData.get("file") as File;
    const title = formData.get("title") as string || file.name;

    if (!file || file.size === 0) {
      setError("Please select a file.");
      setIsSubmitting(false);
      return;
    }

    // 1. Upload to storage
    const { data: uploadData, error: uploadError } = await insforge.storage
      .from('public-evidence')
      .uploadAuto(file);

    if (uploadError || !uploadData) {
      setError(uploadError?.message || "Failed to upload file");
      setIsSubmitting(false);
      return;
    }

    // 2. Insert record in DB
    const { error: dbError } = await insforge.database.from('evidence').insert({
      project_id: projectId,
      title,
      type: 'file',
      file_path: uploadData.key,
      content: uploadData.url // store url for easy access
    });

    if (dbError) setError(dbError.message);
    else {
      // Log activity
      await insforge.database.from('project_activity').insert({
        project_id: projectId,
        action: 'evidence.added',
        details: `File uploaded: ${title}`,
      });
      setAddingType('none');
      await loadEvidence();
    }
    setIsSubmitting(false);
  }

  const [selectedEvidence, setSelectedEvidence] = useState<any | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h3 className="text-[16px] font-medium text-white">Project Evidence</h3>
          <p className="text-[13px] text-zinc-500">Add documents, links, and notes to inform the analytical engine.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setAddingType('text')} className="border-white/10 text-white hover:bg-white/5 h-9">
            <FileText className="mr-2 h-4 w-4 text-zinc-400" /> Note
          </Button>
          <Button variant="outline" size="sm" onClick={() => setAddingType('link')} className="border-white/10 text-white hover:bg-white/5 h-9">
            <LinkIcon className="mr-2 h-4 w-4 text-zinc-400" /> Link
          </Button>
          <Button size="sm" onClick={() => setAddingType('file')} className="bg-white hover:bg-zinc-200 text-black font-medium px-4 h-9 border-none transition-colors rounded-md shadow-sm">
            <Upload className="mr-2 h-4 w-4" /> Upload
          </Button>
        </div>
      </div>

      {addingType !== 'none' && (
        <Card className="bg-[#0a0a0a] border-white/10 rounded-xl overflow-hidden">
          <CardHeader className="pb-4 border-b border-white/[0.05]">
            <div className="flex justify-between items-center">
              <CardTitle className="text-[14px] font-medium text-white">
                Add {addingType === 'text' ? 'Note' : addingType === 'link' ? 'URL' : 'File'}
              </CardTitle>
              <button onClick={() => setAddingType('none')} className="text-zinc-500 hover:text-white text-[13px] transition-colors">Cancel</button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {addingType === 'text' && (
              <form onSubmit={handleAddText} className="space-y-4">
                <Input name="title" placeholder="Title (e.g. Q3 Sales Call Summary)" required className="bg-black border-white/10 focus:ring-white/20 h-10 text-[14px]" />
                <textarea
                  name="content"
                  className="flex min-h-[150px] w-full rounded-md border border-white/10 bg-black px-3 py-2 text-[14px] text-white placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-white/20 transition-all"
                  placeholder="Paste your notes here..."
                  required
                />
                {error && <div className="text-[12px] text-red-400">{error}</div>}
                <div className="flex justify-end">
                  <Button type="submit" disabled={isSubmitting} className="bg-white hover:bg-zinc-200 text-black font-medium h-9 px-6 transition-colors rounded-md">
                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} Save Note
                  </Button>
                </div>
              </form>
            )}

            {addingType === 'link' && (
              <form onSubmit={handleAddLink} className="space-y-4">
                <Input name="title" placeholder="Title (e.g. Competitor Pricing Page)" required className="bg-black border-white/10 focus:ring-white/20 h-10 text-[14px]" />
                <Input name="content" type="url" placeholder="https://..." required className="bg-black border-white/10 focus:ring-white/20 h-10 text-[14px]" />
                {error && <div className="text-[12px] text-red-400">{error}</div>}
                <div className="flex justify-end">
                  <Button type="submit" disabled={isSubmitting} className="bg-white hover:bg-zinc-200 text-black font-medium h-9 px-6 transition-colors rounded-md">
                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} Save Link
                  </Button>
                </div>
              </form>
            )}

            {addingType === 'file' && (
              <form onSubmit={handleAddFile} className="space-y-4">
                <Input name="title" placeholder="Title (Optional, defaults to filename)" className="bg-black border-white/10 focus:ring-white/20 h-10 text-[14px]" />
                <Input name="file" type="file" required className="cursor-pointer file:text-white file:bg-white/10 file:border-0 file:rounded-md file:px-4 file:py-1 hover:file:bg-white/20 bg-black border-white/10 h-10 text-[14px]" />
                {error && <div className="text-[12px] text-red-400">{error}</div>}
                <div className="flex justify-end">
                  <Button type="submit" disabled={isSubmitting} className="bg-white hover:bg-zinc-200 text-black font-medium h-9 px-6 transition-colors rounded-md">
                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} Upload File
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="flex justify-center p-12"><Loader2 className="h-5 w-5 animate-spin text-zinc-500" /></div>
      ) : evidenceList.length === 0 ? (
        <div className="text-center py-16 border border-white/[0.05] rounded-xl bg-[#0a0a0a]/50 border-dashed">
          <Database className="mx-auto h-8 w-8 text-zinc-700 mb-4" />
          <h3 className="text-[14px] font-medium text-white">No evidence yet</h3>
          <p className="mt-1 text-[13px] text-zinc-500">Upload data to help the AI understand the decision context.</p>
        </div>
      ) : (
        <div className="grid gap-2">
          {evidenceList.map((evidence) => (
            <div key={evidence.id} className="flex items-center justify-between p-4 rounded-lg bg-[#0a0a0a] border border-white/10 hover:border-white/20 transition-all group">
              <div className="flex items-center gap-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-white/5 border border-white/5">
                  {evidence.type === 'text' && <FileText className="h-4 w-4 text-zinc-400" />}
                  {evidence.type === 'link' && <LinkIcon className="h-4 w-4 text-zinc-400" />}
                  {evidence.type === 'file' && <FileText className="h-4 w-4 text-zinc-400" />}
                </div>
                <div>
                  <p className="text-[14px] font-medium text-white">{evidence.title}</p>
                  <p className="text-[11px] text-zinc-500 capitalize">{evidence.type} • {new Date(evidence.created_at).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                {evidence.type === 'link' || evidence.type === 'file' ? (
                  <Button variant="ghost" size="sm" asChild className="text-[12px] text-zinc-400 hover:text-white hover:bg-white/5 h-8">
                    <a href={evidence.content} target="_blank" rel="noopener noreferrer">View</a>
                  </Button>
                ) : (
                  <Button variant="ghost" size="sm" onClick={() => setSelectedEvidence(evidence)} className="text-[12px] text-zinc-400 hover:text-white hover:bg-white/5 h-8">
                    View
                  </Button>
                )}
                <Button variant="ghost" size="sm" className="text-zinc-500 hover:text-red-400 hover:bg-red-400/10 h-8" onClick={() => handleDelete(evidence.id, evidence.type, evidence.file_path)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Evidence Viewer Modal */}
      <AnimatePresence>
        {selectedEvidence && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[100] flex items-center justify-center p-6" onClick={() => setSelectedEvidence(null)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#0a0a0a] border border-white/10 rounded-xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
            >
              <div className="p-6 border-b border-white/[0.05] flex items-center justify-between">
                <div>
                  <h3 className="text-[16px] font-medium text-white">{selectedEvidence.title}</h3>
                  <p className="text-[11px] text-zinc-500 capitalize">{selectedEvidence.type} • {new Date(selectedEvidence.created_at).toLocaleDateString()}</p>
                </div>
                <button onClick={() => setSelectedEvidence(null)} className="text-zinc-500 hover:text-white transition-colors">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="p-8 overflow-y-auto custom-scrollbar">
                <div className="text-[14px] text-zinc-300 leading-relaxed whitespace-pre-wrap font-light">
                  {selectedEvidence.content}
                </div>
              </div>
              <div className="p-4 border-t border-white/[0.05] flex justify-end">
                <Button variant="ghost" onClick={() => setSelectedEvidence(null)} className="text-zinc-500 hover:text-white h-9">
                  Close
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Quick component for the empty state icon
function Database(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M3 5V19A9 3 0 0 0 21 19V5" />
      <path d="M3 12A9 3 0 0 0 21 12" />
    </svg>
  )
}
