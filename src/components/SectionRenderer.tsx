import type { SectionBlock } from "@/lib/cms";

// Existing sections
import Hero from "@/components/sections/Hero";
import Features from "@/components/sections/Features";
import Banner from "@/components/sections/Banner";
import HeroPost from "@/components/sections/HeroPost";
import PostGrid from "@/components/sections/PostGrid";
import PostList from "@/components/sections/PostCarousel";
import PostGridWithSidebar from "@/components/sections/PostGridWithSidebar";
import CategoryBar from "@/components/sections/CategoryBar";
import ProductShowcase from "@/components/sections/ProductShowcase";
import WhatsAppCTA from "@/components/sections/WhatsAppCTA";
import Footer from "@/components/sections/Footer";
import Header from "@/components/sections/Header";

// Institucional
import FAQ from "@/components/sections/FAQ";
import Testimonials from "@/components/sections/Testimonials";
import Team from "@/components/sections/Team";
import ContactForm from "@/components/sections/ContactForm";
import Stats from "@/components/sections/Stats";
import Timeline from "@/components/sections/Timeline";
import Pricing from "@/components/sections/Pricing";
import Map from "@/components/sections/Map";

// Conteudo
import CTA from "@/components/sections/CTA";
import ImageText from "@/components/sections/ImageText";
import VideoEmbed from "@/components/sections/VideoEmbed";
import Accordion from "@/components/sections/Accordion";
import RichContent from "@/components/sections/RichContent";
import Gallery from "@/components/sections/Gallery";

// Marketing
import Logos from "@/components/sections/Logos";
import SocialProof from "@/components/sections/SocialProof";
import Newsletter from "@/components/sections/Newsletter";

// Layout
import Divider from "@/components/sections/Divider";
import Alert from "@/components/sections/Alert";

// eslint-disable-next-line
const SECTION_MAP: Record<string, React.ComponentType<any>> = {
  // Global
  Header,
  Footer,
  // Home / Blog
  Hero,
  Features,
  Banner,
  HeroPost,
  PostGrid,
  PostCarousel: PostList,
  PostList,
  PostGridWithSidebar,
  CategoryBar,
  ProductShowcase,
  WhatsAppCTA,
  // Institucional
  FAQ,
  Testimonials,
  Team,
  ContactForm,
  Stats,
  Timeline,
  Pricing,
  Map,
  // Conteudo
  CTA,
  ImageText,
  VideoEmbed,
  Accordion,
  RichContent,
  Gallery,
  // Marketing
  Logos,
  SocialProof,
  Newsletter,
  // Layout
  Divider,
  Alert,
};

type SectionRendererProps = {
  blocks: SectionBlock[];
};

const LAYOUT_SECTIONS = new Set(["Header", "Footer"]);

export function SectionRenderer({ blocks }: SectionRendererProps) {
  return (
    <>
      {blocks.map((block) => {
        if (LAYOUT_SECTIONS.has(block.component)) return null;
        const Component = SECTION_MAP[block.component];

        if (!Component) {
          if (process.env.NODE_ENV === "development") {
            console.warn(
              `[SectionRenderer] Componente nao encontrado para a chave "${block.component}". Adicione-o em SECTION_MAP.`
            );
          }
          return null;
        }

        return <Component key={block.id} {...block.props} />;
      })}
    </>
  );
}
