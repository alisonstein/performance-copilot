// ============================================================================
// CONFIGURAÇÃO CENTRAL DO SITE
// Edite este arquivo para alterar nome, links, preços e textos principais
// sem precisar mexer nos componentes.
// ============================================================================

export const siteConfig = {
  name: "Performance Copilot",
  shortName: "Copilot",
  description:
    "Analise Meta Ads e Google Ads, encontre gargalos, descubra criativos vencedores e gere relatórios para seus clientes com inteligência artificial.",
  url: "https://performancecopilot.com.br",
  ogImage: "/og-image.png",
};

// ----------------------------------------------------------------------------
// LINKS / CTAs — troque os valores abaixo pelas URLs reais quando existirem
// ----------------------------------------------------------------------------
export const links = {
  TRIAL_URL: "#",
  LOGIN_URL: "#",
  SALES_URL: "#",
};

// ----------------------------------------------------------------------------
// PREÇOS — valores em reais (mensal). O anual é calculado como 10x o mensal
// (equivalente a "2 meses grátis"). Edite apenas os números abaixo.
// ----------------------------------------------------------------------------
export type Plan = {
  id: string;
  name: string;
  tagline: string;
  monthlyPrice: number;
  highlight?: boolean;
  badge?: string;
  features: string[];
  ctaLabel: string;
  ctaHref: string;
};

export const plans: Plan[] = [
  {
    id: "freelancer",
    name: "Freelancer",
    tagline: "Para quem está começando.",
    monthlyPrice: 49,
    features: [
      "Até 5 clientes",
      "Análises automáticas",
      "Relatórios",
      "Copilot IA",
      "Comparação de períodos",
    ],
    ctaLabel: "Começar teste",
    ctaHref: links.TRIAL_URL,
  },
  {
    id: "pro",
    name: "Pro",
    tagline: "Para operações em crescimento.",
    monthlyPrice: 129,
    highlight: true,
    badge: "RECOMENDADO",
    features: [
      "Até 20 clientes",
      "Tudo do Freelancer",
      "Alertas avançados",
      "Relatórios personalizados",
      "Histórico completo",
      "Exportação de dados",
      "Mais uso da IA",
    ],
    ctaLabel: "Testar Pro",
    ctaHref: links.TRIAL_URL,
  },
  {
    id: "agencia",
    name: "Agência",
    tagline: "Para operações em escala.",
    monthlyPrice: 249,
    features: [
      "Até 50 clientes",
      "Tudo do Pro",
      "White-label",
      "Múltiplos usuários",
      "Relatórios com sua marca",
      "Visão geral da agência",
      "Suporte prioritário",
    ],
    ctaLabel: "Falar com vendas",
    ctaHref: links.SALES_URL,
  },
];

export const ANNUAL_MONTHS_CHARGED = 10; // 12 meses, paga 10 (2 grátis)

// ----------------------------------------------------------------------------
// NAVEGAÇÃO
// ----------------------------------------------------------------------------
export const navLinks = [
  { label: "Produto", href: "#produto" },
  { label: "Como funciona", href: "#como-funciona" },
  { label: "Recursos", href: "#recursos" },
  { label: "Para agências", href: "#agencias" },
  { label: "Preços", href: "#precos" },
  { label: "FAQ", href: "#faq" },
];

// ----------------------------------------------------------------------------
// FAQ
// ----------------------------------------------------------------------------
export const faqs = [
  {
    question: "O Performance Copilot substitui um gestor de tráfego?",
    answer:
      "Não. Ele funciona como uma camada de análise e apoio à decisão. A estratégia e a decisão final continuam sendo do profissional.",
  },
  {
    question: "Preciso conectar minhas contas?",
    answer:
      "O produto pode trabalhar com integrações ou importação de dados, dependendo da configuração disponível.",
  },
  {
    question: "Funciona com Meta Ads e Google Ads?",
    answer:
      "Sim, a proposta do produto é centralizar análises das principais plataformas de mídia paga.",
  },
  {
    question: "Posso usar para vários clientes?",
    answer:
      "Sim. Os planos foram pensados para freelancers e agências com diferentes volumes de contas.",
  },
  {
    question: "O relatório pode ser enviado ao cliente?",
    answer:
      "Sim. A proposta é gerar relatórios e resumos claros, prontos para apresentação ou envio.",
  },
  {
    question: "Existe plano para agência?",
    answer:
      "Sim. O plano Agência inclui maior limite de clientes e recursos voltados para operação em escala.",
  },
];

// ----------------------------------------------------------------------------
// FEATURES (seção "Recursos")
// ----------------------------------------------------------------------------
export const features = [
  {
    icon: "LineChart",
    title: "Análise automática",
    description:
      "Identifique mudanças importantes em CPA, CTR, CPC, CPM, ROAS e conversões.",
  },
  {
    icon: "BellRing",
    title: "Alertas inteligentes",
    description:
      "Se uma campanha começa a desperdiçar verba, você fica sabendo antes.",
  },
  {
    icon: "Trophy",
    title: "Criativos vencedores",
    description:
      "Descubra quais anúncios estão puxando resultados e quais estão ficando para trás.",
  },
  {
    icon: "Compass",
    title: "Recomendações",
    description:
      "Receba sugestões claras sobre onde investigar, pausar, testar ou escalar.",
  },
  {
    icon: "FileText",
    title: "Relatórios com IA",
    description:
      "Transforme dados técnicos em uma apresentação que o cliente entende.",
  },
  {
    icon: "GitCompare",
    title: "Comparação de períodos",
    description:
      "Veja automaticamente o que melhorou ou piorou em relação ao período anterior.",
  },
];

// ----------------------------------------------------------------------------
// ANALYTICS — IDs ficam vazios de propósito. Preencha ao publicar.
// ----------------------------------------------------------------------------
export const analyticsConfig = {
  GA4_MEASUREMENT_ID: "", // ex: "G-XXXXXXXXXX"
  META_PIXEL_ID: "", // ex: "000000000000000"
  GTM_CONTAINER_ID: "", // ex: "GTM-XXXXXXX"
};
