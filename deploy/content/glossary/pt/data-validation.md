---
term: Validação de dados
short: Verificações automatizadas que confirmam que os dados seguem a estrutura, o formato e as regras de negócio esperados antes de seguirem adiante no pipeline.
group: quality
also: Validações de dados, validação automática, validações automáticas, testes de validação, validação de esquema, validações de qualidade
related: data-quality-rule, data-pipeline, data-observability, data-contract, data-profiling
article: when-good-data-goes-bad-end-to-end-data-quality
updated: 2026-10-06
---

A validação é o portão. Na ingestão, ela aplica o esquema, rejeita valores de transação negativos e e-mails malformados, e verifica se as chaves obrigatórias estão preenchidas. Na transformação, verifica se uma devolução tem a compra correspondente e se os totais batem entre origem e destino. Registros que falham são rejeitados ou colocados em quarentena em vez de seguir adiante, porque o lugar mais barato para corrigir dados ruins é antes de alguém construir algo em cima deles.

**Na prática.** Coloque as primeiras verificações onde hoje entram dados sem validação: ingestão via API e uploads manuais de arquivos são os suspeitos de sempre. Comece leve — esquema, completude, algumas verificações de faixa nas tabelas prioritárias — e acrescente validação de regras de negócio onde os incidentes mostrarem que é preciso. Uma verificação que falha deveria interromper a carga ou mandar os registros para uma tabela de quarentena, e alguém deveria ser dono do que cai lá.

**Onde dá errado.** As verificações registram as falhas e deixam tudo passar, e a validação vira um relatório do que deu errado ontem. Ou a tabela de quarentena existe e ninguém olha para ela, o que é só uma forma mais lenta de perder registros. Validar sem decidir o que acontece na falha é monitoramento com passos a mais.
