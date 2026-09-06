---
term: Domínio de dados
short: Uma área temática delimitada de dados — cliente, produto, funcionário, contrato — pela qual um único dono pode razoavelmente responder.
group: foundations
also: Área de assunto, domínio de informação
related: data-owner, data-product, data-governance-operating-model, master-data-management
article: building-a-data-governance-operating-model
updated: 2026-09-05
---

Um domínio é a forma de dividir a governança em pedaços pequenos o suficiente para terem dono. Cliente, produto, fornecedor, funcionário, finanças, contrato: cada um é um corpo de dados com suas próprias definições, seus próprios sistemas de registro, sua própria exposição regulatória e seu próprio dono natural em algum lugar do negócio. Domínios são a unidade sobre a qual quase todo modelo operacional é construído, porque "quem é dono dos dados" é uma pergunta sem resposta e "quem é dono dos dados de cliente" não é.

**Na prática.** Bons domínios seguem o negócio, não o organograma nem o banco de dados. São poucos — de oito a quinze em escala corporativa — e cada um tem exatamente um dono responsável, um sistema de registro e uma lista de elementos de dados críticos. O teste de uma fronteira é se um campo em disputa tem um lar óbvio.

**Onde dá errado.** Os domínios são desenhados em volta dos sistemas, então "dados do Salesforce" se torna um domínio e o registro de cliente que também vive em faturamento e em suporte tem três donos e nenhum dono. Também são desenhados pequenos demais: quarenta domínios significam quarenta donos, o que significa que ninguém responde de verdade e que o conselho não cabe em uma sala.
