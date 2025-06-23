import { useEffect, useState } from "react";
import { supabaseClient } from "@/utils/supabase/client";

export interface WaitingUser {
  id: string;
}

export function useWaitingUsers() {
  const supabase = supabaseClient();
  const [waitingUsers, setWaitingUsers] = useState<WaitingUser[]>([]);

  useEffect(() => {
    // Fetch initial waiting users
    const fetchWaitingUsers = async () => {
      const { data, error } = await supabase
        .from("waiting_user")
        .select("*");
      if (!error && data) {
        setWaitingUsers(data as WaitingUser[]);
      }
    };
    fetchWaitingUsers();

    const channel = supabase
      .channel("waiting_room")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "waiting_user" },
        (payload) => {
          const newUser = payload.new as WaitingUser;
          setWaitingUsers((prev) => [...prev, newUser]);
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "waiting_user" },
        (payload) => {
          const deletedUser = payload.old as WaitingUser;
          setWaitingUsers((prev) =>
            prev.filter((user) => user.id !== deletedUser.id)
          );
        }
      )
      .subscribe();
    return () => {
      channel.unsubscribe();
    };
  }, []);

  return waitingUsers;
} 