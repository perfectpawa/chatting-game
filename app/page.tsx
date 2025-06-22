import { Button } from "@/components/ui/button";
import WrapBackground from "@/components/wrapBackground";

export default function Home() {
  return (
    <WrapBackground>
      <div className="flex flex-col items-center justify-center h-full w-full">
        <div>
          <Button
            variant="outline"
            className="text-sm"
          >
            Start Game
          </Button>
        </div>
      </div>
    </WrapBackground>
  );
}
