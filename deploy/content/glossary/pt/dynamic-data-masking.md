---
term: Mascaramento dinâmico de dados
short: Ocultar ou transformar valores sensíveis no momento da consulta, conforme quem está perguntando, sem alterar o dado armazenado.
group: ai
also: DDM, mascaramento em tempo de consulta, dynamic data masking
related: sensitive-data, confidential-data, role-based-access-control, data-classification
article: responsible-ai-starts-with-data-governance
updated: 2026-09-07
---

Duas pessoas rodam a mesma consulta na mesma tabela e recebem respostas diferentes, de propósito. O atendente vê um cartão terminado em 4471 e o resto em asteriscos; o analista de fraude vê o número inteiro; o cientista de dados vê um hash consistente, que ainda permite o cruzamento mas não identifica ninguém. Nada foi copiado e nada foi destruído: a política é avaliada enquanto a consulta roda. É aí que ele se separa do mascaramento estático, que produz uma cópia à parte, permanentemente embaralhada, para os ambientes inferiores.

**Na prática.** A regra é presa à classificação, não ao time: uma coluna marcada como pessoal ou sensível herda uma política de mascaramento, e os papéis recebem o direito de ver através dela. Snowflake, BigQuery, Databricks e SQL Server suportam isso nativamente, o que significa escrever a política uma vez em vez de manter uma view feita à mão por público — e views feitas à mão são o motivo pelo qual uma coluna sem máscara acaba num painel que ninguém lembra de ter criado.

**Onde dá errado.** O mascaramento é tratado como se fosse o controle inteiro. Um identificador mascarado ao lado de data de nascimento, CEP e valor de transação sem máscara reidentifica pessoas com facilidade, então mascarar sem pensar no que as colunas restantes revelam é teatro. O clássico complementar: produção está bem mascarada e o ambiente de teste guarda uma cópia sem máscara de dois anos atrás que metade da empresa consegue ler.
