"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { insforge } from "@/lib/insforge";
import { ReportLayout } from "@/components/reports/ReportLayout";
import { CoverPage } from "@/components/reports/sections/CoverPage";
import { ExecutiveSummary } from "@/components/reports/sections/ExecutiveSummary";
import { StrategicContext } from "@/components/reports/sections/StrategicContext";
import { EvidenceSummary } from "@/components/reports/sections/EvidenceSummary";
import { Contradictions } from "@/components/reports/sections/Contradictions";
import { Scenarios } from "@/components/reports/sections/Scenarios";
import { FinalRecommendation } from "@/components/reports/sections/FinalRecommendation";
import { DebateGovernance } from "@/components/reports/sections/DebateGovernance";
import { AuditAppendix } from "@/components/reports/sections/AuditAppendix";
import { Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function ReportPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const projectId = params.projectId as string;
  const reportType = searchParams.get("type") || "full";

  const [data, setData] = useState<{
    project: any;
    evidenceList: any[];
    proposals: any[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadReportData() {
      try {
        setLoading(true);
        
        // Step 1: Fetch Project + Workspace
        const { data: project, error: projError } = await insforge.database
          .from('projects')
          .select('*, workspaces(id, name)')
          .eq('id', projectId)
          .single();

        if (projError || !project) {
          throw new Error(projError?.message || "Project not found");
        }

        // Step 2: Fetch Evidence
        const { data: evidenceList } = await insforge.database
          .from('evidence')
          .select('*')
          .eq('project_id', projectId)
          .order('created_at', { ascending: false });

        // Step 3: Fetch Proposals & Governance
        const { data: proposals } = await insforge.database
          .from('proposals')
          .select('*')
          .eq('project_id', projectId)
          .order('created_at', { ascending: false });

        setData({
          project,
          evidenceList: evidenceList || [],
          proposals: proposals || []
        });
      } catch (err: any) {
        console.error("Report Data Fetch Error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (projectId) {
      loadReportData();
    }
  }, [projectId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
        <p className="text-[12px] font-bold uppercase tracking-[0.2em] text-zinc-400">Compiling Intelligence...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-8">
        <div className="max-w-md w-full bg-zinc-900 border border-red-900/20 p-8 rounded-2xl shadow-2xl text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-red-500 mb-4">Strategic Access Failure</h2>
          <p className="text-zinc-400 text-sm mb-6">
            {error || "The system could not retrieve the intelligence vectors for this project."}
          </p>
          <Link 
            href={`/projects/${projectId}`}
            className="block w-full bg-white text-black py-2 rounded-md font-bold text-sm hover:bg-zinc-200 transition-colors"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const { project, evidenceList, proposals } = data;
  const contradictions = project.last_contradictions || [];
  const scenarios = project.last_scenarios || [];
  const recommendation = project.last_recommendation || null;

  return (
    <ReportLayout 
      headerTitle={`${project.title} — Strategic Brief`}
      classification="RESTRICTED / INTERNAL ONLY"
    >
      <CoverPage project={project} reportType={reportType} />
      
      {(reportType === "executive" || reportType === "full" || reportType === "governance") && (
        <ExecutiveSummary project={project} recommendation={recommendation} />
      )}

      {reportType === "full" && (
        <>
          <StrategicContext project={project} />
          <EvidenceSummary evidenceList={evidenceList} />
          <Contradictions contradictions={contradictions} />
          <Scenarios scenarios={scenarios} />
          <FinalRecommendation project={project} recommendation={recommendation} />
          <DebateGovernance proposals={proposals} />
          <AuditAppendix project={project} evidenceList={evidenceList} proposals={proposals} />
        </>
      )}

      {reportType === "governance" && (
        <>
          <DebateGovernance proposals={proposals} />
          <AuditAppendix project={project} evidenceList={evidenceList} proposals={proposals} />
        </>
      )}

      {reportType === "scenario" && (
        <Scenarios scenarios={scenarios} />
      )}
    </ReportLayout>
  );
}
