import type { Metadata, Viewport } from "next";
import { Space_Grotesk } from "next/font/google"; 
import "./globals.css";
import ClientLayout from "@/components/ClientLayout";

const spaceGrotesk = Space_Grotesk({ 
  subsets: ["latin"],
  variable: "--font-space",
  display: "swap",
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
  // Added viewport-fit=cover for full immersion on notched phones
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
  },
};

// 🔥 Boss Level Viewport Settings
export const viewport: Viewport = {
  themeColor: "#050505",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5, // Accessbility best practice: allow pinch zoom if needed, but layout won't break
  userScalable: true, 
  viewportFit: "cover", // Ensures bg covers the notch area
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className="bg-[#020202]">
      <body 
        className={`
          ${spaceGrotesk.className} 
          bg-[#020202] text-white
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