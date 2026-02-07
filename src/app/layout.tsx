import type { Metadata, Viewport } from "next";
import { Space_Grotesk } from "next/font/google"; 
import "./globals.css";
import ClientLayout from "@/components/ClientLayout";

// 🔥 OPTIMIZED FONT LOADING
const spaceGrotesk = Space_Grotesk({ 
  subsets: ["latin"],
  variable: "--font-space",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"], // Preload specific weights
});

export const metadata: Metadata = {
  metadataBase: new URL("https://digitalpixora.com"),
  title: {
    default: "Digital Pixora | Architecting Digital Dominance",
    template: "%s | Digital Pixora"
  },
  description: "A premium software house forging advanced digital ecosystems with Next.js, AI, and 3D WebGL.",
  keywords: ["Web Development", "AI Agency", "Next.js", "3D Websites", "Premium Design", "Hyderabad Software House", "Pixora"],
  authors: [{ name: "Digital Pixora Team" }],
  creator: "Digital Pixora",
  publisher: "Digital Pixora",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Digital Pixora",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://digitalpixora.com",
    siteName: "Digital Pixora",
    images: [
      {
        url: "/og-image.jpg", // Make sure this image exists in public folder
        width: 1200,
        height: 630,
        alt: "Digital Pixora - The Future of Tech",
      },
    ],
  },
};

// 🔥 BOSS LEVEL VIEWPORT (Mobile Immersion)
export const viewport: Viewport = {
  themeColor: "#020202",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5, 
  userScalable: true, 
  viewportFit: "cover", // Ensures content goes behind the Notch
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className="bg-[#020202] scroll-smooth">
      <body 
        className={`
          ${spaceGrotesk.className} 
          bg-[#020202] text-white
          antialiased overflow-x-hidden
          selection:bg-[#E50914] selection:text-white
        `}
      > 
        {/* Main Logic moved to ClientLayout. 
           SmoothScroll component is removed to prevent Double Scroll.
        */}
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}