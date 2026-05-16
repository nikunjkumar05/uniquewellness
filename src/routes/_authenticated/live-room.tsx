import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/_authenticated/live-room")({
  head: () => ({ meta: [{ title: "Live Classes — UWI" }] }),
  component: LiveRoomPage,
});

function LiveRoomPage() {
  const { role } = useAuth();

  // URLs for moderator and participant views
  const MODERATOR_URL =
    "https://uniquewellness.yourvideo.live/host/NmEwODYyNDlhZDJhNDcyYjU5MjE3ODY0LTZhMDg2MjE5YzIyYzRmNzMzNzA3NDNhZg==";
  const PARTICIPANT_URL = "https://uniquewellness.yourvideo.live/6a086249ad2a472b59217864";

  // Determine which URL to display based on role
  const iframeUrl = role === "coach" || role === "admin" ? MODERATOR_URL : PARTICIPANT_URL;
  const roleLabel = role === "coach" || role === "admin" ? "Moderator" : "Participant";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold">Live Classes</h1>
        <div className="text-sm text-muted-foreground rounded-lg bg-secondary px-3 py-1">
          {roleLabel} View
        </div>
      </div>

      <Card className="glass-strong rounded-2xl overflow-hidden p-0">
        <iframe
          allow="camera; microphone; fullscreen; speaker; display-capture"
          src={iframeUrl}
          className="w-full min-h-[600px] border-0 rounded-2xl"
          title={`Live Classes - ${roleLabel} View`}
        />
      </Card>

      <div className="text-xs text-muted-foreground">
        <p>
          {role === "coach" || role === "admin"
            ? "You are viewing the moderator interface. You can manage the session and control participant access."
            : "You are viewing the participant interface. Follow the instructor's guidance during the live class."}
        </p>
      </div>
    </div>
  );
}
