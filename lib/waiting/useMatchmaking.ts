import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { WaitingUser } from "./useWaitingUsers";

interface UserLike { id: string }

export function useMatchmaking(user: UserLike | null, waitingUsers: WaitingUser[]) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Show loading as long as user is in waiting room
    if (user && waitingUsers.some(u => u.id === user.id)) {
      setLoading(true);
    } else {
      setLoading(false);
    }
  }, [waitingUsers, user]);

  useEffect(() => {
    const tryMatchUsers = async () => {
      if (waitingUsers.length >= 2 && user) {
        const userIds = waitingUsers.slice(0, 2).map((u: WaitingUser) => u.id);
        if (!userIds.includes(user.id)) return;
        setError(null);
        const res = await fetch("/api/matchmaking", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user1: userIds[0], user2: userIds[1] })
        });
        if (res.ok) {
          const { sessionId } = await res.json();
          router.push(`/chat/${sessionId}`);
        } else {
          const err = await res.json();
          setError(err.error || "Failed to create session");
        }
      }
    };
    tryMatchUsers();
  }, [waitingUsers, user]);

  return { loading, error };
} 