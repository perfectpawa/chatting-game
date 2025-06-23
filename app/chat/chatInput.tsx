"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabaseClient } from "@/utils/supabase/client";
import { useState } from "react";

export default function ChatInput({
    sessionId,
    currentUserId,
}:{
    sessionId: string;
    currentUserId: string;
}) {
    const [message, setMessage] = useState("");

    const supabase = supabaseClient();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim()) return;

        supabase
            .from("messages")
            .insert({
                content: message,
                sender_id: currentUserId,
                session_id: sessionId,
            })
            .then(({ error }) => {
                if (error) {
                    console.error("Error sending message:", error);
                } else {
                    setMessage("");
                }
            });

    }

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
            <Button 
                type="submit"
                variant="outline"
                disabled={!message.trim()}
            >
                Send
            </Button>

        </form>
  );
}
