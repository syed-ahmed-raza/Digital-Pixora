import type { Metadata, Viewport } from "next";
import { Space_Grotesk } from "next/font/google"; // 🔥 Brand Font
import "./globals.css";
import ClientLayout from "@/components/ClientLayout";

// Load Font
const spaceGrotesk = Space_Grotesk({ 
  subsets: ["latin"],
  variable: "--font-space",
  display: "swap",
});

// 👑 PREMIUM METADATA (Google & Socials)
export const metadata: Metadata = {
  metadataBase: new URL("https://digitalpixora.com"),
  title: {
    default: "Digital Pixora | Architecting Digital Dominance",
    template: "%s | Digital Pixora"
  },
  description: "A premium software house forging advanced digital ecosystems with Next.js, AI, and 3D WebGL. We build revenue engines, not just websites.",
  keywords: ["Web Development", "AI Agency", "Next.js", "3D Websites", "Premium Design", "Hyderabad Software House"],
  authors: [{ name: "Digital Pixora Team" }],
  creator: "Digital Pixora",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "Digital Pixora | Future-Ready Web Systems",
    description: "Forging brands into icons through code & design.",
    url: "https://digitalpixora.com",
    siteName: "Digital Pixora",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/og-image.png", // Make sure this image exists in /public
        width: 1200,
        height: 630,
        alt: "Digital Pixora Interface",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Digital Pixora | The AI Web Agency",
    description: "Forging brands into icons through code & design.",
    images: ["/og-image.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#050505",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1, // Prevents zooming on mobile for app-like feel
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning >
      <body 
        className={`
          ${spaceGrotesk.className} 
          bg-[hsl(var(--background))] text-[hsl(var(--foreground))]
          antialiased overflow-x-hidden
          selection:bg-[#E50914] selection:text-white
        `}
      > 
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}