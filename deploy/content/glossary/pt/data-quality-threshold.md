---
term: Limite de qualidade de dados
short: A linha, definida pelo negócio, a partir da qual uma medição de qualidade deixa de ser aceitável e alguém precisa agir.
group: quality
also: limite de qualidade, limiar de qualidade, limite aceitável de erro, limites aceitáveis de erro
match: limiares de qualidade, Limites de qualidade de dados, limites de qualidade
related: data-quality-rule, data-quality-sla, critical-data-element, data-owner, data-quality-dimensions
article: why-data-quality-is-a-business-imperative
updated: 2026-10-06
---

Um limite é o número que transforma uma medição em uma decisão. Completude de 97% não significa nada sozinha; completude abaixo de 98% no endereço de cobrança, que trava a emissão de faturas, significa que o steward recebe um chamado. Quem define é o dono dos dados, porque só o negócio sabe quanto erro um processo absorve antes de custar dinheiro. A engenharia aplica, e o steward cuida do que fica abaixo.

**Na prática.** Defina limites por uso, não por campo no abstrato, e parta da consequência: o que quebra mais adiante e a partir de que taxa começa a doer? Coloque o limite onde o trabalho já acontece — na definição de pronto de um pipeline, nos critérios de lançamento — para que ele seja verificado toda vez, e não revisado uma vez por trimestre. Registre por que cada número foi escolhido; o motivo é o que permite mudá-lo depois sem briga.

**Onde dá errado.** Os limites são copiados do padrão de um fornecedor ou fixados em 100% porque qualquer coisa menor soa como aceitar dados ruins. Um limite de 100% dispara o tempo todo, é silenciado e não protege nada. A falha oposta é um limite tão frouxo que nunca dispara, o que no painel parece boa qualidade e não é.
