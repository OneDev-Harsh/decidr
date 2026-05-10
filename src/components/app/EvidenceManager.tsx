"use client";

import { useState, useEffect } from "react";
import { insforge } from "@/lib/insforge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Link as LinkIcon, Upload, Loader2, Trash2 } from "lucide-react";

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
      setAddingType('none');
      await loadEvidence();
    }
    setIsSubmitting(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-white">Project Evidence</h3>
          <p className="text-sm text-gray-400">Add documents, links, and notes to inform the AI.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setAddingType('text')}>
            <FileText className="mr-2 h-4 w-4" /> Note
          </Button>
          <Button variant="outline" size="sm" onClick={() => setAddingType('link')}>
            <LinkIcon className="mr-2 h-4 w-4" /> Link
          </Button>
          <Button size="sm" onClick={() => setAddingType('file')} className="bg-brand-maroon hover:bg-brand-crimson">
            <Upload className="mr-2 h-4 w-4" /> Upload
          </Button>
        </div>
      </div>

      {addingType !== 'none' && (
        <Card className="bg-black border-white/10">
          <CardHeader className="pb-4">
            <div className="flex justify-between items-center">
              <CardTitle className="text-base text-white">
                Add {addingType === 'text' ? 'Note' : addingType === 'link' ? 'URL' : 'File'}
              </CardTitle>
              <button onClick={() => setAddingType('none')} className="text-gray-400 hover:text-white text-sm">Cancel</button>
            </div>
          </CardHeader>
          <CardContent>
            {addingType === 'text' && (
              <form onSubmit={handleAddText} className="space-y-4">
                <Input name="title" placeholder="Title (e.g. Q3 Sales Call Summary)" required />
                <textarea
                  name="content"
                  className="flex min-h-[150px] w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-maroon"
                  placeholder="Paste your notes here..."
                  required
                />
                {error && <div className="text-sm text-brand-crimson">{error}</div>}
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save Note
                </Button>
              </form>
            )}

            {addingType === 'link' && (
              <form onSubmit={handleAddLink} className="space-y-4">
                <Input name="title" placeholder="Title (e.g. Competitor Pricing Page)" required />
                <Input name="content" type="url" placeholder="https://..." required />
                {error && <div className="text-sm text-brand-crimson">{error}</div>}
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save Link
                </Button>
              </form>
            )}

            {addingType === 'file' && (
              <form onSubmit={handleAddFile} className="space-y-4">
                <Input name="title" placeholder="Title (Optional, defaults to filename)" />
                <Input name="file" type="file" required className="cursor-pointer file:text-white file:bg-white/10 file:border-0 file:rounded-md file:px-4 file:py-1 hover:file:bg-white/20" />
                {error && <div className="text-sm text-brand-crimson">{error}</div>}
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Upload File
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="flex justify-center p-8"><Loader2 className="h-6 w-6 animate-spin text-brand-crimson" /></div>
      ) : evidenceList.length === 0 ? (
        <div className="text-center py-12 border border-white/5 rounded-lg bg-white/5 border-dashed">
          <Database className="mx-auto h-10 w-10 text-gray-600 mb-3" />
          <h3 className="text-sm font-medium text-white">No evidence yet</h3>
          <p className="mt-1 text-sm text-gray-400">Upload data to help the AI understand the context.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {evidenceList.map((evidence) => (
            <div key={evidence.id} className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10">
                  {evidence.type === 'text' && <FileText className="h-5 w-5 text-gray-400" />}
                  {evidence.type === 'link' && <LinkIcon className="h-5 w-5 text-blue-400" />}
                  {evidence.type === 'file' && <FileText className="h-5 w-5 text-brand-crimson" />}
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{evidence.title}</p>
                  <p className="text-xs text-gray-500 capitalize">{evidence.type} • {new Date(evidence.created_at).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex gap-2">
                {evidence.type === 'link' || evidence.type === 'file' ? (
                  <Button variant="ghost" size="sm" asChild>
                    <a href={evidence.content} target="_blank" rel="noopener noreferrer">View</a>
                  </Button>
                ) : null}
                <Button variant="ghost" size="sm" className="text-gray-500 hover:text-brand-crimson hover:bg-brand-crimson/10" onClick={() => handleDelete(evidence.id, evidence.type, evidence.file_path)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
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
