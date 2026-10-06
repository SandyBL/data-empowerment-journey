---
term: SLA de qualidade de dados
short: Um compromisso explícito de um time produtor de dados com seus consumidores sobre o quão atualizado, completo e preciso um conjunto de dados será, e sobre o que acontece quando não for.
group: quality
also: SLA de qualidade, acordo de nível de serviço de qualidade
match: SLAs de qualidade de dados, SLAs de qualidade
related: data-quality-threshold, data-contract, data-owner, data-observability, data-quality-dimensions
article: when-good-data-goes-bad-end-to-end-data-quality
updated: 2026-10-06
---

Um SLA de qualidade de dados transforma "os dados deveriam estar bons" em números que alguém assina: a tabela de clientes chega até as 06:00, os campos obrigatórios estão pelo menos 99,5% preenchidos, a precisão do faturamento fica acima de uma linha combinada. Ele fica entre o time que produz os dados e os times que constroem em cima deles, e nomeia um responsável do lado produtor. Sem esse nome, é um desejo com casas decimais.

**Na prática.** Comece com três dimensões, normalmente atualidade, completude e precisão, no punhado de conjuntos de dados que alimentam as decisões que as pessoas de fato discutem. Cada compromisso precisa de uma medição que rode sozinha e de um tempo de resposta para descumprimentos, não só de uma meta. O SLA útil é aquele que um dono de domínio consegue ver em um painel, ao lado de se ele foi cumprido no mês passado.

**Onde dá errado.** O SLA é escrito pelo lado consumidor, promete o que ele gostaria e não o que o produtor consegue entregar, e é descumprido desde a primeira semana. Ninguém renegocia, todos param de olhar e o documento sobrevive como prova de que um dia se falou de qualidade. Um SLA que nunca é descumprido geralmente está baixo demais; um que é sempre descumprido não é um acordo.
