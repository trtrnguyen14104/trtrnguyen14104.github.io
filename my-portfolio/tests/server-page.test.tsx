import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import Home, { generateMetadata } from "@/app/page";
import { portfolioData } from "@/data/portfolioData";
import { usePortfolio } from "@/components/portfolio/PortfolioProvider";

vi.mock("@/lib/cms/portfolio", () => ({ readPublicPortfolio: async () => ({ ...portfolioData, profile: { ...portfolioData.profile, name: "CMS owner", tagline: "CMS tagline" } }) }));
vi.mock("@/components/windows/PortfolioDesktop", () => ({ default: function MockDesktop() { const { profile } = usePortfolio(); return <h1>{profile.name}</h1>; } }));
describe("server portfolio page", () => {
  it("injects database content into the client provider", async () => { render(await Home()); expect(screen.getByText("CMS owner")).toBeInTheDocument(); });
  it("uses the current profile in metadata", async () => { expect(await generateMetadata()).toEqual({ title: "CMS owner — Windows OS Portfolio", description: "CMS tagline" }); });
});
