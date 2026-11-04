import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/context/ThemeContext";

export const metadata: Metadata = {
  title: "DevPilot // Multi-Agent AI Engineering Mission Control",
  description: "Mission control web app for multi-agent autonomous AI engineering teams (Shogun, Samurai, Sentinel, Shadow, Orchestrator).",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta name="color-scheme" content="light dark" />
      </head>
      <body className="antialiased selection:bg-rose-900 selection:text-white transition-colors duration-300">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
