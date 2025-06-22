import WrapBackground from "@/components/wrapBackground";
import ChatInput from "./chatInput";
import ChatBox from "./chatBox";

export default function Chat() {
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
