import type { SectionBlock } from "@brasa/core/manifest";
import Hero from "@/components/sections/Hero";
import Features from "@/components/sections/Features";
import Banner from "@/components/sections/Banner";
import HeroPost from "@/components/sections/HeroPost";
import PostGrid from "@/components/sections/PostGrid";
import PostList from "@/components/sections/PostCarousel";

// ── Component map ─────────────────────────────────────────────────────────────
// Add new section components here as they are created.

// eslint-disable-next-line
const SECTION_MAP: Record<string, React.ComponentType<any>> = {
  Hero,
  Features,
  Banner,
  HeroPost,
  PostGrid,
  PostCarousel: PostList,
};

// ── SectionRenderer ───────────────────────────────────────────────────────────

type SectionRendererProps = {
  blocks: SectionBlock[];
};

export function SectionRenderer({ blocks }: SectionRendererProps) {
  return (
    <>
      {blocks.map((block) => {
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
