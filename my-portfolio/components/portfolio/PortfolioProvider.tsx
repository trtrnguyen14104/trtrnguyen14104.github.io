"use client";
import { createContext, useContext } from "react";
import type { PortfolioData } from "@/types/portfolio";

const PortfolioContext = createContext<PortfolioData | null>(null);
export function PortfolioProvider({ value, children }: { value: PortfolioData; children: React.ReactNode }) {
  return <PortfolioContext.Provider value={value}>{children}</PortfolioContext.Provider>;
}
export function usePortfolio(): PortfolioData {
  const value = useContext(PortfolioContext);
  if (!value) throw new Error("PortfolioProvider is required");
  return value;
}
