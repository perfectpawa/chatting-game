"use client";

import { useEffect, useState, use as reactUse, use } from "react";
import { supabaseClient } from "@/utils/supabase/client";

import WrapBackground from "@/components/wrapBackground";
import ChatInput from "../chatInput";
import ChatBox from "../chatBox";

export interface SessionData {
  id: string;
  owner_id: string;
  owner_name: string;
  guest_id: string | null;
  guest_name: string | null;
}

// export default function ChatSessionPage({ params }: { params: { sessionId: string } }) {
  export default function ChatSessionPage({ params }: { params: Promise<{ sessionId: string }> }) {

  const { sessionId } = use(params);

  const supabase = supabaseClient();
  const [sessionData, setSessionData] = useState<SessionData | null>(null);


  useEffect(() => {
    const fetchSession = async () => {
      // Fetch the session data from Supabase populating owner and guest display names from users table
      const { data, error } = await supabase
        .from("chat_sessions")
        .select(`
          owner_id,
          guest_id,
          owner:users!owner_id(display_name),
          guest:users!guest_id(display_name)
        `)
        .eq("id", sessionId)
        .single();

      if (error) {
        console.error("Error fetching session:", error);
        return;
      }

      if (!data) {
        console.error("Session not found");
        return;
      }

      const session: SessionData = {
        id: sessionId,
        owner_id: data.owner_id,
        owner_name: data.owner.display_name,
        guest_id: data.guest_id,
        guest_name: data.guest?.display_name || "Guest",
      };

      setSessionData(session);
      console.log("Session data fetched:", session);
    }

    fetchSession();
      
  },[]);


  return (
    <WrapBackground>
      <div className="h-full w-full flex flex-col">
        <div className="h-[90%]">
          <ChatBox 
            sessionData={sessionData}
          />
        </div>
        <div className="h-[10%]">
          <ChatInput 
            sessionId={sessionId}
          />
        </div>
      </div>
    </WrapBackground>
  );
} 