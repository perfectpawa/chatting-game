"use client";

import { Button } from "@/components/ui/button";
import WrapBackground from "@/components/wrapBackground";

import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";

export default function Home() {

  //get user from supabase
  const [user, setUser] = useState<any>(null);
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });
  }, []);

  return (
    <WrapBackground>
      <div className="flex flex-col items-center justify-center h-full w-full">
        <div>
          <Button
            variant="outline"
            className="text-sm"
          >
            Start Game, {user ? user.email : "Guest"}
          </Button>
        </div>
      </div>
    </WrapBackground>
  );
}
