"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { use, useState } from "react";

import { supabaseClient } from "@/utils/supabase/client";
import { useUser } from "@/lib/store/user";

export default function ChatInput({ sessionId }: { sessionId: string }) {
  const [message, setMessage] = useState("");
  const user = useUser((state) => state.user);
  const supabase = supabaseClient();

  //   messages: {
  // Row: {
  //   content: string | null
  //   created_at: string
  //   id: number
  //   sender_id: string
  //   session_id: string | null
  // }
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim()) return;

    if (!user) {
      console.error("User is not logged in");
      return;
    }

    // Insert the message into the chat_messages table
    supabase
      .from("messages")
      .insert({
        content: message,
        sender_id: user?.id,
        session_id: sessionId,
      })
      .then(({ error }) => {
        if (error) {
          console.error("Error sending message:", error);
        } else {
          setMessage(""); // Clear the input field after sending
            console.log("Message sent successfully to session:", sessionId);
        }

      });
  };

  return (
    <form
      className="flex items-center gap-2 p-3 rounded-b-lg"
      onSubmit={handleSubmit}
    >
      <Input
        type="text"
        placeholder="Type your message..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="flex-1 rounded-lg"
      />
      <Button type="submit" variant="outline" disabled={!message.trim()}>
        Send
      </Button>
    </form>
  );
}
