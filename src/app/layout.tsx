import type { Metadata, Viewport } from "next";
import { ToastProvider } from "@/components/Toast";
import { ServiceWorkerRegister } from "@/components/ServiceWorker";
import { baseMetadata, viewport as viewportConfig } from "@/lib/seo";
import "./globals.css";

export const metadata: Metadata = baseMetadata;
export const viewport: Viewport = viewportConfig;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Preconnect to external domains for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* DNS prefetch for common external resources */}
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />
        
        {/* Canonical URL fallback */}
        <link rel="canonical" href={process.env.NEXT_PUBLIC_SITE_URL || "https://zyga.dev"} />
      </head>
      <body className="antialiased">
        <ToastProvider>
          {children}
        </ToastProvider>
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
