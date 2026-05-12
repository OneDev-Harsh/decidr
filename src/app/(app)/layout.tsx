import { Sidebar } from "@/components/app/Sidebar";
import { PresenceManager } from "@/components/app/PresenceManager";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-black text-white">
      <PresenceManager />
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-[#050505]">
        {children}
      </main>
    </div>
  );
}
