"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";

function subscribe() {
  return () => {};
}

function getSnapshot() {
  return isAuthenticated();
}

function getServerSnapshot() {
  // no servidor não há localStorage; trate como não autenticado
  return false;
}

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const authenticated = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    if (!authenticated) {
      router.push("/");
    }
  }, [authenticated, router]);

  if (!authenticated) return null;

  return <>{children}</>;
}