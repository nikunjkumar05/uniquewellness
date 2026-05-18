import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({ meta: [{ title: "Profile Settings — UWI" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<{
    full_name: string;
    username: string;
    phone: string;
    avatar_url: string | null;
  }>({
    full_name: "",
    username: "",
    phone: "",
    avatar_url: null,
  });
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [hasGoogle, setHasGoogle] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("full_name, username, phone, avatar_url")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(
        ({ data }) =>
          data &&
          setProfile({
            full_name: data.full_name || "",
            username: data.username || "",
            phone: data.phone || "",
            avatar_url: data.avatar_url,
          }),
      );
    setHasGoogle((user.identities || []).some((i) => i.provider === "google"));
  }, [user]);

  async function saveProfile() {
    if (!user) return;
    setBusy(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: profile.full_name,
        username: profile.username || null,
        phone: profile.phone,
      })
      .eq("user_id", user.id);
    setBusy(false);
    if (error) toast.error(error.message);
    else toast.success("Profile saved");
  }

  async function uploadAvatar(file: File) {
    if (!user) return;
    setBusy(true);
    const ext = file.name.split(".").pop();
    const path = `${user.id}/avatar-${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true });
    if (upErr) {
      setBusy(false);
      return toast.error(upErr.message);
    }
    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    const { error } = await supabase
      .from("profiles")
      .update({ avatar_url: data.publicUrl })
      .eq("user_id", user.id);
    setBusy(false);
    if (error) toast.error(error.message);
    else {
      setProfile((p) => ({ ...p, avatar_url: data.publicUrl }));
      toast.success("Photo updated");
    }
  }

  async function changePassword() {
    if (password.length < 8) return toast.error("Password must be at least 8 characters");
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) toast.error(error.message);
    else {
      toast.success("Password updated");
      setPassword("");
    }
  }

  

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-4xl">Profile settings</h1>
        <p className="text-muted-foreground">Manage your account, photo, and password.</p>
      </div>

      <Card className="glass-premium rounded-3xl p-6 space-y-5">
        <div className="flex items-center gap-5">
          <div className="h-20 w-20 rounded-full bg-primary-soft overflow-hidden flex items-center justify-center text-2xl font-bold text-primary">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt="Avatar" className="h-full w-full object-cover" />
            ) : (
              (profile.full_name || user?.email || "?").charAt(0).toUpperCase()
            )}
          </div>
          <div>
            <Label
              htmlFor="avatar"
              className="cursor-pointer inline-flex items-center px-4 py-2 rounded-xl glass hover-lift text-sm font-semibold"
            >
              Change photo
            </Label>
            <input
              id="avatar"
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => e.target.files?.[0] && uploadAvatar(e.target.files[0])}
            />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label>Full name</Label>
            <Input
              value={profile.full_name}
              onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
            />
          </div>
          <div>
            <Label>Username</Label>
            <Input
              value={profile.username}
              onChange={(e) => setProfile({ ...profile, username: e.target.value })}
              placeholder="unique-handle"
            />
          </div>
          <div>
            <Label>Mobile</Label>
            <Input
              value={profile.phone}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
            />
          </div>
          <div>
            <Label>Email</Label>
            <Input value={user?.email || ""} disabled />
          </div>
        </div>
        <Button onClick={saveProfile} disabled={busy} className="font-bold">
          Save profile
        </Button>
      </Card>

      <Card className="glass-premium rounded-3xl p-6 space-y-4">
        <h2 className="text-2xl">Change password</h2>
        <Input
          type="password"
          placeholder="New password (min 8 chars)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button onClick={changePassword} disabled={busy} className="font-bold">
          Update password
        </Button>
      </Card>

      <Card className="glass-premium rounded-3xl p-6 space-y-4">
        <h2 className="text-2xl">Connected accounts</h2>
        <div className="flex items-center justify-between glass rounded-2xl p-4">
          <div>
            <div className="font-semibold">Google</div>
            <div className="text-xs text-muted-foreground">
              {hasGoogle ? "Connected" : "Not connected"}
            </div>
          </div>
          
        </div>
      </Card>
    </div>
  );
}
