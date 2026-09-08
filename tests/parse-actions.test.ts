import { describe, expect, it } from "vitest";
import { parseMetaActions } from "@/lib/meta/parse-actions";

describe("parseMetaActions", () => {
  it("agrega conversas iniciadas (messaging_conversation_started e onsite_conversion)", () => {
    const result = parseMetaActions([
      { action_type: "messaging_conversation_started", value: "40" },
      { action_type: "onsite_conversion.messaging_conversation_started", value: "5" },
    ]);
    expect(result.conversationsStarted).toBe(45);
  });

  it("agrega leads (lead e onsite_conversion.lead_grouped)", () => {
    const result = parseMetaActions([
      { action_type: "lead", value: "12" },
      { action_type: "onsite_conversion.lead_grouped", value: "3" },
    ]);
    expect(result.leads).toBe(15);
  });

  it("agrega compras (purchase e omni_purchase)", () => {
    const result = parseMetaActions([
      { action_type: "purchase", value: "8" },
      { action_type: "omni_purchase", value: "2" },
    ]);
    expect(result.purchases).toBe(10);
  });

  it("agrega cadastros, checkouts, carrinho e contatos", () => {
    const result = parseMetaActions([
      { action_type: "complete_registration", value: "6" },
      { action_type: "initiate_checkout", value: "9" },
      { action_type: "add_to_cart", value: "20" },
      { action_type: "contact", value: "4" },
    ]);
    expect(result.registrations).toBe(6);
    expect(result.checkouts).toBe(9);
    expect(result.addToCart).toBe(20);
    expect(result.contacts).toBe(4);
  });

  it("agrega visualizações de página de destino (landing_page_view)", () => {
    const result = parseMetaActions([{ action_type: "landing_page_view", value: "150" }]);
    expect(result.landingPageViews).toBe(150);
  });

  it("reconhece link_click sem quebrar e sem somar em nenhum contador específico", () => {
    const result = parseMetaActions([{ action_type: "link_click", value: "300" }]);
    expect(result.conversationsStarted).toBe(0);
    expect(result.leads).toBe(0);
  });

  it("ignora action_types desconhecidos sem lançar erro", () => {
    expect(() => parseMetaActions([{ action_type: "some_future_action", value: "1" }])).not.toThrow();
  });

  it("mapeia action_values para o valor de compra (purchaseValue)", () => {
    const result = parseMetaActions(
      [{ action_type: "purchase", value: "3" }],
      [{ action_type: "purchase", value: "450.90" }]
    );
    expect(result.purchases).toBe(3);
    expect(result.purchaseValue).toBeCloseTo(450.9, 2);
  });

  it("nunca lança erro para entradas ausentes/nulas", () => {
    expect(() => parseMetaActions(null)).not.toThrow();
    expect(() => parseMetaActions(undefined, undefined)).not.toThrow();
    const result = parseMetaActions(null);
    expect(result.conversationsStarted).toBe(0);
    expect(result.purchaseValue).toBe(0);
  });

  it("ignora entradas malformadas dentro do array sem lançar erro", () => {
    // @ts-expect-error testando entrada malformada de propósito
    const result = parseMetaActions([null, { value: "10" }, { action_type: "lead", value: "5" }]);
    expect(result.leads).toBe(5);
  });
});
