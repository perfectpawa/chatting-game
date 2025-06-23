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

    const tryMatchUsers = async () => {
      if (waitingUsers.length >= 2 && user) {
        console.log("Attempting to match users...");
      }
    };
    tryMatchUsers();
  }, [waitingUsers, user]);

  return { loading, error };
} 