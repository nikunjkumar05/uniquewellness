import { useEffect } from "react";
import { toast } from "sonner";

export function PwaManager() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const showOffline = () => toast.warning("You are offline. Cached pages will still open.");
    const showOnline = () => toast.success("Back online");

    window.addEventListener("offline", showOffline);
    window.addEventListener("online", showOnline);

    const canRegister =
      window.location.protocol === "https:" || window.location.hostname === "localhost";

    if ("serviceWorker" in navigator && canRegister) {
      navigator.serviceWorker.register("/sw.js").catch((error) => {
        console.warn("Service worker registration failed", error);
      });
    }

    return () => {
      window.removeEventListener("offline", showOffline);
      window.removeEventListener("online", showOnline);
    };
  }, []);

  return null;
}
