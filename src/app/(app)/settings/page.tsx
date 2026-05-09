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
      <div className="flex-1 p-8 flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 text-brand-crimson animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-white">Settings</h1>
        <p className="text-gray-400 mt-1">Manage your account preferences and security settings.</p>
      </div>

      <div className="grid gap-8">
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-brand-crimson" />
              <CardTitle className="text-white">Profile Information</CardTitle>
            </div>
            <CardDescription className="text-gray-400">Update your public name and contact email.</CardDescription>
          </CardHeader>
          <form onSubmit={handleSave}>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium text-gray-300">Full Name</label>
                <Input name="name" defaultValue={profile?.full_name || user?.name} className="max-w-md" />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium text-gray-300">Email Address</label>
                <Input value={user?.email} disabled className="max-w-md opacity-50 cursor-not-allowed" />
                <p className="text-xs text-gray-500">Email cannot be changed directly.</p>
              </div>
              {message && (
                <div className={`text-sm font-medium p-3 rounded-md border ${
                  message.includes('Error') ? 'bg-brand-crimson/10 text-brand-crimson border-brand-crimson/20' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                }`}>
                  {message}
                </div>
              )}
            </CardContent>
            <CardFooter className="border-t border-white/5 pt-6">
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save Changes
              </Button>
            </CardFooter>
          </form>
        </Card>

        <Card className="bg-white/5 border-white/10 opacity-50 grayscale">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-gray-400" />
              <CardTitle className="text-white">Security & API</CardTitle>
            </div>
            <CardDescription className="text-gray-400">Manage your password and API access keys.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500 italic">Advanced security settings coming in the next release.</p>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10 opacity-50 grayscale">
          <CardHeader>
            <div className="flex items-center gap-2">
              < Bell className="h-5 w-5 text-gray-400" />
              <CardTitle className="text-white">Notifications</CardTitle>
            </div>
            <CardDescription className="text-gray-400">Configure how you receive intelligence alerts.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500 italic">Notification preferences coming soon.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
