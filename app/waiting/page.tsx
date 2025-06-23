"use client";

import WrapBackground from "@/components/wrapBackground";
import { useUser } from "@/lib/store/user";
import { useWaitingUsers } from "@/lib/waiting/useWaitingUsers";
import { useMatchmaking } from "@/lib/waiting/useMatchmaking";
import { Button } from "@/components/ui/button";

export default function Waiting() {
  const user = useUser((state) => state.user);
  const waitingUsers = useWaitingUsers();
  const { loading, error } = useMatchmaking(user, waitingUsers);

  const handleEndWaiting = async () => {
    if (!user) {
      console.error("No user is logged in.");
      return;
    }
    const supabase = (await import("@/utils/supabase/client")).supabaseClient();
    const { error } = await supabase
      .from("waiting_user")
      .delete()
      .eq("id", user.id);
    if (error) {
      console.error("Error deleting waiting user:", error);
    } else {
      (await import("next/navigation")).useRouter().push("/");
    }
  };

  return (
    <WrapBackground>
      <div className="flex flex-col items-center justify-center h-full w-full">
        {loading && (
          <>
            <div className="mb-4 text-blue-500 animate-pulse">Matching you with another user...</div>
            <Button
              className="mt-4"
              onClick={handleEndWaiting}
            >
              End Waiting
            </Button>
          </>
        )}
        {error && (
          <div className="mb-4 text-red-500">{error}</div>
        )}
      </div>
    </WrapBackground>
  );
}
