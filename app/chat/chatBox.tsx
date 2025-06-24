"use client";

import { useEffect, useState, useRef } from "react";
import { SessionData } from "./[sessionId]/page";
import { supabaseClient } from "@/utils/supabase/client";
import { useUser } from "@/lib/store/user";

interface Message {
  senderName: string;
  content: string;
  senderId: string;
  isUserMessage: boolean;
}

//component chat message with senderName content timestamp and isUserMessage boolean
const ChatMessage = ({ messageData }: { messageData: Message }) => {
  return (
    <div
      className={`flex ${
        messageData.isUserMessage ? "justify-end" : "justify-start"
      } mb-4`}
    >
      <div
        className={`max-w-xs p-3 rounded-lg ${
          messageData.isUserMessage ? "" : ""
        }`}
      >
        <div className="text-sm font-semibold">{messageData.senderName}</div>
        <div className="text-sm">{messageData.content}</div>
      </div>
    </div>
  );
};

export default function ChatBox({
  sessionData,
}: {
  sessionData: SessionData | null;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const supabase = supabaseClient();
  const user = useUser((state) => state.user);

  useEffect(() => {
    if (!sessionData) return;

    const channel = supabase
      .channel(`chat-${sessionData?.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          // filter: `session_id=eq.${sessionData?.id}`,
        },
        (payload) => {
          console.log("New message received:", payload);
          console.log("Session data id:", sessionData?.id);
          const newMessage = payload.new;
          const senderName =
            newMessage.sender_id === sessionData?.owner_id
              ? sessionData?.owner_name
              : sessionData?.guest_name || "Guest";

          const messageData: Message = {
            senderName: senderName || "Unknown",
            content: newMessage.content || "",
            senderId: newMessage.sender_id,
            isUserMessage: newMessage.sender_id === user?.id,
          };

          setMessages((prevMessages) => [...prevMessages, messageData]);
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [sessionData]);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!sessionData) return;

      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("session_id", sessionData.id)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching messages:", error);
        return;
      }

      const formattedMessages: Message[] = data.map((msg) => {
        const senderName =
          msg.sender_id === sessionData.owner_id
            ? sessionData.owner_name
            : sessionData.guest_name || "Guest";

        return {
          senderName: senderName || "Unknown",
          content: msg.content || "",
          senderId: msg.sender_id,
          isUserMessage: msg.sender_id === user?.id,
        };
      });

      setMessages(formattedMessages);
    };

    fetchMessages();
  }, [sessionData]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <div className="flex flex-col h-full w-full">
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((msg, index) => (
          <ChatMessage key={index} messageData={msg} />
        ))}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
