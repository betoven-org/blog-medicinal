import { NextRequest, NextResponse } from "next/server";

// ---------------------------------------------------------------------------
// Context rules — temperature + hour → tag
// ---------------------------------------------------------------------------

type ContextRule = {
  tag: string;
  title: string;
  subtitle: string;
  tempMin?: number;
  tempMax?: number;
  hourMin?: number;
  hourMax?: number;
};

const CONTEXT_RULES: ContextRule[] = [
  {
    tag: "noite",
    title: "Hora de descansar",
    subtitle: "Produtos para uma boa noite de sono",
    hourMin: 21,
    hourMax: 5,
  },
  {
    tag: "frio",
    title: "Dia frio? Cuide da imunidade",
    subtitle: "Recomendados para baixas temperaturas",
    tempMax: 18,
  },
  {
    tag: "calor",
    title: "Dia quente? Mantenha a vitalidade",
    subtitle: "Hidratacao e energia para dias quentes",
    tempMin: 28,
  },
  {
    tag: "manha",
    title: "Bom dia! Comece com energia",
    subtitle: "Produtos para comecar o dia bem",
    hourMin: 5,
    hourMax: 11,
  },
  {
    tag: "tarde",
    title: "Mantenha o foco",
    subtitle: "Energia e concentracao para a tarde",
    hourMin: 12,
    hourMax: 20,
  },
];

// ---------------------------------------------------------------------------
// Weather (Open-Meteo — free, no API key)
// ---------------------------------------------------------------------------

async function fetchWeather(lat: number, lng: number) {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,weather_code&timezone=auto`;
    const res = await fetch(url, { next: { revalidate: 300 } });
    if (!res.ok) return null;
    const data = await res.json();
    return {
      temperature: data.current?.temperature_2m as number ?? null,
      weatherCode: data.current?.weather_code as number ?? 0,
    };
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Context detection
// ---------------------------------------------------------------------------

function detectContext(temp: number | null, hour: number): ContextRule | null {
  for (const rule of CONTEXT_RULES) {
    const tempOk =
      (rule.tempMin === undefined || (temp !== null && temp >= rule.tempMin)) &&
      (rule.tempMax === undefined || (temp !== null && temp <= rule.tempMax));

    let hourOk = true;
    if (rule.hourMin !== undefined && rule.hourMax !== undefined) {
      if (rule.hourMin > rule.hourMax) {
        hourOk = hour >= rule.hourMin || hour <= rule.hourMax;
      } else {
        hourOk = hour >= rule.hourMin && hour <= rule.hourMax;
      }
    }

    const hasTempRule = rule.tempMin !== undefined || rule.tempMax !== undefined;
    const hasHourRule = rule.hourMin !== undefined && rule.hourMax !== undefined;

    if (hasTempRule && hasHourRule) {
      if (tempOk && hourOk) return rule;
    } else if (hasTempRule) {
      if (tempOk) return rule;
    } else if (hasHourRule) {
      if (hourOk) return rule;
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// Supabase PostgREST query — products by recommendation_tags
// ---------------------------------------------------------------------------

async function fetchProductsByTag(tag: string, limit: number) {
  const supabaseUrl = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "").replace(/\\n/g, "").replace(/\/+$/, "");
  const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "";

  if (!supabaseUrl || !supabaseKey) return [];

  try {
    // PostgREST: filter products where recommendation_tags contains the tag
    const url = `${supabaseUrl}/rest/v1/products?recommendation_tags=cs.%7B${encodeURIComponent(tag)}%7D&select=id,title,slug,cover_image_url,cover_image_alt&limit=${limit}`;
    const res = await fetch(url, {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
      },
      next: { revalidate: 300 },
    });

    if (!res.ok) return [];

    const rows: Record<string, unknown>[] = await res.json();
    return rows.map((p) => ({
      id: String(p.id ?? ""),
      name: String(p.title ?? ""),
      slug: String(p.slug ?? ""),
      description: null,
      imageUrl: (p.cover_image_url as string) ?? null,
      imageAlt: (p.cover_image_alt as string) ?? null,
    }));
  } catch {
    return [];
  }
}

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

export async function GET(req: NextRequest) {
  const lat = parseFloat(req.nextUrl.searchParams.get("lat") || "");
  const lng = parseFloat(req.nextUrl.searchParams.get("lng") || "");

  if (isNaN(lat) || isNaN(lng)) {
    return NextResponse.json(
      { error: "lat and lng query params required" },
      { status: 400 },
    );
  }

  const weather = await fetchWeather(lat, lng);
  const temp = weather?.temperature ?? null;

  const hourParam = req.nextUrl.searchParams.get("hour");
  const hour = hourParam ? parseInt(hourParam, 10) : new Date().getHours();
  const limitParam = req.nextUrl.searchParams.get("limit");
  const limit = limitParam ? parseInt(limitParam, 10) : 12;

  const context = detectContext(temp, hour);

  if (!context) {
    return NextResponse.json({ products: [], context: null, temperature: temp });
  }

  const products = await fetchProductsByTag(context.tag, limit);

  if (products.length === 0) {
    return NextResponse.json({ products: [], context: null, temperature: temp });
  }

  return NextResponse.json({
    products,
    context: {
      tag: context.tag,
      title: context.title,
      subtitle: context.subtitle,
    },
    temperature: temp,
  });
}
