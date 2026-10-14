"use client";
export default function PortfolioError({ reset }: { reset: () => void }) {
  return <main className="min-h-screen flex flex-col items-center justify-center gap-5 p-8 text-center bg-[#4361ee] text-white"><h1 className="text-2xl font-bold">Portfolio is temporarily unavailable</h1><p>Please try again in a moment.</p><button className="bg-white text-blue-800 rounded px-5 py-3" onClick={reset}>Try again</button></main>;
}
