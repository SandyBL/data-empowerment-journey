---
term: Ingestão ativa de metadados
short: Capturar metadados conforme os eventos acontecem — em tempo real, a partir dos próprios sistemas — e devolvê-los às ferramentas onde as pessoas trabalham.
group: metadata
also: Metadados ativos, captura de metadados por eventos, ingestão de metadados em tempo real
related: metadata, data-catalog, data-lineage, data-quality-rule
article: introduction-basics-data-governance-program
updated: 2026-09-07
---

A maioria dos catálogos foi projetada para ser varrida: um scan roda no domingo à noite e, na quarta, o catálogo descreve um warehouse que já não existe. A ingestão ativa inverte isso. Cada execução de pipeline, cada mudança de schema, cada acesso concedido, cada teste que falha e cada consulta a uma tabela emitem um evento, e a plataforma de metadados escuta em vez de perguntar. O ganho não é documentação mais fresca: é que um metadado que chega em segundos pode ser acionado automaticamente, coisa que o metadado passivo nunca permitiu.

**Na prática.** Os conectores assinam o que a plataforma já emite: logs de consulta, eventos do orquestrador, fluxos de CDC, execuções de CI, mudanças de IAM. A linhagem é recalculada a cada execução em vez de deduzida do SQL uma vez por trimestre, uso e custo vêm do consumo real, e o ciclo se fecha do lado operacional: uma regra de qualidade que falha abre um ticket para o dono com nome, uma mudança incompatível de schema quebra o build do produtor, uma tabela sem uso entra na lista de descontinuação e uma coluna nova com cara de dado pessoal é sinalizada antes de alguém consultá-la.

**Onde dá errado.** Constrói-se o fluxo e não o ciclo. Milhões de eventos entram num catálogo que ninguém abre e a única diferença em relação ao scan semanal é a fatura. O teste é simples: algum evento de metadado muda algo fora do catálogo — um alerta, uma revisão de acessos, um deploy bloqueado? Se não, isto é um projeto de documentação muito caro.
