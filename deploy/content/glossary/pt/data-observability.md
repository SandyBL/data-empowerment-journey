---
term: Observabilidade de dados
short: Monitoramento contínuo e automatizado dos próprios dados — volume, atualidade, esquema e distribuição — para que falhas silenciosas apareçam antes que um consumidor as encontre.
group: quality
also: Observabilidade, observabilidade contínua, observabilidade automatizada, monitoramento de pipelines, monitoramento contínuo de dados
related: data-validation, data-lineage, data-quality-sla, root-cause-analysis, data-pipeline
article: when-good-data-goes-bad-end-to-end-data-quality
updated: 2026-10-06
---

Um pipeline que cai dispara um alerta. As falhas caras são as que não disparam: uma tabela que carrega metade das linhas de sempre, uma fonte que para de atualizar, uma coluna de origem que muda de tipo sem aviso. A observabilidade vigia esses sinais continuamente — contagem de linhas, atualidade em relação ao agendamento, deriva de esquema, valores saindo da faixa habitual — e avisa alguém quando os dados se comportam diferente de si mesmos.

**Na prática.** Monitore primeiro as tabelas por trás das decisões que importam e direcione cada alerta para um steward com nome, não para um canal compartilhado. Combine com a linhagem, para que um alerta em uma tabela de origem mostre na hora quais painéis e modelos dependem dela. A observabilidade é boa em dizer que algo mudou; decidir se a mudança é um problema continua sendo trabalho de alguém que conhece o negócio.

**Onde dá errado.** Uma ferramenta é ligada no data warehouse inteiro, aprende milhares de linhas de base e dispara a cada pico de fechamento de mês e a cada queda de feriado. O time silencia tudo em semanas. A outra falha é tratar a observabilidade como substituta da validação: ela percebe os dados ruins depois que chegaram, o que é útil, mas não impede que eles entrem.
