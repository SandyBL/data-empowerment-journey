---
term: Informação pessoal identificável
short: Dados que identificam uma pessoa viva, diretamente ou em combinação com outros dados a que quem os detém tem acesso.
group: ai
also: PII, dados pessoais
related: data-classification, data-policy, ai-governance, data-owner
article: responsible-ai-starts-with-data-governance
updated: 2026-09-05
---

PII é mais amplo do que a maioria dos inventários supõe, porque identificabilidade é contextual. Um CEP não identifica; um CEP mais uma data de nascimento mais um cargo frequentemente identifica. Sob a LGPD e o GDPR o conceito relevante é dado pessoal, que cobre qualquer coisa relativa a uma pessoa identificável, incluindo dados que só a identificam quando cruzados com algo mais que você já tem. É por isso que "removemos os nomes" não é, por si só, anonimização.

**Na prática.** Encontre os dados pessoais rastreando a finalidade, não varrendo colunas. Pergunte quais processos envolvem uma pessoa, o que foi coletado, o que foi dito a ela na ocasião e em que base a organização está se apoiando. Varreduras de padrões encontram endereços de e-mail; não encontram o cruzamento que torna um conjunto de dados reidentificável.

**Onde dá errado.** Dados pseudonimizados são tratados como anônimos e movidos para fora dos seus controles originais: para um ambiente de analytics, um sistema de teste, um conjunto de treinamento. Dados pseudonimizados continuam sendo dados pessoais, porque a chave que os reverte existe. Anônimo significa irreversivelmente anônimo, e muito pouco dado de um parque operacional atende a esse limite.
