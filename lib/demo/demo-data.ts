// ============================================================================
// Dados de demonstração. Usados apenas na página /dashboard/demo para dar um
// gostinho do produto sem exigir upload real. As linhas de campanha são
// fictícias, mas o cálculo de métricas e o motor de regras que rodam em cima
// delas são os mesmos usados em produção (runAnalysisEngine real).
//
// Nunca confundir com dados reais: a UI marca claramente esta página como
// "DADOS DE DEMONSTRAÇÃO".
// ============================================================================

import { runAnalysisEngine } from "@/lib/analysis/analysis-engine";
import type { AiAnalysisResult, NormalizedCampaignRow, RecommendationItem } from "@/types/domain";

export const DEMO_CLIENT_NAME = "Loja Exemplo";
export const DEMO_PLATFORM = "meta_ads" as const;
export const DEMO_START_DATE = "2026-08-01";
export const DEMO_END_DATE = "2026-08-31";
export const DEMO_FILE_NAME = "meta-ads-loja-exemplo-agosto.csv";

export const DEMO_CAMPAIGN_ROWS: NormalizedCampaignRow[] = [
  {
    campaignName: "Campanha Institucional",
    adsetName: "Interesses",
    adName: "Estático 01",
    spend: 2100,
    impressions: 180000,
    clicks: 3200,
    conversions: 58,
    revenue: 9200,
  },
  {
    campaignName: "Remarketing Carrinho",
    adsetName: "Custom Audience",
    adName: "UGC 03",
    spend: 1800,
    impressions: 90000,
    clicks: 2600,
    conversions: 96,
    revenue: 15400,
  },
  {
    campaignName: "Prospecção Broad",
    adsetName: "Broad",
    adName: "Video 04",
    spend: 3400,
    impressions: 260000,
    clicks: 3900,
    conversions: 41,
    revenue: 5600,
  },
  {
    campaignName: "Campanha Black Friday",
    adsetName: "Lookalike 1%",
    adName: "Carrossel 02",
    spend: 2980,
    impressions: 210000,
    clicks: 4700,
    conversions: 112,
    revenue: 21800,
  },
  {
    campaignName: "Institucional Vídeo",
    adsetName: "Interesses amplos",
    adName: "Video 01",
    spend: 1650,
    impressions: 140000,
    clicks: 1450,
    conversions: 6,
    revenue: 480,
  },
];

export function getDemoEngineResult() {
  return runAnalysisEngine(DEMO_CAMPAIGN_ROWS);
}

export function getDemoAiResult(): AiAnalysisResult {
  const engineResult = getDemoEngineResult();

  const recommendations: RecommendationItem[] = [
    {
      title: "Testar aumento de verba no Remarketing",
      description:
        "A campanha \"Remarketing Carrinho\" está entre as mais eficientes do período. Considere testar um aumento gradual de investimento para avaliar se o resultado se mantém em escala maior.",
      priority: "medium",
    },
    {
      title: "Investigar a Campanha Institucional Vídeo",
      description:
        "Essa campanha teve poucas conversões frente ao investimento. Vale investigar criativo, público e página de destino antes de decidir os próximos passos.",
      priority: "high",
    },
    {
      title: "Avaliar novos criativos para Prospecção Broad",
      description:
        "O CPA está acima da média do período. Pode ser interessante testar novos formatos de criativo para melhorar a eficiência dessa campanha.",
      priority: "low",
    },
  ];

  return {
    diagnosis:
      "O período apresentou desempenho misto entre as campanhas: enquanto Remarketing Carrinho e Black Friday mostraram boa eficiência de custo por resultado, a campanha Institucional Vídeo consumiu verba relevante sem retorno proporcional. Os dados sugerem espaço para realocar parte do investimento das campanhas menos eficientes para as que já vêm performando bem.",
    executiveSummary:
      "No período analisado, a Loja Exemplo investiu R$ 11.930,00 e gerou 313 conversões, com custo médio de R$ 38,12 por resultado. As campanhas de remarketing e Black Friday se destacaram em eficiência, enquanto a campanha institucional em vídeo merece atenção.",
    alerts: engineResult.alerts,
    opportunities: engineResult.opportunities,
    recommendations,
    source: "rules",
  };
}
