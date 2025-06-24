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

      //fetch user infomation from user table supabase

      if (!data.user) {
        return;
      }

      const { data: userData, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", data.user?.id)
        .single();



      if (!initState.current) {
        useUser.setState({
          user: data.user,
          displayName: userData?.display_name || null,
        });
      }

      initState.current = true;
    };

    getUser();
  }, []);

  const handleStartGame = async () => {
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
