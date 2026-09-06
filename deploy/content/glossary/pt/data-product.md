---
term: Produto de dados
short: Um conjunto de dados curado, documentado e com dono, construído e mantido para consumidores conhecidos e com um nível de serviço associado.
group: architecture
also: Dados como produto
related: data-domain, data-owner, data-catalog, single-source-of-truth
article: building-a-data-governance-operating-model
updated: 2026-09-05
---

Tratar dados como produto significa que alguém responde por os consumidores estarem satisfeitos, não apenas por o pipeline rodar. Isso implica documentação, uma interface estável, uma frequência de atualização declarada, garantias de qualidade, um caminho para reportar problemas e um plano para alterá-lo sem quebrar quem está adiante. É a mesma disciplina que um time de software aplica a uma API, aplicada a uma tabela.

**Na prática.** Um produto de dados só é produto se tiver consumidores com nome. Dois times que dependem dele, com uma atualização acordada e um caminho para reclamar, é suficiente. Sem consumidores você tem um conjunto de dados com papelada extra.

**Onde dá errado.** Todas as tabelas existentes são rerrotuladas como produtos de dados sem nenhuma mudança em propriedade, documentação ou compromisso. Renomear não cria responsabilidade. O teste é simples e implacável: se a carga falhar em um domingo, existe alguém que não seja o time de plataforma que saiba, se importe e tenha obrigação declarada de responder?
