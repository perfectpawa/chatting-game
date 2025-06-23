"use client";

import { useUser, clearUser } from "@/lib/store/user";
import { Button } from "./ui/button";

import { supabaseClient } from "@/utils/supabase/client";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function Header() {
  const user = useUser((state) => state.user);
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = async () => {
    const supabase = supabaseClient();

    

    await supabase.auth.signOut();
    clearUser();
    router.push("/"); // Optionally redirect
  };

  const isInChatPage = pathname.startsWith('/chat');

  return (
    <div className={`flex items-center justify-between p-4 rounded-t-lg`}>
      <div className="text-2xl font-bold">Chatting Game</div>
      <div className="">
        {mounted && user && (
          <Button
            variant="outline"
            className="text-sm"
            onClick={isInChatPage ? () => router.push("/") : handleLogout}
          >
            {isInChatPage ? "Go to Homepage" : "Logout"}
          </Button>
        )}
      </div>
    </div>
  );
}
