// ============================================================================
// parse-actions.ts
//
// A Meta Marketing API (Graph API de Insights) devolve resultados dentro de
// um campo `actions` (array de { action_type, value }), e valores monetários
// associados em `action_values` (mesmo formato). Esta função centraliza o
// reconhecimento dos action_types relevantes para o Performance Copilot,
// tanto para uma futura integração direta com a API quanto para qualquer
// fonte de dados que já venha nesse formato (ex.: JSON exportado).
//
// Nunca lança exceção: entradas ausentes/malformadas resultam em zeros.
// ============================================================================

import type { MetaAction, ParsedMetaActions } from "@/types/domain";

const CONVERSATION_ACTION_TYPES = new Set([
  "messaging_conversation_started",
  "onsite_conversion.messaging_conversation_started",
]);

const LEAD_ACTION_TYPES = new Set(["lead", "onsite_conversion.lead_grouped"]);

const PURCHASE_ACTION_TYPES = new Set(["purchase", "omni_purchase"]);

// Reconhecidos mas sem um campo dedicado no retorno (ver types/domain.ts):
// "link_click" normalmente já vem como métrica própria dos insights
// (inline_link_clicks), então aqui ele só é "identificado" — não ignorado
// silenciosamente por engano — e não soma em nenhum contador específico.
const RECOGNIZED_WITHOUT_BUCKET = new Set(["link_click"]);

function toNumber(value: string | number | null | undefined): number {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (!value) return 0;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function emptyResult(): ParsedMetaActions {
  return {
    conversationsStarted: 0,
    leads: 0,
    purchases: 0,
    registrations: 0,
    checkouts: 0,
    addToCart: 0,
    contacts: 0,
    landingPageViews: 0,
    purchaseValue: 0,
  };
}

/**
 * Agrega o array `actions` (resultados) e, opcionalmente, `action_values`
 * (valores monetários associados, usados para o valor de compra) de um
 * insight da Meta Marketing API em um objeto plano e tipado.
 */
export function parseMetaActions(
  actions: MetaAction[] | null | undefined,
  actionValues?: MetaAction[] | null
): ParsedMetaActions {
  const result = emptyResult();

  if (Array.isArray(actions)) {
    for (const action of actions) {
      if (!action || typeof action.action_type !== "string") continue;
      const type = action.action_type;
      const value = toNumber(action.value);

      if (CONVERSATION_ACTION_TYPES.has(type)) {
        result.conversationsStarted += value;
      } else if (LEAD_ACTION_TYPES.has(type)) {
        result.leads += value;
      } else if (PURCHASE_ACTION_TYPES.has(type)) {
        result.purchases += value;
      } else if (type === "complete_registration") {
        result.registrations += value;
      } else if (type === "initiate_checkout") {
        result.checkouts += value;
      } else if (type === "add_to_cart") {
        result.addToCart += value;
      } else if (type === "contact") {
        result.contacts += value;
      } else if (type === "landing_page_view") {
        result.landingPageViews += value;
      } else if (RECOGNIZED_WITHOUT_BUCKET.has(type)) {
        // reconhecido de propósito, sem contador dedicado.
      }
    }
  }

  if (Array.isArray(actionValues)) {
    for (const action of actionValues) {
      if (!action || typeof action.action_type !== "string") continue;
      if (PURCHASE_ACTION_TYPES.has(action.action_type)) {
        result.purchaseValue += toNumber(action.value);
      }
    }
  }

  return result;
}
