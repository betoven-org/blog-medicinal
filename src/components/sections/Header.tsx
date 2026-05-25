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
  /** @title Mostrar Area Restrita */
  /** @default true */
  showRestrictedArea?: boolean;
}

export default async function Header(_props: Props) {
  return <HeaderComponent />;
}
