"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import WrapBackground from "@/components/wrapBackground";
import ChatInput from "../chatInput";
import ChatBox from "../chatBox";

export default function ChatSessionPage({ params }: { params: { sessionId: string } }) {
  // You can use params.sessionId to fetch session-specific data if needed
  return (
    <WrapBackground>
      <div className="h-full w-full flex flex-col">
        <div className="h-[90%]">
          <ChatBox />
        </div>
        <div className="h-[10%]">
          <ChatInput />
        </div>
      </div>
    </WrapBackground>
  );
} 