"use client";

import { supabaseClient } from "@/utils/supabase/client";
import { useEffect, useState, useRef } from "react";
import { ChatSession } from "./[sessionId]/page";

interface ChatMessage {
  senderName: string;
  content: string;
  timestamp: string;
  isUserMessage: boolean;
}

//component chat message with senderName content timestamp and isUserMessage boolean
const ChatMessage = ({ chatMessage }: { chatMessage: ChatMessage }) => {
  return (
    <div
      className={`flex ${
        chatMessage.isUserMessage ? "justify-end" : "justify-start"
      } mb-4`}
    >
      <div
        className={`max-w-xs p-3 rounded-lg ${
          chatMessage.isUserMessage 
            ? "bg-blue-500 text-white" 
            : "bg-gray-200 text-gray-800"
        }`}
      >
        <div className="text-sm font-semibold">{chatMessage.senderName}</div>
        <div className="text-sm">{chatMessage.content}</div>
        <div className="text-xs opacity-75 mt-1">{chatMessage.timestamp}</div>
      </div>
    </div>
  );
};

export default function ChatBox({
  chatSession,
}: {
  chatSession: ChatSession | null;
}) {
  const supabase = supabaseClient();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const channelRef = useRef<any>(null);
  const reconnectAttempts = useRef(0);
  const MAX_RECONNECT_ATTEMPTS = 5;

  const setupRealtimeSubscription = async () => {
    if (!chatSession) return;

    try {
      // Clean up existing subscription if any
      if (channelRef.current) {
        await channelRef.current.unsubscribe();
      }

      const channelName = `chat_${chatSession.session_id}`;
      
      const channel = supabase.channel(channelName, {
        config: {
          presence: {
            key: chatSession.current_user_id,
          },
        },
      });

      // Set up presence tracking
      channel.on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        console.log('Presence state:', state);
      });

      // Handle messages
      channel.on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `session_id=eq.${chatSession.session_id}`,
        },
        (payload) => {
          const newMessage = payload.new as {
            sender_id: string;
            content: string | null;
            created_at: string;
          };

          const isUserMessage = newMessage.sender_id === chatSession.current_user_id;
          const chatMessage: ChatMessage = {
            senderName: isUserMessage
              ? chatSession.current_user_name
              : chatSession.other_user_name,
            content: newMessage.content || '',
            timestamp: new Date(newMessage.created_at).toLocaleTimeString(),
            isUserMessage,
          };
          setMessages((prev) => [...prev, chatMessage]);
        }
      );

      // Subscribe with status handling
      const status = await channel.subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          console.log(`Successfully subscribed to ${channelName}`);
          setIsConnected(true);
          reconnectAttempts.current = 0;
          
          // Track user presence
          await channel.track({
            online_at: new Date().toISOString(),
            user_name: chatSession.current_user_name,
          });
        } else if (status === 'CHANNEL_ERROR') {
          console.error(`Subscription error for ${channelName}`);
          setIsConnected(false);
          
          if (reconnectAttempts.current < MAX_RECONNECT_ATTEMPTS) {
            reconnectAttempts.current += 1;
            console.log(`Attempting to reconnect (${reconnectAttempts.current}/${MAX_RECONNECT_ATTEMPTS})`);
            setTimeout(setupRealtimeSubscription, 2000 * reconnectAttempts.current);
          }
        }
      });

      channelRef.current = channel;
    } catch (error) {
      console.error('Error setting up realtime subscription:', error);
      setIsConnected(false);
    }
  };

  useEffect(() => {
    if (!chatSession) {
      setMessages([]);
      setIsConnected(false);
      return;
    }

    const fetchMessages = async () => {
      try {
        const { data, error } = await supabase
          .from('messages')
          .select(`
            sender_id,
            content,
            created_at
          `)
          .eq('session_id', chatSession.session_id)
          .order('created_at', { ascending: true });

        if (error) throw error;

        if (data) {
          const formattedMessages: ChatMessage[] = data.map((msg) => {
            const isUserMessage = msg.sender_id === chatSession.current_user_id;
            return {
              senderName: isUserMessage
                ? chatSession.current_user_name
                : chatSession.other_user_name,
              content: msg.content || '',
              timestamp: new Date(msg.created_at).toLocaleTimeString(),
              isUserMessage,
            };
          });
          setMessages(formattedMessages);
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    fetchMessages();
    setupRealtimeSubscription();

    return () => {
      if (channelRef.current) {
        console.log('Cleaning up subscription');
        channelRef.current.unsubscribe();
        channelRef.current = null;
      }
    };
  }, [chatSession]);

  return (
    <div className="flex flex-col h-full w-full">
      {!isConnected && (
        <div className="bg-yellow-100 text-yellow-800 px-4 py-2 text-sm">
          Connecting to chat...
        </div>
      )}
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((msg, index) => (
          <ChatMessage key={index} chatMessage={msg} />
        ))}
      </div>
    </div>
  );
}
