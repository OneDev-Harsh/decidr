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

    const { error } = await insforge.database
      .from('profiles')
      .upsert({
        id: user.id,
        full_name,
        email: user.email
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
    <div className="flex-1 px-8 py-10 max-w-[800px] mx-auto min-h-screen bg-black">
      <div className="mb-10">
        <h1 className="text-2xl font-semibold tracking-tight text-white mb-1">Settings</h1>
        <p className="text-[14px] text-zinc-400">Manage your account preferences and security settings.</p>
      </div>

      <div className="space-y-8">
        <div className="bg-[#0a0a0a] border border-white/10 rounded-xl overflow-hidden">
          <div className="p-6 border-b border-white/[0.05]">
            <div className="flex items-center gap-2 mb-1">
              <User className="h-4 w-4 text-zinc-400" />
              <h2 className="text-[15px] font-medium text-white">Profile Information</h2>
            </div>
            <p className="text-[13px] text-zinc-500">Update your public name and contact email.</p>
          </div>
          <form onSubmit={handleSave} className="p-6">
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-[13px] font-medium text-zinc-300">Full Name</label>
                <Input name="name" defaultValue={profile?.full_name || user?.name} className="max-w-md bg-black border-white/10 text-white placeholder:text-zinc-600 focus-visible:ring-1 focus-visible:ring-white/20 h-10" />
              </div>
              <div className="space-y-2">
                <label className="text-[13px] font-medium text-zinc-300">Email Address</label>
                <Input value={user?.email} disabled className="max-w-md bg-black border-white/10 text-white/50 opacity-60 cursor-not-allowed h-10" />
                <p className="text-[12px] text-zinc-500 mt-1">Email cannot be changed directly.</p>
              </div>
              {message && (
                <div className={`text-[13px] px-4 py-3 rounded-lg border ${
                  message.includes('Error') ? 'bg-red-400/10 text-red-400 border-red-400/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                }`}>
                  {message}
                </div>
              )}
            </div>
            <div className="mt-6">
              <Button type="submit" disabled={saving} className="bg-white hover:bg-zinc-200 text-black font-medium transition-colors h-9 px-4 rounded-md">
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin text-zinc-500" />} Save Changes
              </Button>
            </div>
          </form>
        </div>

        <div className="bg-[#0a0a0a] border border-white/10 rounded-xl overflow-hidden opacity-50">
          <div className="p-6">
            <div className="flex items-center gap-2 mb-1">
              <Shield className="h-4 w-4 text-zinc-400" />
              <h2 className="text-[15px] font-medium text-white">Security & API</h2>
            </div>
            <p className="text-[13px] text-zinc-500 mb-4">Manage your password and API access keys.</p>
            <p className="text-[12px] text-zinc-600 italic">Advanced security settings coming in the next release.</p>
          </div>
        </div>

        <div className="bg-[#0a0a0a] border border-white/10 rounded-xl overflow-hidden opacity-50">
          <div className="p-6">
            <div className="flex items-center gap-2 mb-1">
              <Bell className="h-4 w-4 text-zinc-400" />
              <h2 className="text-[15px] font-medium text-white">Notifications</h2>
            </div>
            <p className="text-[13px] text-zinc-500 mb-4">Configure how you receive intelligence alerts.</p>
            <p className="text-[12px] text-zinc-600 italic">Notification preferences coming soon.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
