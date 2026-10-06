---
term: Retenção de dados
short: As regras sobre por quanto tempo cada tipo de dado é guardado, que evento inicia a contagem e o que acontece com ele quando o prazo acaba.
group: ai
also: Prazo de retenção, período de retenção, política de retenção, regras de retenção, tabela de temporalidade, temporalidade de dados
match: prazos de retenção, políticas de retenção
related: data-policy, data-classification, personally-identifiable-information, data-privacy, data-management
article: data-governance-vs-data-management
updated: 2026-10-06
---

Dados são criados, usados, ficam obsoletos e em algum momento deveriam ser arquivados ou excluídos. Retenção é a decisão sobre quando. Uma regra de retenção utilizável tem três partes: a classe de dados que ela cobre, um prazo e um gatilho — o evento que inicia a contagem, como o fim de um contrato ou o encerramento de uma conta. Prazo sem gatilho é um número que ninguém consegue aplicar.

**Na prática.** Definir a regra é governança: o dono, junto com o jurídico e a área de privacidade, decide por quanto tempo os registros de clientes são guardados e o que conta como fim do relacionamento. Implementar é gestão: a rotina de retenção que arquiva os registros conforme o prazo legal e os exclui na hora certa, mais a evidência de que ela rodou. A retenção também segue o dado. Cópias, extrações e bases de treinamento herdam a regra da origem, ou a regra vale muito pouco.

**Onde dá errado.** A retenção é a decisão de governança que a maioria dos programas adia indefinidamente, porque guardar tudo parece seguro e excluir qualquer coisa parece arriscado. É assim que uma organização acaba mantendo dados pessoais por uma década sem base defensável, e descobre isso em uma auditoria ou em um vazamento, não em uma revisão.
