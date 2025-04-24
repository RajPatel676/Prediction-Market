import '@coinbase/onchainkit/styles.css';
import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import Layout from "./components/Layout";
import { Roboto_Mono } from "next/font/google";
const roboto_mono = Roboto_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Prediction Market",
  description: "A decentralized prediction market on Base",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={roboto_mono.className}>
        <Providers>
          <Layout>{children}</Layout>
        </Providers>
      </body>
    </html>
  );
}
