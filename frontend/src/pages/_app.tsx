import "./globals.css";

import { Navbar } from "@/components/Navbar";
import { ThemeProvider } from "@/components/ThemeProvider";
import { init } from "@airstack/airstack-react";
import type { Metadata } from "next";
import type { AppProps } from "next/app";

import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Programmatic NFTs",
  description: "Paid sponsorships for your NFTs",
};

init(process.env.AIRSTACK_API_KEY!);

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div className={inter.className}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <Navbar />
        <Component {...pageProps} />
      </ThemeProvider>
    </div>
  );
}
