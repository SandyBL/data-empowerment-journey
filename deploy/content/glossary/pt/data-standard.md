---
term: Padrão de dados
short: A regra concreta e verificável que diz como uma política é satisfeita: formato, valores permitidos, nomenclatura, tolerância.
group: foundations
also: Padrão de nomenclatura, especificação de dados
related: data-policy, data-quality-rule, business-glossary
article: introduction-basics-data-governance-program
updated: 2026-09-05
---

Se uma política diz "os dados de contato do cliente devem ser utilizáveis", o padrão diz o que utilizável significa: o e-mail atende a um formato válido, o código de país é ISO 3166-1 alfa-2, o telefone é armazenado em E.164, o endereço é validado contra o arquivo postal de referência. Um padrão é escrito para ser verificado por uma máquina. Aí está a diferença em relação a uma política: uma política é um compromisso, um padrão é uma especificação.

**Na prática.** Padrões são o ponto em que a governança deixa de ser abstrata, porque cada um pode se tornar uma regra de qualidade com limite e painel. A sequência útil é curta: nomeie o elemento de dados crítico, escreva o padrão dele, implemente como regra, reporte a taxa de violação.

**Onde dá errado.** Escrevem-se padrões para tudo em vez de para o que importa, o que produz um documento que ninguém consegue implementar e um backlog que ninguém vai financiar. Vinte padrões cobrindo os campos que aparecem no reporte regulatório e nos painéis da diretoria valem mais que duzentos cobrindo cada coluna do armazém.
