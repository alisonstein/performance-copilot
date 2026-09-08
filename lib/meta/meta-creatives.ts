import "server-only";
import type { CreativeType } from "@/types/domain";

// ============================================================================
// meta-creatives.ts
//
// Serviço para buscar dados de criativo (thumbnail, tipo, IDs) diretamente
// da Meta Marketing API. Separado do parsing de insights (parse-actions.ts)
// de propósito: insights trazem métricas, este serviço traz metadados de
// exibição do anúncio.
//
// IMPORTANTE: este serviço ainda não é chamado por nenhuma tela do produto.
// O Performance Copilot hoje só processa dados via CSV — não há fluxo de
// OAuth com a Meta implementado (isso é o que as tabelas meta_connections /
// meta_ad_accounts, criadas em 0002_meta_integration.sql, preparam para o
// futuro). Este arquivo deixa a busca de criativos pronta para quando esse
// fluxo existir: quem chamar precisa apenas passar um access_token válido.
//
// Nunca lança exceção: qualquer falha (rede, permissão, anúncio removido)
// resulta em `null` para aquele anúncio específico, para nunca derrubar a
// análise por causa de um preview de criativo indisponível.
// ============================================================================

const META_GRAPH_API_VERSION = "v21.0";
const META_GRAPH_API_BASE = `https://graph.facebook.com/${META_GRAPH_API_VERSION}`;

export interface MetaCreativeInfo {
  adId: string;
  adName: string | null;
  creativeId: string | null;
  thumbnailUrl: string | null;
  imageUrl: string | null;
  videoId: string | null;
  effectiveObjectStoryId: string | null;
  creativeType: CreativeType;
}

interface MetaCreativeApiResponse {
  id: string;
  name?: string;
  creative?: {
    id?: string;
    thumbnail_url?: string;
    image_url?: string;
    video_id?: string;
    effective_object_story_id?: string;
    object_story_spec?: {
      link_data?: unknown;
      video_data?: unknown;
    };
    asset_feed_spec?: {
      images?: unknown[];
      videos?: unknown[];
    };
  };
  error?: { message?: string };
}

function inferCreativeType(creative: MetaCreativeApiResponse["creative"]): CreativeType {
  if (!creative) return "unknown";

  const assetImages = creative.asset_feed_spec?.images?.length ?? 0;
  const assetVideos = creative.asset_feed_spec?.videos?.length ?? 0;
  if (assetImages + assetVideos > 1) return "carousel";

  if (creative.video_id) return "video";
  if (creative.object_story_spec?.video_data) return "video";
  if (creative.image_url) return "image";
  if (creative.object_story_spec?.link_data) return "image";

  return "unknown";
}

/**
 * Busca metadados de criativo de um único anúncio. Retorna `null` (nunca
 * lança) se a chamada falhar por qualquer motivo.
 */
export async function fetchAdCreative(
  adId: string,
  accessToken: string
): Promise<MetaCreativeInfo | null> {
  const fields = [
    "id",
    "name",
    "creative{id,thumbnail_url,image_url,video_id,effective_object_story_id,object_story_spec,asset_feed_spec}",
  ].join(",");

  const url = `${META_GRAPH_API_BASE}/${encodeURIComponent(adId)}?fields=${encodeURIComponent(
    fields
  )}&access_token=${encodeURIComponent(accessToken)}`;

  try {
    const response = await fetch(url, { method: "GET" });
    if (!response.ok) return null;

    const data = (await response.json()) as MetaCreativeApiResponse;
    if (data.error) return null;

    return {
      adId: data.id,
      adName: data.name ?? null,
      creativeId: data.creative?.id ?? null,
      thumbnailUrl: data.creative?.thumbnail_url ?? null,
      imageUrl: data.creative?.image_url ?? null,
      videoId: data.creative?.video_id ?? null,
      effectiveObjectStoryId: data.creative?.effective_object_story_id ?? null,
      creativeType: inferCreativeType(data.creative),
    };
  } catch {
    return null;
  }
}

/**
 * Busca metadados de criativo para vários anúncios em paralelo. Cada
 * falha individual vira `null` naquela entrada — uma conta com muitos
 * anúncios nunca falha por completo por causa de um único anúncio com
 * problema de permissão ou removido.
 */
export async function fetchAdCreatives(
  adIds: string[],
  accessToken: string
): Promise<Map<string, MetaCreativeInfo | null>> {
  const uniqueIds = Array.from(new Set(adIds.filter(Boolean)));

  const results = await Promise.allSettled(
    uniqueIds.map((adId) => fetchAdCreative(adId, accessToken))
  );

  const map = new Map<string, MetaCreativeInfo | null>();
  uniqueIds.forEach((adId, index) => {
    const outcome = results[index];
    map.set(adId, outcome.status === "fulfilled" ? outcome.value : null);
  });

  return map;
}
