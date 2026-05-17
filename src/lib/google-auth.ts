import { supabase } from "@/integrations/supabase/client";

export function signInWithGoogle(redirectPath: string) {
  return supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: window.location.origin + redirectPath,
    },
  });
}
