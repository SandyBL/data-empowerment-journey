---
term: Linhagem de dados
short: O caminho rastreável de um valor desde onde se originou até onde é usado, incluindo cada transformação no percurso.
group: metadata
also: Procedência, fluxo de dados, análise de impacto
related: metadata, data-catalog, single-source-of-truth, data-quality
article: dama-dmbok-data-governance-framework
updated: 2026-09-05
---

A linhagem responde a duas perguntas que de outra forma são caras. Para cima: este número parece errado, de onde veio e o que o tocou? Para baixo: vamos mudar este campo, o que quebra? A segunda é a análise de impacto e, em organizações com alguma complexidade de pipelines, é a que paga todo o exercício: a alternativa é um congelamento de mudanças ou uma descoberta em produção.

**Na prática.** A linhagem vale ser capturada na granularidade sobre a qual você vai agir. Linhagem tabela a tabela nos pipelines que sustentam os relatórios regulatórios normalmente basta para responder às duas perguntas; linhagem em nível de coluna em todo o parque é um projeto de pesquisa.

**Onde dá errado.** A linhagem é desenhada à mão em uma ferramenta de diagramas. É exata no dia em que é desenhada e está errada antes de a sprint acabar, e como parece autoritativa as pessoas se apoiam nela depois de deixar de ser verdadeira. Uma linhagem que não é derivada dos próprios pipelines tem validade de semanas.
