---
term: Gestão de dados
short: O trabalho de construir e operar os sistemas, processos e controles que sustentam os dados por todo o seu ciclo de vida.
group: foundations
also: Gestão de dados corporativa, EDM
related: data-governance, master-data-management, dama-dmbok
article: data-governance-vs-data-management
updated: 2026-09-05
---

Gestão de dados é o trabalho de execução: modelar, integrar, armazenar, proteger, mover, arquivar e por fim excluir dados. É o que fazem engenheiros de dados, DBAs, arquitetos e analistas. A governança decide as regras; a gestão constrói e opera dentro delas. O DAMA-DMBOK coloca a governança como o eixo central de onze disciplinas de gestão exatamente para evitar que as duas sejam confundidas.

**Na prática.** A diferença fica mais clara em um único pedido. "O e-mail do cliente nunca deve estar vazio" é uma decisão de governança: alguém com autoridade sobre o domínio de cliente a declarou. Adicionar a restrição NOT NULL, corrigir as 40.000 linhas que a violam e monitorar novas violações é gestão de dados.

**Onde dá errado.** As organizações contratam gestão de dados e chamam isso de governança. A plataforma é construída, os pipelines rodam, e ninguém decidiu o que os números significam, então o mesmo campo é carregado de três formas para três consumidores que cada um acreditava que a sua era a definição. A falha inversa é mais silenciosa e igualmente comum: uma função de governança que produz políticas que nenhum time de engenharia teve orçamento para implementar.
