import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Oleksandr Hrytskov | GitHub Profile",
  description:
    "A clean static profile page for Oleksandr Hrytskov built from public GitHub account data.",
  metadataBase: new URL("https://ohrytskov.github.io"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Oleksandr Hrytskov | GitHub Profile",
    description:
      "A clean static profile page for Oleksandr Hrytskov built from public GitHub account data.",
    url: "https://ohrytskov.github.io",
    siteName: "Oleksandr Hrytskov",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Oleksandr Hrytskov | GitHub Profile",
    description:
      "A clean static profile page for Oleksandr Hrytskov built from public GitHub account data.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full">{children}</body>
    </html>
  );
}
