import { Header as HeaderComponent } from "@/components/Header";

/**
 * @title Header
 * @description Cabecalho global com logo, busca, menu de categorias
 * @group Global
 */
export interface Props {
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
  /** @title Texto do botao CTA */
  /** @description Texto exibido no botao de acao do header */
  /** @default Loja Virtual */
  ctaLabel?: string;
  /** @title Link do botao CTA */
  /** @format url */
  /** @default https://loja.medicinalnaweb.com.br */
  ctaUrl?: string;
  /** @title Mostrar botao CTA */
  /** @default true */
  showCta?: boolean;
}

export default async function Header(props: Props) {
  return <HeaderComponent {...props} />;
}
