---
term: Pipeline de dados
short: Uma sequência automatizada de etapas que leva os dados de onde são produzidos até onde são usados, transformando-os no caminho.
group: architecture
also: pipeline ETL, pipeline ELT, pipeline de integração, pipeline de transformação
match: Pipelines de dados, pipelines ETL, pipelines ELT, pipelines de integração, pipelines de transformação
related: data-validation, data-observability, data-lineage, data-contract, data-quality-rule
article: when-good-data-goes-bad-end-to-end-data-quality
updated: 2026-10-06
---

Um pipeline é o encanamento entre um sistema de origem e um relatório, um modelo ou outro sistema: ingerir, validar, transformar, carregar e repetir conforme um agendamento. Construir e operar pipelines é trabalho de gestão de dados. A governança não os escreve, mas decide o que eles precisam respeitar: qual fonte é a autoritativa, quais campos estão classificados, qual tolerância de qualidade vale e quem precisa ser avisado quando algo muda na origem.

**Na prática.** A falha perigosa raramente é a queda. Um pipeline que para dispara um alerta e alguém resolve antes do almoço. O que continua rodando com um nulo no lugar errado ou um código de moeda trocado transforma, em silêncio, um registro ruim em um agregado ruim e depois em uma decisão ruim. As verificações ficam em cada etapa crítica, não só no final, e uma verificação que falha sobre dados críticos deve interromper a execução ou mandar os registros para quarentena, não deixá-los passar com um aviso.

**Onde dá errado.** Cada time constrói seu próprio pipeline a partir da mesma fonte, cada um com uma lógica um pouco diferente, e ninguém é dono das diferenças. Aí um schema muda na origem sem aviso, metade dos pipelines quebra em silêncio e quem encontra a divergência é um auditor. Consertar o pipeline é gestão. Decidir quem precisa ser avisado antes de o schema mudar é governança.
