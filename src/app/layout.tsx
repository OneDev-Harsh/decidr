import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono, Lora } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Decidr.",
    template: "%s | Decidr.",
  },
  description:
    "Transform high-stakes uncertainty into auditable strategic clarity. AI-powered decision intelligence with multi-agent reasoning, scenario simulation, and cognitive blindspot auditing.",
  keywords: [
    "decision intelligence",
    "strategic planning",
    "AI reasoning",
    "scenario analysis",
    "enterprise strategy",
  ],
  authors: [{ name: "Decidr" }],
  metadataBase: new URL("https://decidr.app"),
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" }
    ],
    apple: [
      { url: "/icon.svg", type: "image/svg+xml" }
    ],
  },
  openGraph: {
    title: "Decidr — Enterprise Decision Intelligence",
    description:
      "Transform high-stakes uncertainty into auditable strategic clarity.",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#050505",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} ${lora.variable} ${jetbrainsMono.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
