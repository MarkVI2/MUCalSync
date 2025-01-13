"use client";
import "./globals.css";
import { Nunito, Fredoka } from "next/font/google";
import { metadata } from "./metadata";
import Providers from "../components/Providers";
import { Analytics } from "@vercel/analytics/react";

const nunito = Nunito({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-nunito",
});

const fredoka = Fredoka({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-fredoka",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>{metadata.title}</title>
        <meta name="description" content={metadata.description} />
        <link rel="icon" href={metadata.icons.icon} />
        <link rel="apple-touch-icon" href={metadata.icons.apple} />
      </head>
      <body
        className={`${fredoka.variable} ${nunito.variable} antialiased transition-colors duration-300`}
      >
        <Providers>
          <div className="gradient-circles" />
          {children}
          <Analytics />
        </Providers>
      </body>
    </html>
  );
}
