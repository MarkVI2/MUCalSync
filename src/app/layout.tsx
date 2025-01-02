import "./globals.css";
import { Nunito, Fredoka } from "next/font/google";

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

export const metadata = {
  title: "MUCalSync",
  description: "Sync your MUERP timetable with Google Calendar",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${fredoka.variable} ${nunito.variable} antialiased transition-colors duration-300`}
      >
        <div className="gradient-circles" />
        {children}
      </body>
    </html>
  );
}
