---
term: Gestão de dados mestres
short: A disciplina de manter um único registro autoritativo das entidades que todo o negócio compartilha: cliente, produto, fornecedor, funcionário.
group: metadata
also: MDM, gestão de dados de referência
related: data-management, single-source-of-truth, data-domain, data-quality
article: data-governance-vs-data-management
updated: 2026-09-05
---

Dados mestres são os que aparecem em todos os sistemas: o cliente que existe no CRM, no faturamento, no suporte e no armazém, em quatro versões ligeiramente diferentes. MDM é a prática de resolvê-las em um único registro com um identificador conhecido, e de decidir qual sistema pode alterar qual atributo. É trabalho técnico com um pré-requisito de governança, porque regras de correspondência e de sobrevivência são decisões de negócio disfarçadas de configuração.

**Na prática.** Projetos de MDM funcionam quando partem de uma dor concreta — clientes duplicados inflando a taxa de churn, um fornecedor pago duas vezes — e cobrem uma única entidade. Fracassam quando partem da ambição de uma visão única de cliente para toda a empresa.

**Onde dá errado.** O limite de correspondência é definido pelo time de implantação. Alguém tem que decidir se mesclar dois registros com 92% de similaridade é aceitável, e a consequência de uma mescla errada é um cliente vendo os dados de outro cliente. Essa é uma decisão do dono, e delegá-la a uma tela de configuração é como o MDM se torna um incidente de privacidade.
