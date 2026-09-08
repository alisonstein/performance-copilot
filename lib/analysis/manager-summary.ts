// ============================================================================
// manager-summary.ts
// "Leitura do gestor": comparação técnica com o período anterior (CPM, CTR,
// CPC, CPA, frequência) + uma conclusão sobre onde parece estar o gargalo.
// Só existe quando há uma análise anterior para comparar.
// ============================================================================

import { formatBRL, formatChangePct, formatFrequency, formatPercent } from "@/lib/analysis/metrics";
import type { TotalsComparison } from "@/lib/analysis/compare";
import type { MetricsTotals } from "@/types/domain";

export interface ManagerReading {
  bullets: string[];
  conclusion: string;
}

const RELEVANT_CHANGE_THRESHOLD = 5; // % — abaixo disso, tratamos como "estável"

function isRelevant(changePct: number | null): boolean {
  return changePct !== null && Math.abs(changePct) >= RELEVANT_CHANGE_THRESHOLD;
}

function isStable(changePct: number | null): boolean {
  return changePct !== null && Math.abs(changePct) < RELEVANT_CHANGE_THRESHOLD;
}

export function buildManagerReading(current: MetricsTotals, comparison: TotalsComparison): ManagerReading {
  const bullets: string[] = [
    `CPM ${formatChangePct(comparison.cpmChangePct)} (agora ${formatBRL(current.cpm)})`,
    `CTR ${formatChangePct(comparison.ctrChangePct)} (agora ${formatPercent(current.ctr)})`,
    `CPC ${formatChangePct(comparison.cpcChangePct)} (agora ${formatBRL(current.cpc)})`,
    `CPA ${formatChangePct(comparison.cpaChangePct)} (agora ${formatBRL(current.cpa)})`,
  ];

  if (current.frequency !== null) {
    bullets.push(`Frequência chegou a ${formatFrequency(current.frequency)}`);
  }

  let conclusion =
    "Sem uma análise anterior comparável, ainda não é possível apontar tendência de gargalo com segurança.";

  const cpmStable = isStable(comparison.cpmChangePct);
  const ctrFell = comparison.ctrChangePct !== null && comparison.ctrChangePct < -RELEVANT_CHANGE_THRESHOLD;
  const cpmRose = comparison.cpmChangePct !== null && comparison.cpmChangePct > RELEVANT_CHANGE_THRESHOLD;
  const cpcRose = comparison.cpcChangePct !== null && comparison.cpcChangePct > RELEVANT_CHANGE_THRESHOLD;
  const cpaRose = comparison.cpaChangePct !== null && comparison.cpaChangePct > RELEVANT_CHANGE_THRESHOLD;

  if (cpmStable && ctrFell) {
    conclusion =
      "O gargalo principal parece estar na etapa criativa: o CPM permaneceu relativamente estável enquanto o CTR caiu, ou seja, o leilão não ficou mais caro — o público é que está reagindo menos aos anúncios.";
  } else if (cpmRose && !ctrFell) {
    conclusion =
      "O gargalo parece estar na disputa por audiência: o CPM subiu enquanto o CTR se manteve, sugerindo mais concorrência pelo mesmo público, não um problema de criativo.";
  } else if (cpcRose && cpaRose && !isRelevant(comparison.ctrChangePct)) {
    conclusion =
      "O aumento de CPC e CPA sem variação relevante de CTR sugere que o custo do clique subiu na plataforma — vale acompanhar se é um movimento sazonal ou de concorrência.";
  } else if (!isRelevant(comparison.cpaChangePct)) {
    conclusion = "As métricas se mantiveram relativamente estáveis em relação ao período anterior.";
  } else if (cpaRose) {
    conclusion =
      "O CPA subiu no período. Vale investigar se o movimento vem do leilão (CPM/CPC) ou da conversão após o clique.";
  }

  return { bullets, conclusion };
}
