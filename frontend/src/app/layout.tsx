import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Agentic AI Researcher for Trading",
  description: "Autonomous multi-agent research system for Gold, Silver, Copper, Uranium & Zinc",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-950">{children}</body>
    </html>
  );
}
