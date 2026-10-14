import type { Metadata } from "next";
import PortfolioDesktop from "@/components/windows/PortfolioDesktop";
import { PortfolioProvider } from "@/components/portfolio/PortfolioProvider";
import { readPublicPortfolio } from "@/lib/cms/portfolio";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function generateMetadata(): Promise<Metadata> {
  const { profile } = await readPublicPortfolio();
  return { title: `${profile.name} — Windows OS Portfolio`, description: profile.tagline };
}
export default async function Home() {
  const portfolio = await readPublicPortfolio();
  return <PortfolioProvider value={portfolio}><PortfolioDesktop /></PortfolioProvider>;
}
