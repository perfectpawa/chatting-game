"use client";

import WrapBackground from "@/components/wrapBackground";
import { useEffect, useState } from "react";
import { supabaseClient } from "@/utils/supabase/client";
import { useUser } from "@/lib/store/user";
import { useRouter } from "next/navigation";

export default function Waiting() {
  const supabase = supabaseClient();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const user = useUser((state) => state.user);

  useEffect(() => {
    if (!user) {
      setError("You must be logged in to wait for a match.");
      setLoading(false);
      return;
    }

    let unsubscribed = false;

    const channel = supabase
      .channel(`session-matching`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_sessions",
        },
        (payload) => {
          const session = payload.new;

          if (session.owner_id === user.id || session.guest_id === user.id) {
            if (!unsubscribed) {
              router.push(`/chat/${session.id}`);
            }
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
      unsubscribed = true;
    };
  }, []);

  useEffect(() => {
    if (!user) {
      setError("You must be logged in to wait for a match.");
      setLoading(false);
      return;
    }

    const findMatch = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/matchmaking", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: user.id }),
        });
        const data = await res.json();
        if (data.error) {
          setError("API: " + data.error);
          setLoading(false);
          return;
        }
        if (data.matched && data.session) {
          router.push(`/chat/${data.session.id}`);
          return;
        }
      } catch (err: any) {
        setError("Failed to connect to matchmaking service: " + err);
        setLoading(false);
      }
    };

    findMatch();

    return () => {
      // Call API to remove user from waiting queue
      if (user && user.id) {
        fetch("/api/matchmaking", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: user.id }),
        });
      }
    };
  }, [user]);

  return (
    <WrapBackground>
      <div className="flex flex-col items-center justify-center h-full w-full">
        {loading && (
          <div className="mb-4 text-[#8aadf4] animate-pulse">
            Matching you with another user...
          </div>
        )}
        {error && <div className="mb-4 text-[#ed8796]">{error}</div>}
      </div>
    </WrapBackground>
  );
}
