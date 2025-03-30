import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "../components/Navbar";
import FooterWrapper from "../components/FooterWrapper";
import { ClerkProvider } from '@clerk/nextjs';
import { OnboardingProvider } from "../components/OnboardingContext";
import PreferencesWrapper from "../components/OnboardingWrapper";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FashionAI | Your Smart Wardrobe Assistant",
  description:
    "Discover outfit recommendations powered by AI. Upload images of your wardrobe to get personalized outfit ideas based on your style and the latest trends.",
  keywords:
    "fashion, AI, smart wardrobe, outfit recommendations, style trends, hackathon, wardrobe assistant",
  authors: [{ name: "FashionAI" }],
  openGraph: {
    title: "FashionAI | Your Smart Wardrobe Assistant",
    description:
      "Discover outfit recommendations powered by AI. Upload images of your wardrobe to get personalized outfit ideas based on your style and the latest trends.",
    url: "https://fashionai.com",
    siteName: "FashionAI",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "FashionAI - Your Smart Wardrobe Assistant",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "FashionAI | Your Smart Wardrobe Assistant",
    description:
      "Discover outfit recommendations powered by AI. Upload images of your wardrobe to get personalized outfit ideas based on your style and the latest trends.",
    images: ["/twitter-image.jpg"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" style={{ backgroundColor: "#ffffff" }}>
        <body className={`${inter.className} bg-white text-black`}>
          <OnboardingProvider>
            <Navbar />
            <PreferencesWrapper>
              {children}
            </PreferencesWrapper>
            <FooterWrapper />
          </OnboardingProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}