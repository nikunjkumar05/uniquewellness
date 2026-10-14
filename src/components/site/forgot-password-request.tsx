"use client";

import React, { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { requestPasswordChange } from "@/lib/password-request.functions";

export default function ForgotPasswordRequest() {
  const [open, setOpen] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);

  const create = useServerFn(requestPasswordChange);

  async function submit() {
    if (!email) return toast.error("Email is required");
    if (!consent) return toast.error("You must give consent");

    setBusy(true);
    try {
      await create({ data: { email, full_name: fullName || undefined, consent } });
      toast.success("Request submitted — admin will reset your password");
      setOpen(false);
      setShowForm(false);
      setEmail("");
      setFullName("");
      setConsent(false);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to submit request");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <button type="button" className="text-primary hover:underline">
          Forgot password?
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">YOU FORGOT YOUR PASSWORD?</DialogTitle>
        </DialogHeader>

        {!showForm ? (
          <div className="space-y-4 mt-3 text-center">
            <p className="text-sm text-muted-foreground">
              If you forgot your password, ask an admin to reset it for you. You will receive a
              temporary password and can change it afterwards in Profile settings.
            </p>
            <Button onClick={() => setShowForm(true)} className="w-full">
              ASK ADMIN TO RESET MY PASSWORD
            </Button>
          </div>
        ) : (
          <div className="space-y-4 mt-3">
            <div>
              <Label htmlFor="fpr-email">Email</Label>
              <Input
                id="fpr-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="fpr-name">Full name</Label>
              <Input id="fpr-name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="fpr-consent" checked={consent} onCheckedChange={(v) => setConsent(Boolean(v))} />
              <Label htmlFor="fpr-consent">I consent to admin resetting my password</Label>
            </div>
            <DialogFooter>
              <Button onClick={submit} disabled={busy} className="w-full">
                {busy ? "Sending…" : "Send request to admin"}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
