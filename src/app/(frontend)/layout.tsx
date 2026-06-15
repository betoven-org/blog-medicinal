import { Suspense } from "react";
import { Roboto } from "next/font/google";
import { NavigationProgress } from "@/components/NavigationProgress";
import { AnalyticsScripts } from "@/components/AnalyticsScripts";
import Header from "@/components/sections/Header";
import Footer from "@/components/sections/Footer";
import "../globals.css";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700", "900"],
  variable: "--font-roboto",
  display: "swap",
  preload: true,
});

export default function FrontendLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={`${roboto.variable} antialiased`}>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="alternate" type="application/rss+xml" title="Medicinal na Web" href="/feed.xml" />
      </head>
      <body className="flex min-h-screen flex-col bg-white font-sans text-gray-900">
        <Suspense fallback={null}>
          <NavigationProgress />
        </Suspense>
        <Header />
        <main id="main-content" className="flex-1">
          {children}
        </main>
        <Footer />
        <Suspense fallback={null}>
          <AnalyticsScripts />
        </Suspense>
        {process.env.NODE_ENV === "development" && (
          <script
            dangerouslySetInnerHTML={{
              __html: `
(function(){
  var active=false,overlay,tooltip;
  function create(){
    overlay=document.createElement("div");
    Object.assign(overlay.style,{position:"fixed",pointerEvents:"none",border:"2px solid #f97316",borderRadius:"4px",backgroundColor:"rgba(249,115,22,0.08)",zIndex:"99999",display:"none",transition:"all 0.15s"});
    document.body.appendChild(overlay);
    tooltip=document.createElement("div");
    Object.assign(tooltip.style,{position:"fixed",zIndex:"100000",display:"none",backgroundColor:"#18181b",color:"#fafafa",fontSize:"11px",fontFamily:"monospace",padding:"4px 8px",borderRadius:"4px",pointerEvents:"none",whiteSpace:"nowrap"});
    document.body.appendChild(tooltip);
  }
  function find(el){while(el){if(el.dataset&&(el.dataset.sectionId||el.dataset.sectionType))return el;el=el.parentElement;}return null;}
  document.addEventListener("keydown",function(e){if((e.metaKey||e.ctrlKey)&&e.key==="e"){e.preventDefault();active=!active;if(active){if(!overlay)create();document.body.style.cursor="crosshair";console.log("[Inspector] ON");}else{overlay.style.display="none";tooltip.style.display="none";document.body.style.cursor="";}}});
  document.addEventListener("mousemove",function(e){if(!active||!overlay)return;var t=find(e.target);if(!t){overlay.style.display="none";tooltip.style.display="none";return;}var r=t.getBoundingClientRect();overlay.style.display="block";overlay.style.top=r.top+"px";overlay.style.left=r.left+"px";overlay.style.width=r.width+"px";overlay.style.height=r.height+"px";tooltip.textContent=t.dataset.sectionType||t.dataset.sectionId||"Section";tooltip.style.display="block";tooltip.style.top=Math.max(0,r.top-24)+"px";tooltip.style.left=r.left+"px";});
})();
              `,
            }}
          />
        )}
      </body>
    </html>
  );
}
