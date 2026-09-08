// ============================================================================
// TRACKING / ANALYTICS
// Estrutura preparada para Meta Pixel, GA4 e GTM.
// Nenhum ID real é usado — preencha em config/site.ts (analyticsConfig)
// quando estiver pronto para publicar.
// ============================================================================

export type AnalyticsEvent =
  | "page_view"
  | "click_cta_hero"
  | "click_cta_pricing"
  | "view_pricing"
  | "start_trial"
  | "contact_sales";

declare global {
  interface Window {
    dataLayer?: unknown[];
    fbq?: (...args: unknown[]) => void;
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * Dispara um evento de analytics para GTM/dataLayer, GA4 (gtag) e Meta Pixel
 * (fbq), quando disponíveis no window. Silencioso caso nenhum esteja
 * configurado — seguro para chamar em qualquer ambiente.
 */
export function trackEvent(
  event: AnalyticsEvent,
  payload: Record<string, unknown> = {}
) {
  if (typeof window === "undefined") return;

  try {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event, ...payload });

    if (typeof window.gtag === "function") {
      window.gtag("event", event, payload);
    }

    if (typeof window.fbq === "function") {
      window.fbq("trackCustom", event, payload);
    }
  } catch {
    // Falha silenciosa: analytics nunca deve quebrar a experiência do usuário.
  }
}
