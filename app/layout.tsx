import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/navbar";

const inter = Inter({subsets:["latin"]})

export const metadata: Metadata = {
  title: "Deeptangshu",
  description: "Portfolio site",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter} antialiased`}
      >
        {children}
        <Navbar/>
      </body>
    </html>
  );
}
