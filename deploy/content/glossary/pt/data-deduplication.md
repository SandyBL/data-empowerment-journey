---
term: Deduplicação de dados
short: Encontrar os registros que descrevem a mesma entidade do mundo real e consolidá-los em um só, usando chaves de negócio e regras de correspondência acordadas.
group: quality
also: Deduplicação, detecção de duplicados, detecção de duplicidade, rotinas de deduplicação, resolução de entidades
related: master-data-management, single-source-of-truth, data-profiling, data-quality-dimensions, critical-data-element
article: why-data-quality-is-a-business-imperative
updated: 2026-10-06
---

O mesmo cliente aparece três vezes, com grafias um pouco diferentes, dois endereços e um único e-mail entre eles. A deduplicação encontra esses registros, decide quais pertencem juntos e os mescla ou vincula para que o negócio conte um cliente em vez de três. A parte difícil não é o algoritmo de correspondência; é concordar sobre o que faz dois registros serem a mesma entidade e qual versão de cada atributo sobrevive.

**Na prática.** Faça o profiling da taxa de duplicados na chave natural do seu conjunto de dados mais usado antes de escolher uma ferramenta: o número defende o caso sozinho. Combine com o dono dos dados as regras de correspondência e de sobrevivência, rode a deduplicação como rotina recorrente e não como limpeza pontual, e declare o registro resultante como fonte da verdade. É uma das vitórias iniciais mais confiáveis de um programa de governança, porque é visível e mensurável.

**Onde dá errado.** Um projeto de limpeza deduplica a base de clientes, todos comemoram e os sistemas de origem continuam criando duplicados no mesmo ritmo. Seis meses depois, o número voltou. A deduplicação só se mantém por causa da decisão de governança que vem depois dela: uma fonte autorizada e um processo no ponto de entrada que verifica antes de criar.
