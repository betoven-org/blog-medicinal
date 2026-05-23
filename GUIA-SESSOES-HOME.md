# Guia de Sessoes da Home — Medicinal na Web

Este documento explica como cada sessao da home funciona, de onde vem os dados
e o que voce precisa fazer no painel para que cada sessao apareca corretamente.

---

## Visao geral

A home e composta por **sessoes configuráveis** que voce gerencia pelo CMS.
Cada sessao puxa posts automaticamente do banco de dados com base em filtros,
ou voce pode selecionar posts manualmente.

Para acessar o editor: **Admin > Paginas > Home > aba Sections**

---

## 1. Post Destaque (HeroPost)

O banner principal no topo da home. Mostra um unico post em destaque com
imagem de fundo, titulo, categoria, autor e tempo de leitura.

### Como funciona

| Modo | O que aparece |
|---|---|
| **Automatico** (featured) | Pega o post **publicado** mais recente que estiver marcado como destaque |
| **Manual** | Voce informa o slug de um post especifico |

### O que o post precisa ter para aparecer

- Status: **Publicado**
- Marcado como **Destaque** (flag "featured" no editor de posts)
- Ter uma **imagem de capa** (cover ou hero image) — sem imagem o banner fica com fundo azul solido
- Ter **titulo** preenchido

### Como marcar um post como destaque

1. Va em **Admin > Posts**
2. Clique no post desejado
3. Ative a opcao **Destaque** / **Featured**
4. Salve

### Configuracoes no CMS

| Campo | O que faz | Recomendado |
|---|---|---|
| Modo | `featured` (automatico) ou `manual` | featured |
| Slug manual | Slug do post (so no modo manual) | — |
| Altura | `pequeno` (350px), `medio` (450px), `grande` (550px) | grande |
| Overlay | Escurece a imagem para o texto ficar legivel | sim |
| Mostrar categoria | Badge da categoria no canto | sim |
| Mostrar autor | Nome do autor embaixo | sim |
| Mostrar tempo de leitura | "X min de leitura" | sim |

---

## 2. Mais Recentes (PostGrid — modo recent)

Grade com os posts publicados mais recentemente, ordenados por data de publicacao.

### O que o post precisa ter para aparecer

- Status: **Publicado**
- Ter **data de publicacao** preenchida (preenchida automaticamente ao publicar)

Nao precisa de nenhuma marcacao especial — todo post publicado aparece aqui,
os mais novos primeiro.

### Configuracoes no CMS

| Campo | O que faz | Recomendado |
|---|---|---|
| Titulo | Titulo da sessao | "Mais Recentes" |
| Modo | `recent` | recent |
| Limite | Quantos posts mostrar | 6 |
| Colunas | Layout do grid | 3 |
| Mostrar categoria | Badge da categoria no card | sim |
| Mostrar tempo de leitura | Tempo estimado | sim |
| Link "Ver todos" | URL do botao | /blog |

---

## 3. Tendencias (PostCarousel ou PostGrid — modo trending)

Posts mais acessados nos **ultimos 7 dias**. O sistema conta automaticamente
quantas vezes cada post foi visualizado e rankeia por popularidade recente.

### O que o post precisa ter para aparecer

- Status: **Publicado**
- Ter recebido **visitas reais** nos ultimos 7 dias

**Importante:** Esta sessao so mostra dados depois que o site comecar a receber
trafego. Enquanto nao houver visitas suficientes, o sistema mostra automaticamente
os posts mais recentes como fallback.

### Como o ranking funciona

O sistema registra cada visita ao site (excluindo bots, paginas admin e APIs).
A cada 7 dias o ranking se renova, entao posts que recebem trafego constante
aparecem mais.

### Configuracoes no CMS

| Campo | O que faz | Recomendado |
|---|---|---|
| Titulo | Titulo da sessao | "Tendencias" |
| Modo | `trending` | trending |
| Limite | Quantos posts mostrar | 8 |
| Mostrar categoria | Badge no card | sim |
| Link "Ver todos" | URL do botao | /blog |

---

## 4. Mais Lidos (PostGrid — modo popular)

Posts mais acessados **de todos os tempos**. Diferente de Tendencias que olha
so os ultimos 7 dias, esta sessao considera todo o historico de visitas.

### O que o post precisa ter para aparecer

- Status: **Publicado**
- Ter recebido **visitas** (mesma logica de Tendencias, mas sem limite de tempo)

### Diferenca entre Tendencias e Mais Lidos

| | Tendencias | Mais Lidos |
|---|---|---|
| Periodo | Ultimos 7 dias | Todo o historico |
| Muda frequentemente | Sim | Mais estavel |
| Ideal para | Conteudo atual, sazonal | Conteudo evergreen, atemporal |

### Configuracoes no CMS

| Campo | O que faz | Recomendado |
|---|---|---|
| Titulo | Titulo da sessao | "Mais Lidos" |
| Modo | `popular` | popular |
| Limite | Quantos posts mostrar | 4 |
| Colunas | Layout do grid | 2 |
| Mostrar views | Exibir contagem de visualizacoes | sim |
| Link "Ver todos" | URL do botao | /blog |

---

## 5. Escolhas do Editor (PostGrid — modo editor-picks)

Posts selecionados manualmente pela equipe como conteudo de destaque.
Aparecem todos os posts marcados com a flag "Destaque" no editor de posts.

### O que o post precisa ter para aparecer

- Status: **Publicado**
- Marcado como **Destaque** (featured = true)

### Como gerenciar

Para adicionar um post a esta sessao:
1. **Admin > Posts** > clique no post
2. Ative **Destaque** / **Featured**
3. Salve

Para remover: desative a opcao Destaque.

A ordem e por data de publicacao (mais recentes primeiro).

**Dica:** Mantenha entre 4 e 8 posts marcados como destaque para a sessao
ficar equilibrada. Nao e necessario manter 20 posts como destaque.

### Configuracoes no CMS

| Campo | O que faz | Recomendado |
|---|---|---|
| Titulo | Titulo da sessao | "Escolhas do Editor" |
| Modo | `editor-picks` | editor-picks |
| Limite | Quantos posts mostrar | 6 |
| Colunas | Layout do grid | 3 |
| Mostrar categoria | Badge no card | sim |
| Link "Ver todos" | URL do botao | /blog |

---

## 6. Selecao Manual (PostGrid — modo manual)

Voce escolhe exatamente quais posts aparecem, informando os slugs.
Ideal para campanhas, lancamentos ou curadoria especifica.

### O que o post precisa ter para aparecer

- Status: **Publicado**
- Slug informado no campo "Slugs manuais" da sessao

### Como usar

No editor de sessoes, preencha o campo **Slugs manuais** com os slugs
dos posts separados por virgula:

```
suplementos-que-estao-em-alta-em-2025, alimentacao-e-humor-existe-relacao, saude-da-pele-na-menopausa
```

Os posts aparecem na ordem em que voce informou os slugs.

### Onde encontrar o slug de um post

1. **Admin > Posts** > clique no post
2. O slug aparece abaixo do titulo (ex: `/suplementos-que-estao-em-alta-em-2025`)
3. Copie apenas a parte depois da barra

### Configuracoes no CMS

| Campo | O que faz | Recomendado |
|---|---|---|
| Titulo | Titulo da sessao | Livre (ex: "Novidades", "Especial Verao") |
| Modo | `manual` | manual |
| Slugs manuais | Slugs separados por virgula | Os slugs desejados |
| Limite | Maximo de posts | Quantidade de slugs informados |
| Colunas | Layout do grid | 3 |

---

## Resumo: checklist por sessao

| Sessao | O post precisa de | Automatico? |
|---|---|---|
| **Post Destaque** | Publicado + Featured + Imagem de capa | Sim (pega o mais recente featured) |
| **Mais Recentes** | Publicado | Sim (ordena por data) |
| **Tendencias** | Publicado + Ter visitas nos ultimos 7 dias | Sim (contagem automatica) |
| **Mais Lidos** | Publicado + Ter visitas | Sim (contagem automatica) |
| **Escolhas do Editor** | Publicado + Featured | Sim (todos os featured) |
| **Selecao Manual** | Publicado + Slug informado | Nao (voce escolhe) |

---

## Estado atual do banco

- **104 posts** publicados
- **6 posts** marcados como destaque (featured):
  - Suplementos que estao em alta em 2025
  - Como Cactin pode ajudar na drenagem linfatica e circulacao
  - Alimentacao e humor: existe relacao?
  - Vitaminas personalizadas: tendencia da saude moderna
  - Equilibrio feminino: suplementos que transformam o bem-estar
  - Skincare de verao: leve, protetor e eficaz

---

## Como alterar a ordem das sessoes na home

1. Va em **Admin > Paginas > Home**
2. Clique no icone de **Sections** na barra lateral direita
3. Use as setas para cima/baixo para reordenar
4. As alteracoes sao salvas automaticamente como rascunho
5. Clique **Publicar** para aplicar no site

## Como adicionar uma nova sessao

1. No editor de Sections, clique em **Adicionar secao**
2. Escolha o tipo (Post Destaque, Grade de Posts, Carrossel)
3. Configure o modo e as opcoes
4. A sessao aparece no preview em tempo real
5. Clique **Publicar** quando estiver satisfeito
