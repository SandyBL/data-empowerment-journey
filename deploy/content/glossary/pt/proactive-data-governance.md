---
term: Governança de dados proativa
short: A governança embutida em como os dados são criados e alterados, para prevenir o problema na origem em vez de encontrá-lo lá embaixo.
group: maturity
also: Governança preventiva, governança desde o desenho
related: reactive-data-governance, levels-of-maturity, data-contract, data-quality-rule
article: building-a-data-governance-operating-model
updated: 2026-09-07
---

Governança proativa significa que os controles ficam onde o dado é feito, não onde ele é consumido. As definições são acordadas antes de a tabela ser construída. As regras de qualidade rodam dentro do pipeline, então uma carga ruim para em vez de chegar. As interfaces carregam um contrato, então uma mudança incompatível quebra o build do produtor e não o relatório de segunda-feira de outra pessoa. Os acessos são revisados por calendário, e não quando um auditor pergunta. A classificação acontece na criação, quando a pessoa que sabe o que o campo contém ainda está na sala.

**Na prática.** Isso muda o que você reporta. Um programa reativo conta incidentes fechados; um proativo conta o que não aconteceu: cargas bloqueadas antes de publicar, mudanças incompatíveis barradas no CI, acessos removidos no mesmo dia em que alguém mudou de função, datasets novos que já nasceram com dono e classificação. São indicadores antecedentes, são chatos e são a única evidência de que a prevenção está funcionando.

**Onde dá errado.** A prevenção degenera em pedágio. Cada dataset novo precisa de três aprovações e duas semanas de espera, então as pessoas fazem o que sempre fazem quando a porta da frente é lenta: constroem a coisa numa planilha, numa conta de nuvem pessoal ou num warehouse paralelo, e a função de governança perde de vista exatamente os dados que queria proteger. Se um controle não pode ser automatizado, ele precisa de um acordo de nível de serviço; e se não tem nenhum dos dois, é uma fila, não um controle.
