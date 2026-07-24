import { Header as HeaderComponent } from "@/components/Header";

/**
 * @title Header
 * @description Cabecalho global com logo, busca, menu de categorias
 * @group Global
 */
export interface Props {
  // --- Visibilidade ---

  /** @title Mostrar busca */
  /** @default true */
  showSearch?: boolean;
  /** @title Mostrar redes sociais */
  /** @default true */
  showSocial?: boolean;
  /** @title Mostrar WhatsApp */
  /** @default true */
  showWhatsApp?: boolean;
  /** @title Mostrar categorias */
  /** @default true */
  showCategories?: boolean;
  /** @title Mostrar botao CTA */
  /** @default true */
  showCta?: boolean;

  // --- CTA ---

  /** @title Texto do botao CTA */
  /** @description Texto exibido no botao de acao do header */
  /** @default Loja Virtual */
  ctaLabel?: string;
  /** @title Link do botao CTA */
  /** @format url */
  /** @default https://loja.medicinalnaweb.com.br */
  ctaUrl?: string;

  // --- WhatsApp ---

  /** @title Texto do botao WhatsApp */
  /** @default Fale Conosco */
  whatsappText?: string;
  /** @title Mensagem padrao do WhatsApp */
  /** @description Mensagem pre-preenchida ao abrir o WhatsApp */
  whatsappMessage?: string;

  // --- Aparencia ---

  /** @title Header fixo (sticky) */
  /** @default true */
  sticky?: boolean;
  /** @title Cor de fundo */
  /** @format color */
  backgroundColor?: string;

  // --- Logo ---

  /** @title Largura do logo (px) */
  /** @default 160 */
  logoWidth?: number;
  /** @title Altura do logo (px) */
  /** @default 32 */
  logoHeight?: number;
}

export default async function Header(props: Props) {
  return <HeaderComponent {...props} />;
}
