import { render as renderUi, type RenderOptions } from "@testing-library/react";
import { PortfolioProvider } from "@/components/portfolio/PortfolioProvider";
import { portfolioData } from "@/data/portfolioData";
import type { PortfolioData } from "@/types/portfolio";

export function render(ui: React.ReactNode, options?: RenderOptions & { portfolio?: PortfolioData }) {
  const { portfolio = portfolioData, wrapper: Wrapper, ...renderOptions } = options ?? {};
  return renderUi(ui, { ...renderOptions, wrapper: ({ children }) => <PortfolioProvider value={portfolio}>{Wrapper ? <Wrapper>{children}</Wrapper> : children}</PortfolioProvider> });
}
