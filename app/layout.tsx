import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { siteConfig, analyticsConfig } from "@/config/site";
import { ToastProvider } from "@/components/ui/toast";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: "Performance Copilot | IA para Gestores de Tráfego",
    template: "%s | Performance Copilot",
  },
  description: siteConfig.description,
  keywords: [
    "gestor de tráfego",
    "meta ads",
    "google ads",
    "relatório de tráfego pago",
    "análise de campanhas",
    "IA para marketing",
    "agência de performance",
  ],
  authors: [{ name: "Performance Copilot" }],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: "Performance Copilot | IA para Gestores de Tráfego",
    description: siteConfig.description,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: siteConfig.name,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Performance Copilot | IA para Gestores de Tráfego",
    description: siteConfig.description,
    images: [siteConfig.ogImage],
  },
  icons: {
    icon: "/favicon.svg",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#080B14",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { GA4_MEASUREMENT_ID, GTM_CONTAINER_ID, META_PIXEL_ID } =
    analyticsConfig;

  return (
    <html lang="pt-BR" className={inter.variable}>
      <body className="min-h-screen bg-bg font-sans">
        <ToastProvider>{children}</ToastProvider>

        {/* Google Tag Manager — preencha GTM_CONTAINER_ID em config/site.ts */}
        {GTM_CONTAINER_ID ? (
          <Script id="gtm-script" strategy="afterInteractive">
            {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${GTM_CONTAINER_ID}');`}
          </Script>
        ) : null}

        {/* GA4 — preencha GA4_MEASUREMENT_ID em config/site.ts */}
        {GA4_MEASUREMENT_ID ? (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA4_MEASUREMENT_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga4-init" strategy="afterInteractive">
              {`window.dataLayer = window.dataLayer || [];function gtag(){dataLayer.push(arguments);}gtag('js', new Date());gtag('config', '${GA4_MEASUREMENT_ID}');`}
            </Script>
          </>
        ) : null}

        {/* Meta Pixel — preencha META_PIXEL_ID em config/site.ts */}
        {META_PIXEL_ID ? (
          <Script id="meta-pixel-init" strategy="afterInteractive">
            {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init', '${META_PIXEL_ID}');fbq('track', 'PageView');`}
          </Script>
        ) : null}
      </body>
    </html>
  );
}
