import type { Metadata } from "next";
import { Fraunces, Work_Sans } from "next/font/google";
import { MotionRoot } from "@/components/ui/MotionRoot";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-fraunces",
  display: "swap",
});

const workSans = Work_Sans({
  subsets: ["latin"],
  variable: "--font-work-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Us, Anyway",
  description: "A private thread between two people, two skies apart.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${fraunces.variable} ${workSans.variable} bg-paper font-sans text-ink antialiased`}
      >
        <MotionRoot>{children}</MotionRoot>
      </body>
    </html>
  );
}
