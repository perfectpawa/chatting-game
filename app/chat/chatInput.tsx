"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export default function ChatInput() {
    const [message, setMessage] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
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
