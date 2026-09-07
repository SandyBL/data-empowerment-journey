---
term: Contrato de dados
short: Um acordo explícito e versionado entre quem produz um dado e quem o consome, cobrindo schema, significado, frescor, qualidade e aviso de mudança.
group: architecture
also: Acordo de compartilhamento de dados, contrato de interface, data contract
related: data-product, data-quality-rule, internal-data-marketplace, data-subdomain
article: building-a-data-governance-operating-model
updated: 2026-09-07
---

A maioria dos incidentes de dados não é corrupção: é surpresa. Um engenheiro renomeia uma coluna, restringe um tipo, muda o que "cancelado" significa ou troca uma carga noturna por horária — todas mudanças razoáveis — e onze painéis e dois modelos lá embaixo quebram ou, pior, continuam funcionando e passam a reportar silenciosamente outra coisa. Um contrato de dados torna a promessa explícita, para que a mudança seja uma negociação e não uma queda: este é o schema, isto significa cada campo, este é o frescor, estes são os limites de qualidade, este é o dono e este é o aviso que você recebe antes de qualquer um deles mudar.

**Na prática.** O contrato vive junto ao código do produtor, em controle de versão, e é testado. Uma mudança incompatível quebra o pipeline do produtor antes de subir, que é exatamente o objetivo: o custo da mudança recai sobre o time que a faz, e não sobre quem descobrir primeiro. Quem consome se registra no contrato, então o produtor vê quem quebraria, e descontinuar passa a ser uma data com caminho de migração em vez de um comunicado. Num anúncio de marketplace, o contrato é o que transforma uma tabela em algo sobre o qual outro time pode construir.

**Onde dá errado.** O contrato é uma página no wiki. Nada verifica, ele se desvia em um mês e acaba documentando como o dado se comportava antes. A outra falha é prometer demais: frescor ou completude que o produtor não tem como garantir, então o contrato é descumprido toda semana e todo mundo para de ler os alertas.
