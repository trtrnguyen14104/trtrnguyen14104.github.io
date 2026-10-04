import type { Metadata } from "next";
import { Pacifico, Plus_Jakarta_Sans, Geist, Geist_Mono, Roboto } from "next/font/google";
import "./globals.css";

const pacifico = Pacifico({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-pacifico",
  display: "swap",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta-sans",
  display: "swap",
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

// Used only by the boot screen so the Windows XP logo keeps its original type
const roboto = Roboto({
  weight: ["300", "400", "700"],
  subsets: ["latin"],
  variable: "--font-roboto",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Trần Trung Nguyên — Windows OS Portfolio",
  description:
    "Interactive Windows OS desktop portfolio showcasing software engineering projects, technical skills, and background of Trần Trung Nguyên.",
  icons: {
    icon: "/icons/Windows-FOLDER.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${pacifico.variable} ${plusJakartaSans.variable} ${geistSans.variable} ${geistMono.variable} ${roboto.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body
        className="min-h-full flex flex-col font-sans overflow-hidden select-none bg-[#4361ee] text-white"
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
