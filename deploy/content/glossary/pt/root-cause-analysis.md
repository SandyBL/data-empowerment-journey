---
term: Análise de causa raiz
short: Seguir um defeito de dados além do sintoma até o processo, sistema ou decisão que o produz, para que a correção impeça que ele volte.
group: quality
also: causa raiz, causa-raiz, causas-raiz, RCA, os 5 porquês, cinco porquês
match: Análise de causas raiz, causas raiz
related: dmaic, data-quality, data-quality-rule, data-profiling, data-lineage
article: identifying-addressing-data-pain-points
updated: 2026-10-06
---

Um campo quebrado é um sintoma. A causa quase sempre está antes do banco de dados: um formulário que aceita texto livre, uma passagem entre times que ninguém assumiu, uma integração que trunca em silêncio, uma meta que premia preencher qualquer coisa para fechar o chamado. A análise de causa raiz é a disciplina de perguntar por quê até chegar a algo que uma pessoa ou uma mudança de processo consiga corrigir. Os 5 porquês são a ferramenta de sempre e a linhagem é o mapa que se segue. É o passo Analisar do DMAIC, e o que transforma uma limpeza em uma melhoria.

**Na prática.** Comece pelos escalonamentos, não por um framework. Puxe um ano de incidentes, tickets e achados de auditoria e classifique por causa; a maioria das organizações descobre que quatro ou cinco causas explicam a maior parte, e que ao menos uma se repete há anos sem dono. Cada causa confirmada deve terminar em duas coisas: uma correção onde o defeito nasce e uma regra de qualidade de dados que pegue a próxima ocorrência.

**Onde dá errado.** A análise para na primeira resposta técnica — "o job de ETL falhou" —, que é onde a culpa é mais fácil de colocar e menos útil. Ou dura um trimestre, produz um lindo diagrama de causa e efeito e não muda nenhum sistema. Uma análise que não muda um processo só documentou o problema com mais detalhe.
