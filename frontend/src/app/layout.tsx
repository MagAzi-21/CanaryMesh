import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "CanaryMesh | Cyber-Deception & Active Defense SOC",
  description: "High-Fidelity Intrusion Detection & Edge Quarantine Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} dark h-full antialiased`}
    >
      <body className="min-h-full bg-zinc-950 text-zinc-50 flex flex-col font-sans antialiased selection:bg-zinc-800 selection:text-zinc-100">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
