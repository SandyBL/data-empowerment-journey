---
term: Marketplace interno de dados
short: O lugar dentro da empresa onde os times navegam por produtos de dados publicados, pedem acesso e recebem — com dono, contrato e nível de serviço em cada anúncio.
group: architecture
also: Marketplace de dados, mercado interno de dados, loja de dados
related: data-product, data-catalog, data-contract, external-data-marketplace
article: building-a-data-governance-operating-model
updated: 2026-09-07
---

Um catálogo diz que o dado existe. Um marketplace entrega o dado. A diferença é o caixa: um anúncio que você pode solicitar, uma aprovação que chega a quem é responsável e um acesso que aparece em horas, não depois de um trimestre de e-mails. Isso importa porque a alternativa não é "as pessoas esperam": é que o analista que não consegue o dataset certificado num prazo razoável reconstrói ele mal a partir de um extrato de origem — e agora a empresa tem duas versões de receita.

**Na prática.** Cada anúncio é um produto de dados, não uma tabela: tem dono, descrição em linguagem de negócio, contrato cobrindo schema e frescor, uma nota de qualidade visível, números de uso e de custo, e um fluxo de solicitação que termina num papel concedido, não num ticket. Quem consome vê quem mais usa e o que mudou no mês passado. A medida de que funciona é o tempo mediano entre pedido e acesso — e se esse número está na meta de alguém.

**Onde dá errado.** O marketplace nasce com o warehouse inteiro despejado dentro — dez mil tabelas, sem donos, sem contratos — e vira uma busca mais lenta. Ou a vitrine é real, mas o pedido cai numa fila sem nível de serviço, o que ensina a todos que o atalho é mais rápido. Um marketplace com cinquenta produtos de verdade governados vale mais que um com tudo e ninguém atrás.
