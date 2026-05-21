import type { GlobalConfig } from "payload";

export const SiteSettings: GlobalConfig = {
  slug: "site-settings",
  label: "Configurações do Site",
  admin: {
    group: "Configurações",
  },
  fields: [
    {
      type: "tabs",
      tabs: [
        {
          label: "Geral",
          fields: [
            {
              name: "siteName",
              label: "Nome do Site",
              type: "text",
              required: true,
              defaultValue: "Medicinal na Web",
            },
            {
              name: "siteDescription",
              label: "Descrição do Site",
              type: "textarea",
              required: true,
              defaultValue:
                "Portal de saúde, suplementos naturais, fitoterapia e bem-estar.",
            },
            {
              name: "logo",
              label: "Logo",
              type: "upload",
              relationTo: "media",
            },
            {
              name: "favicon",
              label: "Favicon",
              type: "upload",
              relationTo: "media",
            },
          ],
        },
        {
          label: "Redes Sociais",
          fields: [
            {
              name: "facebook",
              label: "Facebook URL",
              type: "text",
              defaultValue: "https://facebook.com",
            },
            {
              name: "instagram",
              label: "Instagram URL",
              type: "text",
              defaultValue: "https://instagram.com",
            },
            {
              name: "youtube",
              label: "YouTube URL",
              type: "text",
              defaultValue: "https://youtube.com",
            },
          ],
        },
        {
          label: "Footer",
          fields: [
            {
              name: "footerText",
              label: "Texto Legal / Rodapé",
              type: "textarea",
              required: true,
              defaultValue:
                "Medicinal © 2026. Medicinal Farmácia de Manipulação Ltda EPP • Rua Luiz Gama, 335 • Centro • CEP: 87014-110 • Maringá/PR • CNPJ: 04.380.004/0001-01",
            },
            {
              name: "copyrightText",
              label: "Texto de Copyright",
              type: "text",
              defaultValue: "Medicinal na Web. Todos os direitos reservados.",
            },
          ],
        },
        {
          label: "Newsletter",
          fields: [
            {
              name: "newsletterTitle",
              label: "Título da Newsletter",
              type: "text",
              defaultValue: "Newsletter",
            },
            {
              name: "newsletterDescription",
              label: "Descrição da Newsletter",
              type: "textarea",
              defaultValue:
                "Receba os melhores conteúdos sobre saúde e bem-estar diretamente no seu e-mail.",
            },
            {
              name: "newsletterConsent",
              label: "Texto de Consentimento",
              type: "textarea",
              defaultValue:
                "Ao se inscrever, você concorda em receber comunicações do Medicinal na Web. Você pode cancelar a qualquer momento.",
            },
          ],
        },
        {
          label: "SEO",
          fields: [
            {
              name: "seoTitle",
              label: "Título SEO (Homepage)",
              type: "text",
              defaultValue: "Medicinal na Web | Portal de Saúde e Bem-estar",
            },
            {
              name: "seoDescription",
              label: "Descrição SEO",
              type: "textarea",
              defaultValue:
                "Portal de saúde, suplementos naturais, fitoterapia e bem-estar. Conteúdo educativo sobre nutrição, vitaminas e vida saudável.",
            },
            {
              name: "seoKeywords",
              label: "Palavras-chave (separadas por vírgula)",
              type: "text",
              defaultValue:
                "saúde, suplementos, fitoterapia, bem-estar, nutrição, vitaminas, medicinal",
            },
          ],
        },
        {
          label: "Infraestrutura",
          fields: [
            {
              name: "envVarsPanel",
              type: "ui",
              admin: {
                components: {
                  Field: "./components/admin/EnvVarsField",
                },
              },
            },
            {
              name: "domainsPanel",
              type: "ui",
              admin: {
                components: {
                  Field: "./components/admin/DomainsField",
                },
              },
            },
          ],
        },
      ],
    },
  ],
};
