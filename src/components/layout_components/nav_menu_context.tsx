"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

interface NavMenuState {
  aberto: boolean;
  abrir: () => void;
  fechar: () => void;
}

const DEFAULT_STATE: NavMenuState = {
  aberto: false,
  abrir: () => {},
  fechar: () => {},
};

const NavMenuContext = createContext<NavMenuState>(DEFAULT_STATE);

export function NavMenuProvider({ children }: { children: ReactNode }) {
  const [aberto, setAberto] = useState(false);

  const abrir = useCallback(() => setAberto(true), []);
  const fechar = useCallback(() => setAberto(false), []);

  const value = useMemo<NavMenuState>(() => ({ aberto, abrir, fechar }), [aberto, abrir, fechar]);

  return <NavMenuContext.Provider value={value}>{children}</NavMenuContext.Provider>;
}

export function useNavMenu(): NavMenuState {
  return useContext(NavMenuContext);
}
