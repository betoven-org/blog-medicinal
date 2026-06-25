-- Vitrine Inteligente: permite taguear produtos por contexto
-- Tags validas: frio, calor, noite, manha, tarde, chuva
-- Exemplo: UPDATE products SET recommendation_tags = '{frio,noite}' WHERE slug = 'valeriana-ext-seco-100mg-30-doses';

-- 1. Coluna
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS recommendation_tags text[] DEFAULT '{}';

-- 2. Index GIN para queries com @> (contains)
CREATE INDEX IF NOT EXISTS idx_products_recommendation_tags
  ON products USING GIN (recommendation_tags);

-- 3. RLS policy — permite leitura publica (anon) dos produtos com tags
-- (se ja existir policy SELECT no products, essa e complementar)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'products' AND policyname = 'products_select_public'
  ) THEN
    CREATE POLICY products_select_public ON products FOR SELECT USING (true);
  END IF;
END
$$;

COMMENT ON COLUMN products.recommendation_tags IS 'Tags de contexto para vitrine inteligente: frio, calor, noite, manha, tarde, chuva';

-- 4. Seed inicial — taguear produtos por contexto
-- (o cliente pode alterar depois pelo Supabase Dashboard)
UPDATE products SET recommendation_tags = array_cat(recommendation_tags, '{frio}')
WHERE slug IN (
  'epicor-500mg-30-doses',
  'geleia-real-200mg-30-doses',
  'tintura-de-gengibre-60ml',
  'ginseng-siberiano-300mg-60-doses',
  'allyl-abg-250mg-60-doses',
  'lactobacillus-rhamnosus-2blh-30-doses-capsula-gastrorresistente',
  'gluthation-250mg-30-doses',
  'selenio-complexo-200mcg-30-doses'
) AND NOT (recommendation_tags @> '{frio}');

UPDATE products SET recommendation_tags = array_cat(recommendation_tags, '{calor}')
WHERE slug IN (
  'matcha-500mg-60-doses',
  'resveratrol-100mg-30-doses',
  'polypodium-leucotomos-250mg-30-doses',
  'selenio-complexo-200mcg-30-doses',
  'glycoxil-300mg-30-doses',
  'exsynutriment-300mg-30-doses',
  'nutricolin-300mg-30-doses',
  'ferro-quelato-50mg-60-doses'
) AND NOT (recommendation_tags @> '{calor}');

UPDATE products SET recommendation_tags = array_cat(recommendation_tags, '{noite}')
WHERE slug IN (
  'herbatonin-melatonina-vegetal-100mg-30-doses',
  'valeriana-ext-seco-100mg-30-doses',
  'relora-250mg-30-doses',
  'magnesio-glicil-glutamina-400mg-30-doses',
  'rhodiola-rosea-300mg-30-doses',
  'tintura-de-erva-doce-60ml',
  'melilotus-officinalis-250mg-30-doses',
  'espinheira-santa-500mg-60-doses'
) AND NOT (recommendation_tags @> '{noite}');

UPDATE products SET recommendation_tags = array_cat(recommendation_tags, '{manha}')
WHERE slug IN (
  'rhodiola-rosea-300mg-30-doses',
  'matcha-500mg-60-doses',
  'ferro-quelato-50mg-60-doses',
  'niagen-100mg-30-doses',
  'ginseng-siberiano-300mg-60-doses',
  'geleia-real-200mg-30-doses',
  'acido-lipoico-500mg-30-doses',
  'bio-arct-150mg-30-doses'
) AND NOT (recommendation_tags @> '{manha}');

UPDATE products SET recommendation_tags = array_cat(recommendation_tags, '{tarde}')
WHERE slug IN (
  'rhodiola-rosea-300mg-30-doses',
  'phosfator-400mg-60-doses',
  'ginseng-siberiano-300mg-60-doses',
  'acido-lipoico-500mg-30-doses',
  'matcha-500mg-60-doses',
  'niagen-100mg-30-doses',
  'resveratrol-100mg-30-doses',
  'silimarina-200mg-60-doses'
) AND NOT (recommendation_tags @> '{tarde}');
