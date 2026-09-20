"use client";

import { useSyncExternalStore } from "react";
import { readUserRole, type UserRole } from "@/lib/auth";

export type UserRoleState = UserRole | "UNKNOWN" | null;

function subscribe(): () => void {
  return () => {};
}

function getServerRole(): UserRoleState {
  return "UNKNOWN";
}

export function useUserRole(): UserRoleState {
  return useSyncExternalStore(subscribe, readUserRole, getServerRole);
}
