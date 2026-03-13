import type { Metadata } from "next";
import "./globals.css";
import ClientLayout from "./components/ClientLayout";

export const metadata: Metadata = {
  title: "AI Personality Twin | Create Your Digital AI Twin",
  description: "Build your AI digital twin using voice cloning, personality analysis, and blockchain identity verification. Powered by IQ AI agents, ElevenLabs, and Ethereum.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased" style={{ fontFamily: "'Inter', sans-serif" }}>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
