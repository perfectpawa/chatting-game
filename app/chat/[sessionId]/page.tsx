"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import WrapBackground from "@/components/wrapBackground";
import ChatInput from "../chatInput";
import ChatBox from "../chatBox";
import React from "react";

import { supabaseClient } from "@/utils/supabase/client";
import { useUser } from "@/lib/store/user";

export interface ChatSession {
  current_user_name: string;
  current_user_id: string;
  current_user_score: number;
  other_user_name: string;
  other_user_id: string;
  other_user_score: number;
  session_id: string;
  is_ai: boolean;
  ended: boolean;
}

export default function ChatSessionPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = React.use(params);
  const supabase = supabaseClient();
  const [chatSession, setChatSession] = useState<ChatSession | null>(null);

  const user = useUser((state) => state.user);


  useEffect(() => {
    const fetchSession = async () => {
      // Fetch the session data from Supabase
      // and populate user display names from the users table
      const { data, error } = await supabase
        .from("chat_sessions")
        .select(
          `
            *,
            user_1:users!chat_sessions_user_1_fkey(id, display_name, score),
            user_2:users!chat_sessions_user_2_fkey(id, display_name, score)
          `
        )
        .eq("id", sessionId)
        .single();

      if (error) {
        console.error("Error fetching session:", error);
        return;
      }

      if (!data) {
        console.error("Session not found");
        useRouter().push("/");
        return;
      }

      const currentUser = data.user_1?.id === user?.id ? data.user_1 : data.user_2;
      const otherUser = data.user_1?.id === user?.id ? data.user_2 : data.user_1;

      const chatSessionData: ChatSession = {
        current_user_name: currentUser?.display_name || "Unknown User",
        current_user_id: currentUser?.id || "",
        current_user_score: currentUser?.score || 0,
        other_user_name: otherUser?.display_name || "Unknown User",
        other_user_id: otherUser?.id || "",
        other_user_score: otherUser?.score || 0,
        session_id: data.id,
        is_ai: data.is_ai || false,
        ended: data.ended || false,
      };

      console.log("Chat session data:", chatSessionData);

      setChatSession(chatSessionData);
      if (data.ended) {
        useRouter().push("/");
      }
    };

    fetchSession();
  }, []);

  // You can use sessionId to fetch session-specific data if needed
  return (
    <WrapBackground>
      <div className="h-full w-full flex flex-col">
        <div className="h-[90%]">
          <ChatBox 
            chatSession={chatSession}
          />
        </div>
        <div className="h-[10%]">
          <ChatInput 
            sessionId={chatSession?.session_id || ""}
            currentUserId={chatSession?.current_user_id || ""}
          />
        </div>
      </div>
    </WrapBackground>
  );
}
