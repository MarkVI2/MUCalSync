import "./globals.css";
import { Nunito, Playwrite_US_Modern } from "next/font/google";

const nunito = Nunito({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-nunito",
});

const playwrite = Playwrite_US_Modern({
  display: "swap",
  variable: "--font-nunito",
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
      <body className={`$antialiased transition-colors duration-300`}>
        <div className="gradient-circles" />
        {children}
      </body>
    </html>
  );
}
