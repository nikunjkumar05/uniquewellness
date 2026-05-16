import { lovable } from "@/integrations/lovable";

export function signInWithGoogle(redirectPath: string) {
  return lovable.auth.signInWithOAuth("google", {
    redirect_uri: window.location.origin + redirectPath,
  });
}
