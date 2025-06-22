"use client";

import { useUser } from "@/lib/store/user";
import { Button } from "./ui/button";

import { supabaseClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

export default function Header() {
  const user = useUser((state) => state.user);
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = supabaseClient();
    await supabase.auth.signOut();
    useUser.setState({ user: null }); // Clear Zustand state
    router.push("/"); // Optionally redirect
  }

  return (
    <div className={`flex items-center justify-between p-4 rounded-t-lg`}>
      <div className="text-2xl font-bold">Chatting Game</div>
      <div className="">
        {user && (
          <Button
            variant="outline"
            className="text-sm"
            onClick={handleLogout}
          >
            Logout
          </Button>
        )}
      </div>
    </div>
  );
}
