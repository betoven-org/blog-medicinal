import path from "path";
import { fileURLToPath } from "url";
import { buildConfig } from "payload";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { pt } from "@payloadcms/translations/languages/pt";
import sharp from "sharp";
import { Authors } from "./collections/Authors";
import { Categories } from "./collections/Categories";
import { Media } from "./collections/Media";
import { Posts } from "./collections/Posts";
import { Subscribers } from "./collections/Subscribers";
import { Users } from "./collections/Users";
import { SiteSettings } from "./globals/SiteSettings";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
  admin: {
    user: Users.slug,
    meta: {
      titleSuffix: " | Medicinal Admin",
      icons: [{ url: "/favicon.png" }],
    },
    theme: "light",
    components: {
      graphics: {
        Logo: "./components/admin/Logo",
        Icon: "./components/admin/Icon",
      },
      beforeLogin: ["./components/admin/BeforeLogin"],
      afterNavLinks: ["./components/admin/NavLink"],
      beforeDashboard: ["./components/admin/Dashboard"],
      views: {
        envVars: {
          Component: "./components/admin/EnvVarsView",
          path: "/env-vars",
          meta: {
            title: "Variaveis de Ambiente",
          },
        },
      },
    },
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  i18n: {
    supportedLanguages: { pt },
    fallbackLanguage: "pt",
  },
  collections: [Users, Authors, Categories, Media, Posts, Subscribers],
  globals: [SiteSettings],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || "",
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || "",
    },
  }),
  sharp,
});
