# Brasa CMS — Sistema de Sections

O Brasa CMS gera campos de edicao automaticamente a partir dos tipos TypeScript dos componentes.
Voce cria um componente React com `Props` tipados e o CMS entende quais campos mostrar no editor.

## Como funciona

```
src/components/sections/Hero.tsx    <-- Developer cria componente com Props tipados
        |
        v
pnpm manifest                      <-- Extrai types e gera manifest.json
        |
        v
src/manifest.json                   <-- Schema de cada section (campos, tipos, formatos)
        |
        v
Admin PageBuilder                   <-- Renderiza forms dinamicos a partir do schema
        |
        v
Banco (pages.draft)                 <-- Salva como JSON [{component, props}]
        |
        v
SectionRenderer                     <-- Renderiza os componentes no frontend
```

## Sync automatico

Ao rodar `pnpm dev`, o watcher observa `src/components/sections/` e regenera
o `manifest.json` automaticamente sempre que um arquivo `.tsx` e criado, editado ou removido.

O terminal mostra as atualizacoes com prefixo `[brasa]`:

```
14:32:05 [brasa] Hero.tsx modificado — regenerando manifest...
14:32:05 [brasa] manifest.json atualizado (3 sections, 820ms)
```

Para gerar manualmente: `pnpm manifest`

## Criando uma Section

Crie um arquivo `.tsx` em `src/components/sections/`:

```tsx
// src/components/sections/MinhaSection.tsx
import type { ImageWidget, RichText } from "@brasa/core/manifest";

/**
 * @title Minha Section
 * @description Descricao que aparece no picker do editor
 * @group Conteudo
 */
export interface Props {
  /** @title Titulo principal */
  title: string;

  /** @title Descricao */
  /** @format textarea */
  description?: string;

  /** @title Imagem */
  heroImage?: ImageWidget;

  /** @title Conteudo rico */
  body?: RichText;
}

export default function MinhaSection({ title, description, heroImage, body }: Props) {
  return (
    <section>
      <h2>{title}</h2>
      {description && <p>{description}</p>}
      {heroImage && <img src={heroImage} alt="" />}
      {body && <div dangerouslySetInnerHTML={{ __html: body }} />}
    </section>
  );
}
```

Salve o arquivo e o watcher gera os campos automaticamente.

## Registrando no frontend

Apos criar a section, adicione-a no `SectionRenderer`:

```tsx
// src/components/SectionRenderer.tsx
import MinhaSection from "@/components/sections/MinhaSection";

const SECTION_MAP: Record<string, React.ComponentType<any>> = {
  Hero,
  Features,
  Banner,
  MinhaSection, // <-- adicionar aqui
};
```

## Widget Types

Use esses tipos nas Props para ativar widgets especificos no editor:

| Tipo | Import | Widget no editor |
|---|---|---|
| `ImageWidget` | `@brasa/core/manifest` | Input de URL + preview da imagem |
| `RichText` | `@brasa/core/manifest` | Editor de texto rico (HTML) |
| `Color` | `@brasa/core/manifest` | Color picker + input hex |
| `VideoWidget` | `@brasa/core/manifest` | Input de URL |

Exemplo:
```tsx
import type { ImageWidget, RichText, Color } from "@brasa/core/manifest";

export interface Props {
  /** @title Banner */
  image: ImageWidget;    // -> upload/URL de imagem

  /** @title Texto */
  content: RichText;     // -> editor rich text

  /** @title Cor */
  bgColor: Color;        // -> color picker
}
```

## JSDoc Annotations

Use JSDoc nas propriedades do `Props` para controlar como o campo aparece no editor:

| Annotation | Efeito | Exemplo |
|---|---|---|
| `@title` | Label do campo | `/** @title Titulo principal */` |
| `@description` | Texto de ajuda | `/** @description Aparece abaixo do campo */` |
| `@format` | Tipo de input | `/** @format textarea */` |
| `@default` | Valor padrao | `/** @default centro */` |
| `@options` | Gera select | `/** @options pequeno,medio,grande */` |
| `@hide` | Esconde do editor | `/** @hide */` |
| `@group` | Agrupa em secao | `/** @group Avancado */` |

### Formatos disponiveis (@format)

| Format | Renderiza |
|---|---|
| `text` | Input de texto (padrao) |
| `textarea` | Textarea multilinhas |
| `rich-text` | Editor de texto rico |
| `image` | Input + preview de imagem |
| `color` | Color picker |
| `url` | Input type URL |
| `email` | Input type email |
| `date` | Input type date |
| `code` | Textarea monospace |
| `select` | Select dropdown (precisa de @options ou union type) |

## Tipos automaticos

O extractor reconhece tipos TypeScript e gera o campo correto:

| Tipo TS | Campo gerado |
|---|---|
| `string` | Input texto |
| `number` | Input numerico |
| `boolean` | Toggle/checkbox |
| `"a" \| "b" \| "c"` | Select com opcoes |
| `{ prop: type }` | Grupo de campos aninhado |
| `Item[]` | Lista repetivel com adicionar/remover |

Exemplo completo:
```tsx
export interface Props {
  /** @title Colunas */
  columns: "2" | "3" | "4";           // -> Select

  /** @title Ativo */
  enabled: boolean;                     // -> Toggle

  /** @title Limite */
  limit: number;                        // -> Input numerico

  /** @title Botao */
  cta: {                                // -> Grupo aninhado
    label: string;
    href: string;
    newTab?: boolean;
  };

  /** @title Itens */
  items: {                              // -> Lista repetivel
    title: string;
    description: string;
    image?: ImageWidget;
  }[];
}
```

## Estrutura de arquivos

```
src/
  components/
    sections/              <-- Sections ficam aqui
      Hero.tsx
      Features.tsx
      Banner.tsx
    admin/
      SectionEditor.tsx    <-- Form dinamico (le manifest)
      PageBuilder.tsx      <-- Editor de paginas (adiciona/remove/reordena sections)
    SectionRenderer.tsx    <-- Renderiza sections no frontend
  manifest.json            <-- Gerado automaticamente (nao editar)

packages/
  brasa-core/
    src/
      manifest.ts          <-- Types (FieldSchema, SectionSchema, widget types)

scripts/
  extract-sections.ts      <-- Extractor (ts-morph)
  watch-sections.ts        <-- Watcher (auto-sync no dev)
```

## Comandos

| Comando | O que faz |
|---|---|
| `pnpm dev` | Roda Next.js + watcher (sync automatico) |
| `pnpm manifest` | Gera manifest.json manualmente |
| `pnpm build` | Gera manifest + build Next.js (prebuild) |
| `pnpm dev:next` | Roda so o Next.js (sem watcher) |
| `pnpm dev:watch` | Roda so o watcher |
