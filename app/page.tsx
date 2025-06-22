import { Button } from "@/components/ui/button";
import WrapBackground from "@/components/wrapBackground";
import InitUser from "@/lib/store/initUser";

import { supabaseServer } from "@/utils/supabase/server";

export default async function Home() {

  const supabase = await supabaseServer();
  const { data, error } = await supabase.auth.getUser()  

  return (
    <WrapBackground>
      <div className="flex flex-col items-center justify-center h-full w-full">
        <div>
          <Button
            variant="outline"
            className="text-sm"
          >
            Start Game, {data.user ? data.user.email : "Guest"}
          </Button>
        </div>
      </div>
      <InitUser user={data.user} />
    </WrapBackground>
  );
}
