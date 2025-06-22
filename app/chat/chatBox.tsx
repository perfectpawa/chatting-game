

//component chat message with senderName content timestamp and isUserMessage boolean
const ChatMessage = ({ senderName, content, timestamp, isUserMessage }: {
    senderName: string;
    content: string;
    timestamp: string;
    isUserMessage: boolean;
}) => {
    return (
        <div className={`flex ${isUserMessage ? 'justify-end' : 'justify-start'} mb-4`}>
            <div className={`max-w-xs p-3 rounded-lg ${isUserMessage ? '' : ''}`}>
                <div className="text-sm font-semibold">{senderName}</div>
                <div className="text-sm">{content}</div>
                <div className="text-xs text-gray-500 mt-1">{timestamp}</div>
            </div>
        </div>
    );
};

export default function ChatBox() {
    const mockMessages = [
        {
            senderName: "Alice",
            content: "Hello, how are you?",
            timestamp: "2023-10-01 10:00",
            isUserMessage: false
        },
        {
            senderName: "Bob",
            content: "I'm good, thanks! How about you?",
            timestamp: "2023-10-01 10:01",
            isUserMessage: true
        },
    ]

    //self multiplier for the mock messages
    for (let i = 0; i < 10; i++) {
        mockMessages.push({
            senderName: `User ${i + 1}`,
            content: `This is a mock message number ${i + 1}`,
            timestamp: `2023-10-01 10:${i + 2}`,
            isUserMessage: i % 2 === 0
        });
    }

  return (
    <div className="flex flex-col h-full w-full">
        <div className="flex-1 overflow-y-auto p-4">
            {mockMessages.map((message, index) => (
                <ChatMessage
                    key={index}
                    senderName={message.senderName}
                    content={message.content}
                    timestamp={message.timestamp}
                    isUserMessage={message.isUserMessage}
                />
            ))}
        </div>
    </div>
  );
}
