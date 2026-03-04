"use client";

/**
 * Root page – redirects authenticated users to dashboard, others to login.
 */
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Spinner from "@/components/ui/Spinner";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.replace("/dashboard");
      } else {
        router.replace("/login");
      }
    }
  }, [user, loading, router]);

  return (
    <div className="min-h-screen bg-retro-dark flex items-center justify-center">
      <div className="text-center">
        <Spinner size="lg" />
        <p className="font-mono text-retro-green text-xs uppercase tracking-widest mt-4">
          Loading...
        </p>
      </div>
    </div>
  );
}
