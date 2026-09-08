import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { AnalysisResultView } from "@/components/dashboard/AnalysisResultView";
import { compareTotals } from "@/lib/analysis/compare";
import { formatMonthYear } from "@/lib/format-date";
import { requireUser } from "@/lib/supabase/auth";
import type {
  AlertItem,
  CampaignMetrics,
  MetricsTotals,
  OpportunityItem,
  PrimaryResultType,
  RecommendationItem,
} from "@/types/domain";
import type { Platform } from "@/types/database";

export const metadata: Metadata = {
  title: "Resultado da Análise",
};

interface AnalysisPageProps {
  params: Promise<{ id: string }>;
}

const ANALYSIS_COLUMNS =
  "id, client_id, platform, start_date, end_date, file_name, primary_result_type, total_spend, impressions, clicks, ctr, cpc, cpm, conversions, cpa, revenue, roas, reach, frequency, link_clicks, landing_page_views, conversations_started, cost_per_conversation, leads, cost_per_lead, purchases, cost_per_purchase, registrations, checkouts, add_to_cart, contacts";

const ITEM_COLUMNS =
  "campaign_name, adset_name, ad_name, spend, impressions, clicks, ctr, cpc, cpm, conversions, cpa, revenue, roas, reach, frequency, link_clicks, landing_page_views, conversations_started, cost_per_conversation, leads, cost_per_lead, purchases, cost_per_purchase, registrations, checkouts, add_to_cart, contacts, status, ad_id, creative_id, thumbnail_url, creative_type";

interface AnalysisRow {
  id: string;
  client_id: string;
  platform: string;
  start_date: string;
  end_date: string;
  file_name: string | null;
  primary_result_type: string;
  total_spend: number;
  impressions: number;
  clicks: number;
  ctr: number;
  cpc: number;
  cpm: number;
  conversions: number;
  cpa: number;
  revenue: number;
  roas: number;
  reach: number | null;
  frequency: number | null;
  link_clicks: number | null;
  landing_page_views: number | null;
  conversations_started: number | null;
  cost_per_conversation: number | null;
  leads: number | null;
  cost_per_lead: number | null;
  purchases: number | null;
  cost_per_purchase: number | null;
  registrations: number | null;
  checkouts: number | null;
  add_to_cart: number | null;
  contacts: number | null;
}

function toTotals(row: AnalysisRow): MetricsTotals {
  return {
    spend: Number(row.total_spend),
    impressions: Number(row.impressions),
    clicks: Number(row.clicks),
    ctr: Number(row.ctr),
    cpc: Number(row.cpc),
    cpm: Number(row.cpm),
    conversions: Number(row.conversions),
    cpa: Number(row.cpa),
    revenue: Number(row.revenue),
    roas: Number(row.roas),
    reach: row.reach !== null ? Number(row.reach) : null,
    frequency: row.frequency !== null ? Number(row.frequency) : null,
    linkClicks: row.link_clicks !== null ? Number(row.link_clicks) : null,
    landingPageViews: row.landing_page_views !== null ? Number(row.landing_page_views) : null,
    conversationsStarted: row.conversations_started !== null ? Number(row.conversations_started) : null,
    costPerConversation: row.cost_per_conversation !== null ? Number(row.cost_per_conversation) : null,
    leads: row.leads !== null ? Number(row.leads) : null,
    costPerLead: row.cost_per_lead !== null ? Number(row.cost_per_lead) : null,
    purchases: row.purchases !== null ? Number(row.purchases) : null,
    costPerPurchase: row.cost_per_purchase !== null ? Number(row.cost_per_purchase) : null,
    registrations: row.registrations !== null ? Number(row.registrations) : null,
    checkouts: row.checkouts !== null ? Number(row.checkouts) : null,
    addToCart: row.add_to_cart !== null ? Number(row.add_to_cart) : null,
    contacts: row.contacts !== null ? Number(row.contacts) : null,
  };
}

export default async function AnalysisResultPage({ params }: AnalysisPageProps) {
  const { id } = await params;
  const { supabase, user } = await requireUser();

  const { data: analysis } = await supabase
    .from("analyses")
    .select(`${ANALYSIS_COLUMNS}, clients(name)`)
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!analysis) {
    notFound();
  }

  const analysisRow = analysis as unknown as AnalysisRow;
  const clientName = (analysis as unknown as { clients: { name: string } | null }).clients?.name ?? "Cliente";

  const [{ data: items }, { data: aiAnalysis }, { data: previousAnalysis }] = await Promise.all([
    supabase.from("analysis_items").select(ITEM_COLUMNS).eq("analysis_id", analysis.id),
    supabase
      .from("ai_analysis")
      .select("diagnosis, alerts, opportunities, recommendations, executive_summary, source")
      .eq("analysis_id", analysis.id)
      .maybeSingle(),
    supabase
      .from("analyses")
      .select(ANALYSIS_COLUMNS)
      .eq("client_id", analysis.client_id)
      .eq("user_id", user.id)
      .eq("platform", analysis.platform)
      .lt("start_date", analysis.start_date)
      .order("start_date", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const campaigns: CampaignMetrics[] = (items ?? []).map((item) => ({
    campaignName: item.campaign_name,
    adsetName: item.adset_name,
    adName: item.ad_name,
    spend: Number(item.spend),
    impressions: Number(item.impressions),
    clicks: Number(item.clicks),
    conversions: Number(item.conversions),
    revenue: Number(item.revenue),
    ctr: Number(item.ctr),
    cpc: Number(item.cpc),
    cpm: Number(item.cpm),
    cpa: Number(item.cpa),
    roas: Number(item.roas),
    reach: item.reach !== null ? Number(item.reach) : null,
    frequency: item.frequency !== null ? Number(item.frequency) : null,
    linkClicks: item.link_clicks !== null ? Number(item.link_clicks) : null,
    landingPageViews: item.landing_page_views !== null ? Number(item.landing_page_views) : null,
    conversationsStarted: item.conversations_started !== null ? Number(item.conversations_started) : null,
    costPerConversation: item.cost_per_conversation !== null ? Number(item.cost_per_conversation) : null,
    leads: item.leads !== null ? Number(item.leads) : null,
    costPerLead: item.cost_per_lead !== null ? Number(item.cost_per_lead) : null,
    purchases: item.purchases !== null ? Number(item.purchases) : null,
    costPerPurchase: item.cost_per_purchase !== null ? Number(item.cost_per_purchase) : null,
    registrations: item.registrations !== null ? Number(item.registrations) : null,
    checkouts: item.checkouts !== null ? Number(item.checkouts) : null,
    addToCart: item.add_to_cart !== null ? Number(item.add_to_cart) : null,
    contacts: item.contacts !== null ? Number(item.contacts) : null,
    status: (item.status as CampaignMetrics["status"]) ?? null,
    adId: item.ad_id,
    creativeId: item.creative_id,
    thumbnailUrl: item.thumbnail_url,
    creativeType: (item.creative_type as CampaignMetrics["creativeType"]) ?? null,
  }));

  const totals = toTotals(analysisRow);

  let comparison = null;
  let previousPeriodLabel: string | null = null;
  if (previousAnalysis) {
    const previousTotals = toTotals(previousAnalysis as unknown as AnalysisRow);
    comparison = compareTotals(totals, previousTotals);
    previousPeriodLabel = formatMonthYear((previousAnalysis as unknown as AnalysisRow).start_date);
  }

  const aiResult = aiAnalysis
    ? {
        diagnosis: aiAnalysis.diagnosis ?? "",
        executiveSummary: aiAnalysis.executive_summary ?? "",
        alerts: (aiAnalysis.alerts ?? []) as AlertItem[],
        opportunities: (aiAnalysis.opportunities ?? []) as OpportunityItem[],
        recommendations: (aiAnalysis.recommendations ?? []) as RecommendationItem[],
        source: aiAnalysis.source,
      }
    : {
        diagnosis: "Diagnóstico indisponível para esta análise.",
        executiveSummary: "",
        alerts: [] as AlertItem[],
        opportunities: [] as OpportunityItem[],
        recommendations: [] as RecommendationItem[],
        source: "rules" as const,
      };

  return (
    <AnalysisResultView
      clientName={clientName}
      platform={analysisRow.platform as Platform}
      startDate={analysisRow.start_date}
      endDate={analysisRow.end_date}
      fileName={analysisRow.file_name}
      primaryResultType={(analysisRow.primary_result_type as PrimaryResultType) ?? "other"}
      totals={totals}
      campaigns={campaigns}
      aiResult={aiResult}
      comparison={comparison}
      previousPeriodLabel={previousPeriodLabel}
    />
  );
}
