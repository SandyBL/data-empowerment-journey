---
term: Perfilamento de dados
short: Examinar os dados reais para descobrir o que há de fato neles: distribuições de valores, taxas de nulos, formatos, atípicos e relações.
group: quality
also: Profiling, avaliação de dados
related: data-quality, data-quality-rule, metadata, critical-data-element
article: identifying-addressing-data-pain-points
updated: 2026-09-05
---

Perfilamento é como você descobre que o campo de país contém 47 grafias distintas de "Reino Unido", que 8% das datas de nascimento são 01/01/1900 e que uma coluna documentada como obrigatória está vazia em um terço das linhas. É o diagnóstico mais barato do trabalho com dados e o mais frequentemente pulado, porque produz fatos incômodos antes de um projeto ter acordado seu escopo.

**Na prática.** Perfile antes de prometer. Meio dia de perfilamento nas tabelas por trás de um painel proposto vai dizer se esse painel é um trabalho de duas semanas ou de dois trimestres, e isso é a coisa mais útil que você pode saber no início.

**Onde dá errado.** O resultado do perfilamento é apresentado cru. Ninguém fora do time de dados tem opinião sobre um relatório de cardinalidade. Traduza: "a tabela de clientes tem 14.000 registros duplicados, e é por isso que a taxa de churn no material da diretoria está superestimada em cerca de quatro pontos". Mesma descoberta, outra consequência.
