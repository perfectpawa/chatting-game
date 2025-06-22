"use client";

import { useCallback } from "react";
import WrapBackground from "@/components/wrapBackground";
import { Button } from "@/components/ui/button";
import { FaGoogle, FaGithub } from "react-icons/fa";

import { supabaseClient } from "@/utils/supabase/client";


//refactor a button component with will get name and icon as props

const OAuthLoginButton = ({ provider, icon: Icon, onClick }:{
    provider: "google" | "github";
    icon: React.ComponentType<{ className?: string }>;
    onClick: () => void;
}) => {
  return (
    <Button
      type="button"
      variant="outline"
      className="w-full flex items-center justify-center gap-2 font-semibold shadow"
      onClick={onClick}
    >
      <Icon className="text-lg" />
      Continue with {provider.charAt(0).toUpperCase() + provider.slice(1)}
    </Button>
  );
}

export default function LoginPage() {

  const handleOAuthLogin = useCallback(async (provider: "google" | "github") => {
    const supabase = supabaseClient();
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: typeof window !== "undefined" ? `${window.location.origin}/auth/callback` : undefined,
      },
    });
  }, []);
  
  return (
    <WrapBackground>
      <div className="flex flex-col items-center justify-center h-full w-full">
        <div className="flex flex-col gap-4 w-full max-w-sm">
            <OAuthLoginButton
              provider="google"
              icon={FaGoogle}
              onClick={() => handleOAuthLogin("google")}
            />
            <OAuthLoginButton
              provider="github"
              icon={FaGithub}
              onClick={() => handleOAuthLogin("github")}
            />
        </div>
        <div className="text-sm text-gray-500 mt-4">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </div>
      </div>
    </WrapBackground>
  );
}
