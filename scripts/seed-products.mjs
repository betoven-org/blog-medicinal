import { neon } from '@neondatabase/serverless';
import { readFileSync } from 'fs';

// Load .env manually
const envContent = readFileSync(new URL('../.env', import.meta.url), 'utf-8');
for (const line of envContent.split('\n')) {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) process.env[match[1].trim()] = match[2].trim();
}

const sql = neon(process.env.DATABASE_URI);

async function seed() {
  console.log('Criando categorias...');
  const cats = await sql`
    INSERT INTO product_categories (name, slug, description, parent_id, sort_order, created_at, updated_at) VALUES
    ('Gerenciamento de Peso', 'gerenciamento-de-peso', 'Suplementos para controle e gerenciamento de peso corporal', NULL, 1, NOW(), NOW()),
    ('Nutricosmeticos', 'nutricosmeticos', 'Suplementos para saude da pele, cabelos e unhas', NULL, 2, NOW(), NOW()),
    ('Desempenho Fisico', 'desempenho-fisico', 'Suplementos para performance esportiva e energia', NULL, 3, NOW(), NOW()),
    ('Saude e Bem Estar', 'saude-e-bem-estar', 'Vitaminas, minerais e suplementos para saude geral', NULL, 4, NOW(), NOW()),
    ('Longevidade', 'longevidade', 'Suplementos antioxidantes e para envelhecimento saudavel', NULL, 5, NOW(), NOW()),
    ('Fitoterapicos', 'fitoterapicos', 'Medicamentos e suplementos a base de plantas', NULL, 6, NOW(), NOW())
    RETURNING id, name, slug
  `;
  console.log('Categorias:', cats.map(c => c.name).join(', '));

  const gerPesoId = cats.find(c => c.slug === 'gerenciamento-de-peso')?.id;
  const nutriId = cats.find(c => c.slug === 'nutricosmeticos')?.id;
  const desempId = cats.find(c => c.slug === 'desempenho-fisico')?.id;
  const saudeId = cats.find(c => c.slug === 'saude-e-bem-estar')?.id;

  console.log('Criando subcategorias...');
  const subcats = await sql`
    INSERT INTO product_categories (name, slug, description, parent_id, sort_order, created_at, updated_at) VALUES
    ('Controle de Peso', 'controle-de-peso', 'Produtos para auxiliar no controle de peso', ${gerPesoId}, 1, NOW(), NOW()),
    ('Termogenicos', 'termogenicos', 'Suplementos termogenicos', ${gerPesoId}, 2, NOW(), NOW()),
    ('Cabelos', 'cabelos', 'Suplementos para fortalecimento capilar', ${nutriId}, 1, NOW(), NOW()),
    ('Pele', 'pele', 'Suplementos para saude da pele', ${nutriId}, 2, NOW(), NOW()),
    ('Pre-treino', 'pre-treino', 'Suplementos para antes do treino', ${desempId}, 1, NOW(), NOW()),
    ('Vitaminas', 'vitaminas', 'Vitaminas essenciais', ${saudeId}, 1, NOW(), NOW()),
    ('Omega 3', 'omega-3', 'Acidos graxos essenciais', ${saudeId}, 2, NOW(), NOW())
    RETURNING id, name, slug
  `;
  console.log('Subcategorias:', subcats.map(c => c.name).join(', '));

  const ctrlPesoId = subcats.find(c => c.slug === 'controle-de-peso')?.id;
  const cabelosId = subcats.find(c => c.slug === 'cabelos')?.id;
  const preTreinoId = subcats.find(c => c.slug === 'pre-treino')?.id;
  const vitaminasId = subcats.find(c => c.slug === 'vitaminas')?.id;
  const omega3Id = subcats.find(c => c.slug === 'omega-3')?.id;
  const peleId = subcats.find(c => c.slug === 'pele')?.id;

  console.log('Criando produtos...');
  const prods = await sql`
    INSERT INTO products (name, slug, description, composition, usage_instructions, who_can_use, benefits, differentials, product_category_id, product_status, featured, published_at, created_at, updated_at) VALUES
    (
      'Morosil 500mg - 60 capsulas', 'morosil-500mg-60-capsulas',
      'Formula com Morosil para apoio no controle de gordura corporal',
      E'Cada capsula contem:\nMorosil (extrato de Citrus sinensis) ............... 500mg\nExcipientes q.s.p. .......................................... 1 capsula',
      'Ingerir 2 capsulas ao dia ou conforme orientacao do profissional de saude.',
      'Adultos que buscam apoio para o controle de peso e desejam um suporte ao metabolismo de gorduras.',
      '[{"title":"Extrato de Laranja Moro","subtitle":"Rico em antocianinas"},{"title":"Apoio ao metabolismo","subtitle":"Auxilia no equilibrio metabolico"},{"title":"Qualidade garantida","subtitle":"Produzido com padrao de excelencia"}]'::jsonb,
      '["Morosil original e certificado","Formula concentrada com 500mg por capsula","Sem gluten","Sem adicao de acucares"]'::jsonb,
      ${ctrlPesoId}, 'published', true, NOW(), NOW(), NOW()
    ),
    (
      'Biotina 10.000mcg - 90 capsulas', 'biotina-10000mcg-90-capsulas',
      'Biotina de alta concentracao para fortalecimento de cabelos, pele e unhas',
      E'Cada capsula contem:\nBiotina (Vitamina B7) ............... 10.000mcg\nExcipientes q.s.p. .......................................... 1 capsula',
      'Ingerir 1 capsula ao dia, preferencialmente junto a uma refeicao.',
      'Adultos que desejam fortalecer cabelos, pele e unhas.',
      '[{"title":"Alta concentracao","subtitle":"10.000mcg por capsula"},{"title":"Cabelos fortes","subtitle":"Fortalece a fibra capilar"},{"title":"Pele saudavel","subtitle":"Contribui para a saude da pele"}]'::jsonb,
      '["Biotina de alta pureza","Dose otimizada por capsula","Sem lactose","Vegano"]'::jsonb,
      ${cabelosId}, 'published', false, NOW(), NOW(), NOW()
    ),
    (
      'Creatina Monohidratada 300g', 'creatina-monohidratada-300g',
      'Creatina pura para aumento de forca e performance muscular',
      E'Cada dose (3g) contem:\nCreatina monohidratada ............... 3g',
      'Diluir 1 colher medida (3g) em 200ml de agua. Consumir 1 vez ao dia.',
      'Adultos praticantes de atividades fisicas de alta intensidade.',
      '[{"title":"Forca muscular","subtitle":"Aumenta a capacidade de treino"},{"title":"Recuperacao","subtitle":"Acelera a recuperacao muscular"},{"title":"Pura","subtitle":"Sem aditivos ou corantes"}]'::jsonb,
      '["Creatina Creapure importada","100% pura sem misturas","Sem sabor artificial","Laudo de qualidade"]'::jsonb,
      ${preTreinoId}, 'published', true, NOW(), NOW(), NOW()
    ),
    (
      'Vitamina D3 2.000UI - 120 capsulas', 'vitamina-d3-2000ui-120-capsulas',
      'Vitamina D3 para saude ossea e imunidade',
      E'Cada capsula contem:\nVitamina D3 (Colecalciferol) ............... 2.000UI (50mcg)',
      'Ingerir 1 capsula ao dia junto a uma refeicao com gordura.',
      'Adultos com deficiencia de vitamina D ou que buscam manter niveis adequados.',
      '[{"title":"Saude ossea","subtitle":"Essencial para absorcao de calcio"},{"title":"Imunidade","subtitle":"Fortalece o sistema imunologico"},{"title":"Bem-estar","subtitle":"Melhora o humor e disposicao"}]'::jsonb,
      '["Vitamina D3 de alta biodisponibilidade","Capsulas softgel","Dose diaria otimizada","Sem gluten"]'::jsonb,
      ${vitaminasId}, 'published', false, NOW(), NOW(), NOW()
    ),
    (
      'Omega 3 EPA DHA 1000mg - 120 capsulas', 'omega-3-epa-dha-1000mg-120-capsulas',
      'Oleo de peixe concentrado com EPA e DHA para saude cardiovascular',
      E'Cada capsula contem:\nOleo de peixe ............... 1000mg\nEPA ............... 540mg\nDHA ............... 360mg',
      'Ingerir 2 capsulas ao dia junto as refeicoes principais.',
      'Adultos que buscam suporte cardiovascular e cerebral.',
      '[{"title":"Coracao saudavel","subtitle":"Suporte cardiovascular"},{"title":"Funcao cerebral","subtitle":"DHA essencial para o cerebro"},{"title":"Anti-inflamatorio","subtitle":"Propriedades anti-inflamatorias"}]'::jsonb,
      '["Alta concentracao de EPA e DHA","Oleo de peixe ultraconcentrado","Sem sabor residual","Certificado IFOS"]'::jsonb,
      ${omega3Id}, 'published', false, NOW(), NOW(), NOW()
    ),
    (
      'Colageno Verisol 2.5g - 60 saches', 'colageno-verisol-25g-60-saches',
      'Colageno hidrolisado Verisol para pele, cabelos e unhas',
      E'Cada sache contem:\nPeptideos de colageno Verisol ............... 2.5g\nVitamina C ............... 45mg',
      'Diluir 1 sache em 200ml de agua ou suco. Consumir 1 vez ao dia.',
      'Adultos que desejam melhorar a elasticidade e firmeza da pele.',
      '[{"title":"Pele firme","subtitle":"Melhora a elasticidade"},{"title":"Verisol","subtitle":"Peptideos bioativos patentados"},{"title":"Praticidade","subtitle":"Saches individuais"}]'::jsonb,
      '["Colageno Verisol original","Com vitamina C para absorcao","Sabor neutro","Sem acucar"]'::jsonb,
      ${peleId}, 'published', true, NOW(), NOW(), NOW()
    )
    RETURNING id, name
  `;
  console.log('Produtos:', prods.map(p => p.name).join(', '));
  console.log('\nSeed concluido!');
}

seed().catch(console.error);
