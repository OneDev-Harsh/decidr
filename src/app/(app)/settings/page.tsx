"use client";

import { useEffect, useState } from "react";
import { insforge } from "@/lib/insforge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Shield, Bell, Loader2 } from "lucide-react";

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadSettings() {
      const { data: userData } = await insforge.auth.getCurrentUser();
      if (userData?.user) {
        setUser(userData.user);
        const { data: profileData } = await insforge.database
          .from('profiles')
          .select('*')
          .eq('id', userData.user.id)
          .single();
        setProfile(profileData);
      }
      setLoading(false);
    }
    loadSettings();
  }, []);

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const formData = new FormData(e.currentTarget);
    const full_name = formData.get("name") as string;
    const username = formData.get("username") as string;
    const bio = formData.get("bio") as string;
    const activity_visibility = formData.get("activity_visibility") === "on";

    const { error } = await insforge.database
      .from('profiles')
      .upsert({
        id: user.id,
        full_name,
        username,
        bio,
        activity_visibility,
        email: user.email,
        updated_at: new Date().toISOString()
      });

    if (error) {
      setMessage("Error saving settings: " + error.message);
    } else {
      setMessage("Settings saved successfully!");
    }
    setSaving(false);
  }

  if (loading) {
    return (
      <div className="flex-1 p-12 flex items-center justify-center min-h-screen bg-black">
        <Loader2 className="h-5 w-5 animate-spin text-zinc-500" />
      </div>
    );
  }

  return (
    <div className="flex-1 px-8 py-12 max-w-[800px] mx-auto min-h-screen bg-black space-y-12">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-white mb-1">Account Configuration</h1>
        <p className="text-[14px] text-zinc-500">Manage global profile preferences and security protocols.</p>
      </div>

      <div className="space-y-12">
        {/* Profile Section */}
        <div className="bg-[#0a0a0a] border border-white/10 rounded-xl overflow-hidden shadow-2xl">
          <div className="p-8 border-b border-white/[0.05]">
            <div className="flex items-center gap-2 mb-1">
              <User className="h-4 w-4 text-zinc-500" />
              <h2 className="text-[16px] font-medium text-white">Profile Identity</h2>
            </div>
            <p className="text-[13px] text-zinc-500">Update your public identification and contact coordinates.</p>
          </div>
          <form onSubmit={handleSave} className="p-8">
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[13px] font-medium text-zinc-300">Full Name</label>
                  <input 
                    name="name" 
                    defaultValue={profile?.full_name || user?.name} 
                    placeholder="Enter your full name"
                    className="w-full bg-black border border-white/10 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-1 focus:ring-white/20 transition-all text-[14px] h-10" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[13px] font-medium text-zinc-300">Username</label>
                  <input 
                    name="username" 
                    defaultValue={profile?.username} 
                    placeholder="e.g. analyst_01"
                    className="w-full bg-black border border-white/10 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-1 focus:ring-white/20 transition-all text-[14px] h-10" 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[13px] font-medium text-zinc-300">Bio / Professional Summary</label>
                <textarea 
                  name="bio" 
                  defaultValue={profile?.bio} 
                  placeholder="Describe your strategic focus..."
                  rows={3}
                  className="w-full bg-black border border-white/10 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-1 focus:ring-white/20 transition-all text-[14px] resize-none" 
                />
              </div>

              <div className="space-y-2">
                <label className="text-[13px] font-medium text-zinc-300">Email Address</label>
                <input 
                  value={user?.email} 
                  disabled 
                  className="w-full bg-black border border-white/10 rounded-md px-4 py-2 text-zinc-500 opacity-60 cursor-not-allowed text-[14px] h-10" 
                />
                <p className="text-[11px] text-zinc-600 mt-1">Identity email is locked to authentication provider.</p>
              </div>

              <div className="flex items-center gap-3 p-4 bg-white/[0.02] border border-white/5 rounded-lg">
                <input 
                  type="checkbox" 
                  name="activity_visibility" 
                  id="activity_visibility"
                  defaultChecked={profile?.activity_visibility !== false}
                  className="h-4 w-4 rounded border-white/10 bg-black text-white focus:ring-0 focus:ring-offset-0"
                />
                <div>
                  <label htmlFor="activity_visibility" className="text-[13px] font-medium text-zinc-300">Public Activity Visibility</label>
                  <p className="text-[11px] text-zinc-500">Allow other workspace members to see your active status and presence.</p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[13px] font-medium text-zinc-300">Personal Invite Code</label>
                <div className="flex gap-2">
                  <input 
                    value={profile?.invite_code || "Generating..."} 
                    disabled 
                    className="flex-1 bg-black border border-white/10 rounded-md px-4 py-2 text-zinc-400 text-[14px] h-10 font-mono" 
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => navigator.clipboard.writeText(profile?.invite_code)}
                    className="border-white/10 text-white hover:bg-white/5 h-10"
                  >
                    Copy
                  </Button>
                </div>
                <p className="text-[11px] text-zinc-600">Share this code to allow others to find and invite you directly.</p>
              </div>

              {message && (
                <div className={`text-[13px] font-medium p-4 rounded-lg border flex items-center gap-3 ${
                  message.includes('Error') ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                }`}>
                  {message}
                </div>
              )}
            </div>
            <div className="mt-10 pt-6 border-t border-white/[0.05] flex justify-end">
              <Button type="submit" disabled={saving} className="bg-white hover:bg-zinc-200 text-black font-medium transition-colors h-10 px-8 rounded-md shadow-sm">
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin text-zinc-500" />} Save Changes
              </Button>
            </div>
          </form>
        </div>

        {/* Placeholder Sections */}
        <div className="grid gap-6 md:grid-cols-2">
          <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-8 opacity-40 grayscale group hover:opacity-60 transition-opacity">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="h-4 w-4 text-zinc-500" />
              <h3 className="text-[15px] font-medium text-white">Security & API</h3>
            </div>
            <p className="text-[13px] text-zinc-600 leading-relaxed italic">
              Advanced security controls and API key management are currently restricted.
            </p>
          </div>

          <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-8 opacity-40 grayscale group hover:opacity-60 transition-opacity">
            <div className="flex items-center gap-2 mb-3">
              <Bell className="h-4 w-4 text-zinc-500" />
              <h3 className="text-[15px] font-medium text-white">Intelligence Alerts</h3>
            </div>
            <p className="text-[13px] text-zinc-600 leading-relaxed italic">
              Notification protocols and real-time alert configuration coming soon.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
