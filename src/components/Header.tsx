import Link from "next/link";
import Image from "next/image";
import { SearchButton } from "./SearchButton";
import { getSiteSettings } from "@/lib/queries";

export async function Header() {
  const settings = await getSiteSettings();
  const logoUrl =
    typeof settings.logo === "object" && settings.logo?.url
      ? settings.logo.url
      : "/logo.svg";
  const siteName =
    (settings as any).siteName || "Medicinal na Web";

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link href="/" className="flex items-center">
          <Image src={logoUrl} alt={siteName} width={160} height={32} priority />
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <Link
            href="/"
            className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
          >
            Home
          </Link>
          <Link
            href="/blog"
            className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
          >
            Todos posts
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          {(settings as any).facebook && (
            <a
              href={(settings as any).facebook}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="p-1.5 text-gray-500 transition-colors hover:text-gray-800"
            >
              <svg width="20" height="20" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true">
                <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm8,191.63V152h24a8,8,0,0,0,0-16H136V112a16,16,0,0,1,16-16h16a8,8,0,0,0,0-16H152a32,32,0,0,0-32,32v24H96a8,8,0,0,0,0,16h24v63.63a88,88,0,1,1,16,0Z" />
              </svg>
            </a>
          )}
          {(settings as any).instagram && (
            <a
              href={(settings as any).instagram}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="p-1.5 text-gray-500 transition-colors hover:text-gray-800"
            >
              <svg width="20" height="20" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true">
                <path d="M128,80a48,48,0,1,0,48,48A48.05,48.05,0,0,0,128,80Zm0,80a32,32,0,1,1,32-32A32,32,0,0,1,128,160ZM176,24H80A56.06,56.06,0,0,0,24,80v96a56.06,56.06,0,0,0,56,56h96a56.06,56.06,0,0,0,56-56V80A56.06,56.06,0,0,0,176,24Zm40,152a40,40,0,0,1-40,40H80a40,40,0,0,1-40-40V80A40,40,0,0,1,80,40h96a40,40,0,0,1,40,40ZM192,76a12,12,0,1,1-12-12A12,12,0,0,1,192,76Z" />
              </svg>
            </a>
          )}
          {(settings as any).youtube && (
            <a
              href={(settings as any).youtube}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="YouTube"
              className="p-1.5 text-gray-500 transition-colors hover:text-gray-800"
            >
              <svg width="20" height="20" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true">
                <path d="M164.44,121.34l-48-32A8,8,0,0,0,104,96v64a8,8,0,0,0,12.44,6.66l48-32a8,8,0,0,0,0-13.32ZM120,145.05V111l25.58,17ZM234.33,69.52a24,24,0,0,0-14.49-16.4C185.56,39.88,131,40,128,40s-57.56-.12-91.84,13.12a24,24,0,0,0-14.49,16.4C19.08,79.5,16,97.74,16,128s3.08,48.5,5.67,58.48a24,24,0,0,0,14.49,16.41C69,215.56,120.4,216,127.34,216h1.32c6.94,0,58.37-.44,91.18-13.11a24,24,0,0,0,14.49-16.41c2.59-10,5.67-28.22,5.67-58.48S236.92,79.5,234.33,69.52Zm-15.49,113a8,8,0,0,1-4.77,5.49c-31.65,12.22-85.48,12-86,12H128c-.54,0-54.33.2-86-12a8,8,0,0,1-4.77-5.49C34.8,173.39,32,156.57,32,128s2.8-45.39,5.16-54.47A8,8,0,0,1,41.93,68c30.52-11.79,81.66-12,85.85-12h.27c.54,0,54.38-.18,86,12a8,8,0,0,1,4.77,5.49C221.2,82.61,224,99.43,224,128S221.2,173.39,218.84,182.47Z" />
              </svg>
            </a>
          )}

          <SearchButton />
        </div>
      </div>
    </header>
  );
}
