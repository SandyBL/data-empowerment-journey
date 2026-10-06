---
term: Data lake
short: Um repositório central que guarda grandes volumes de dados brutos, no formato original, para serem estruturados depois por quem for usá-los.
group: architecture
also: lago de dados, data lakehouse, lakehouse, pântano de dados, data swamp
match: lagos de dados, Data lakes, lakehouses
related: data-architecture, data-catalog, metadata, data-owner, data-quality
article: evolution-of-data-why-data-governance-now
updated: 2026-10-06
---

Um data lake aceita quase tudo: exportações de aplicações, logs, dados de IoT, extrações de ferramentas SaaS, arquivos que ninguém lembra de ter pedido. Diferente de um data warehouse, ele não exige um schema antecipado, o que o torna barato de encher e flexível de usar. Um lakehouse acrescenta tabelas e controles no estilo warehouse sobre o mesmo armazenamento. Nos dois casos, o lake resolve um problema de armazenamento. Sozinho, ele não resolve nenhum problema de significado, propriedade ou confiança.

**Na prática.** Um lake governado é sem graça. Cada zona ou dataset tem um dono com nome, uma classificação e uma entrada no catálogo. Os dados brutos recém-chegados ficam separados dos dados curados sobre os quais se pode reportar, e a diferença fica visível para quem está navegando. Colunas sensíveis são mascaradas por padrão, não depois da primeira reclamação.

**Onde dá errado.** A ingestão roda sem gestão e tudo entra, porque é fácil. Em alguns anos o lake guarda registros duplicados, três versões da tabela de clientes e uma conta de armazenamento que ninguém sabe explicar, e os analistas voltam discretamente para as suas planilhas. Esse é o pântano de dados, e ele é um resultado de governança, não de tecnologia: ninguém decidiu o que deveria estar ali nem quem respondia por isso.
