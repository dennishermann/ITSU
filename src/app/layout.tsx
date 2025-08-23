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
  title: "Image Transformation Service (ITS)",
  description: "Upload an image → remove background → flip horizontally → get a public link.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#0b0b0e] text-white`}
      >
        {/* orbital gradient + subtle noise */}
        <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(60%_60%_at_50%_-20%,rgba(124,77,255,.35),transparent),radial-gradient(40%_40%_at_80%_10%,rgba(255,78,205,.25),transparent)]" />
        <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 opacity-[0.03]" style={{backgroundImage:'url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0nNTAwJyBoZWlnaHQ9JzUwMCcgeG1sbnM9J2h0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnJz48ZmlsdGVyIGlkPSduJyB4PScwJyB5PScwJz48ZmVUdXJidWxlbmNlIHR5cGU9J3R1cmJ1bGVuY2UnIGJhc2VGcmVxdWVuY3k9JzAnIG51bU9jdGF2ZXM9JzYnIHN0aXRjaFRpbGVzPScnc3RpdGNoJz48ZmVCbGVuZCBzaXplPScxJyAvPjwvZmVUdXJidWxlbmNlPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSc1MDAnIGhlaWdodD0nNTAwJyBmaWx0ZXI9InVybCgjbikiIG9wYWNpdHk9JzAuNScvPjwvc3ZnPg==")'}} />
        {children}
      </body>
    </html>
  );
}
