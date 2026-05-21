// @ts-nocheck
import { importMap } from "../importMap";
import configPromise from "@/payload.config";
import { RootPage, generatePageMetadata } from "@payloadcms/next/views";

type Args = any;

export const generateMetadata = ({ params, searchParams }: Args) =>
  generatePageMetadata({ config: configPromise, params, searchParams });

const Page = ({ params, searchParams }: Args) =>
  RootPage({ config: configPromise, params, searchParams, importMap });

export default Page;
