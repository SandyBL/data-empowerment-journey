---
term: Arquitetura de dados
short: O desenho de como os dados são estruturados, armazenados, movidos e integrados entre sistemas, construído sobre os limites e padrões que a governança decide.
group: architecture
also: Arquitetura de dados corporativa
match: arquiteturas de dados
related: data-governance, data-management, data-domain, single-source-of-truth, data-standard
article: dama-dmbok-data-governance-framework
updated: 2026-10-06
---

Arquitetura de dados é a planta do parque de dados: os modelos, os padrões de integração, as plataformas e os caminhos que os dados percorrem entre elas. No DMBOK ela é uma das áreas de conhecimento ao redor do centro da governança, e a divisão de trabalho é limpa. A governança fornece os limites dos domínios, a fonte autoritativa de cada entidade e os padrões. A arquitetura transforma essas decisões em modelos e desenho de plataforma. É trabalho de gestão de dados, não de governança, mas é onde as decisões de governança viram coisa física.

**Na prática.** As perguntas de arquitetura que mais importam para a governança raramente são sobre tecnologia. Qual sistema é a fonte autoritativa de cliente? Onde termina um domínio? Que padrão um pipeline novo precisa cumprir antes de ir para produção? Se essas respostas existem e estão escritas, os arquitetos escolhem bem e rápido. Se não, eles mesmos tomam as decisões de governança, de forma implícita, uma integração por vez.

**Onde dá errado.** Anos de escolhas locais razoáveis produzem um parque fragmentado: mainframes legados, um lakehouse na nuvem e uma dúzia de ferramentas SaaS, cada uma com sua própria definição sobreposta da mesma entidade. Ninguém projetou a bagunça. Cada peça fazia sentido quando foi adicionada, e nenhuma decisão jamais cobriu como elas se encaixam. Uma migração de plataforma não resolve, porque as definições migram junto com os dados.
