"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

export function LogoutButton({ className }: { className?: string }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handleLogout() {
    setIsLoading(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={isLoading}
      className={cn(
        "flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-ink-secondary transition-colors hover:bg-white/[0.04] hover:text-ink disabled:opacity-60",
        className
      )}
    >
      <LogOut size={17} />
      Sair
    </button>
  );
}
