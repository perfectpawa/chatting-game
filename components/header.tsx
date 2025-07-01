"use client";

import { useUser } from "@/lib/store/user";
import { Button } from "./ui/button";

import { supabaseClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Header() {
  const user = useUser((state) => state.user);
  const displayName = useUser((state) => state.displayName);
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = async () => {
    const supabase = supabaseClient();
    await supabase.auth.signOut();
    useUser.setState({ user: null }); // Clear Zustand state
    router.push("/"); // Optionally redirect
  };

  return (
    <div className={`flex items-center justify-between p-4 rounded-t-lg`}>
      {/* show user name */}
      <div className="text-md font-bold">
        {mounted && user && (
          <span className="text-[#cad3f5]">
            Ready to Play, {displayName}
          </span>
        )}
      </div>
      <div className="">
        {mounted && user && (
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
