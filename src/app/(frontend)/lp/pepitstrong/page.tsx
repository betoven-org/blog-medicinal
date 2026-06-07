import type { Metadata } from "next";
import LpHero from "@/components/sections/LpHero";
import LpBenefits from "@/components/sections/LpBenefits";
import LpFeatureDetail from "@/components/sections/LpFeatureDetail";
import LpTestimonials from "@/components/sections/LpTestimonials";
import LpSocialProof from "@/components/sections/LpSocialProof";
import LpFAQLoader from "@/components/sections/LpFAQLoader";
import LpCTA from "@/components/sections/LpCTA";

export const revalidate = 300;

const WA_NUMBER = "5531999999999";
const WA_URL = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent("Ola! Gostaria de saber mais sobre o PepitStrong")}`;

export const metadata: Metadata = {
  title: "PepitStrong - Suplemento Natural para Energia e Vitalidade",
  description:
    "Descubra o PepitStrong: formulacao natural que auxilia na energia, vitalidade e disposicao no dia a dia. Converse com nosso farmaceutico.",
  alternates: {
    canonical: `${(process.env.NEXT_PUBLIC_SITE_URL || "https://www.medicinalnaweb.com.br").replace(/\/+$/, "")}/lp/pepitstrong`,
  },
  openGraph: {
    title: "PepitStrong - Energia e Vitalidade Natural",
    description: "Formulacao natural que auxilia na energia e disposicao. Fale com nosso farmaceutico.",
    type: "website",
  },
};

export default function PepitStrongLP() {
  return (
    <>
      {/* Hero */}
      <LpHero
        headline="PepitStrong"
        subheadline="Formulacao natural desenvolvida para quem busca mais energia, vitalidade e disposicao no dia a dia. Ingredientes selecionados com rigor farmaceutico."
        ctaText="Fale com o Farmaceutico"
        ctaUrl={WA_URL}
        showProductImage={false}
        layout="image-right"
      />

      {/* Beneficios */}
      <LpBenefits
        title="Por que escolher o PepitStrong?"
        subtitle="Uma formulacao completa pensada para o seu bem-estar"
        columns="3"
        variant="cards"
        items={[
          {
            icon: "zap",
            title: "Mais energia",
            description: "Auxilia na producao de energia celular, combatendo o cansaco e a fadiga do dia a dia.",
          },
          {
            icon: "shield",
            title: "Protecao antioxidante",
            description: "Ingredientes com acao antioxidante que protegem as celulas contra o estresse oxidativo.",
          },
          {
            icon: "heart",
            title: "Saude cardiovascular",
            description: "Contribui para a saude do coracao e a boa circulacao sanguinea.",
          },
          {
            icon: "leaf",
            title: "100% natural",
            description: "Formulacao com ingredientes naturais, sem aditivos artificiais ou conservantes.",
          },
          {
            icon: "star",
            title: "Qualidade farmaceutica",
            description: "Produzido com controle de qualidade rigoroso em farmacia de manipulacao.",
          },
          {
            icon: "check",
            title: "Facil de tomar",
            description: "Posologia simples e pratica, com apenas 1 dose diaria para resultados efetivos.",
          },
        ]}
      />

      {/* Feature: Como funciona */}
      <LpFeatureDetail
        title="Como o PepitStrong age no seu corpo?"
        description="<p>O PepitStrong atua diretamente no metabolismo energetico celular, fornecendo nutrientes essenciais que o corpo precisa para funcionar no seu melhor.</p><p>Seus ingredientes ativos sao absorvidos rapidamente e auxiliam na producao de ATP — a principal fonte de energia das celulas.</p><p>Com uso continuo, voce sente mais disposicao, foco e vitalidade ao longo do dia.</p>"
        layout="image-left"
        showBadge={true}
        badgeText="Como funciona"
      />

      {/* Feature: Para quem e indicado */}
      <LpFeatureDetail
        title="Para quem e indicado?"
        description="<ul><li><strong>Adultos acima de 30 anos</strong> que sentem queda de energia</li><li><strong>Praticantes de atividade fisica</strong> que buscam melhor recuperacao</li><li><strong>Profissionais com rotina intensa</strong> que precisam de mais disposicao</li><li><strong>Pessoas que buscam envelhecimento saudavel</strong> com mais vitalidade</li></ul>"
        layout="image-right"
        showBadge={true}
        badgeText="Indicacoes"
      />

      {/* Social Proof */}
      <LpSocialProof
        title="Numeros que comprovam"
        stats={[
          { value: "500", suffix: "+", label: "Clientes atendidos" },
          { value: "98", suffix: "%", label: "Satisfacao" },
          { value: "15", suffix: " anos", label: "De experiencia" },
          { value: "100", suffix: "%", label: "Natural" },
        ]}
      />

      {/* Depoimentos */}
      <LpTestimonials
        title="O que nossos clientes dizem"
        variant="cards"
        items={[
          {
            name: "Maria S.",
            role: "Cliente ha 6 meses",
            text: "Comecei a tomar o PepitStrong e senti diferenca ja na primeira semana. Minha energia ao longo do dia melhorou muito!",
            rating: 5,
          },
          {
            name: "Carlos R.",
            role: "Cliente ha 1 ano",
            text: "Excelente produto! O atendimento do farmaceutico foi fundamental para eu entender como usar da melhor forma.",
            rating: 5,
          },
          {
            name: "Ana L.",
            role: "Cliente ha 3 meses",
            text: "Produto de qualidade, entrega rapida e o suporte pelo WhatsApp e muito atencioso. Recomendo!",
            rating: 5,
          },
        ]}
      />

      {/* FAQ */}
      <LpFAQLoader
        title="Perguntas frequentes sobre o PepitStrong"
        items={[
          {
            question: "Como devo tomar o PepitStrong?",
            answer: "Recomenda-se tomar 1 dose diaria, preferencialmente junto a uma refeicao. Consulte o farmaceutico para orientacao personalizada.",
          },
          {
            question: "Em quanto tempo vou sentir os efeitos?",
            answer: "Os primeiros efeitos costumam ser percebidos entre 7 a 14 dias de uso continuo. Resultados podem variar de pessoa para pessoa.",
          },
          {
            question: "Tem contraindicacao?",
            answer: "O PepitStrong e formulado com ingredientes naturais, mas gestantes, lactantes e menores de 18 anos devem consultar um medico antes de usar.",
          },
          {
            question: "Posso tomar junto com outros suplementos?",
            answer: "Sim, na maioria dos casos. Recomendamos conversar com nosso farmaceutico para avaliar possiveis interacoes.",
          },
          {
            question: "Como comprar?",
            answer: "Basta clicar no botao 'Fale com o Farmaceutico' e voce sera direcionado para o nosso WhatsApp. O atendimento e personalizado.",
          },
        ]}
      />

      {/* CTA Final */}
      <LpCTA
        title="Pronto para ter mais energia?"
        subtitle="Converse com nosso farmaceutico e descubra como o PepitStrong pode transformar o seu dia a dia."
        ctaText="Falar pelo WhatsApp"
        ctaUrl={WA_URL}
        variant="gradient"
        showWhatsAppIcon={true}
      />
    </>
  );
}
