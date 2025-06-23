"use client";

import { Button } from "@/components/ui/button";
import WrapBackground from "@/components/wrapBackground";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { supabaseClient } from "@/utils/supabase/client";
import { useUser } from "@/lib/store/user";

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const initState = useRef(false);

  const router = useRouter();

  const supabase = supabaseClient();

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);

      if (!initState.current) {
        useUser.setState({
          user: data.user,
        });
      }

      initState.current = true;
    };

    getUser();
  }, []);

  const handleStartGame = async () => {

    const { data, error } = await supabase
        .from("waiting_user")
        .insert({ id: user ? user.id : "guest" })
        .select()
        .single();

    if (error) {
      console.error("Error inserting waiting user:", error);
      return;
    }

    console.log("Waiting user added:", data);

    router.push("/waiting");
  };

  return (
    <WrapBackground>
      <div className="flex flex-col items-center justify-center h-full w-full">
        <div>
          <Button
            variant="outline"
            className="text-sm"
            onClick={handleStartGame}
          >
            Start Game, {user ? user.email : "Guest"}
          </Button>
        </div>
      </div>
    </WrapBackground>
  );
}
