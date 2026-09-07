---
term: Controle de acesso baseado em papéis
short: Conceder acesso a papéis que descrevem um cargo e colocar as pessoas nesses papéis, para que as permissões sejam revisadas e retiradas em bloco, e não uma a uma.
group: ai
also: RBAC, controle de acesso baseado em funções, permissões por papel
related: dynamic-data-masking, sensitive-data, confidential-data, data-owner
article: responsible-ai-starts-with-data-governance
updated: 2026-09-07
---

RBAC é uma ideia de governança antes de ser técnica. As permissões ficam presas a um papel — analista de sinistros, analista de crédito, analista de marketing —, o dono dos dados aprova o que aquele papel pode ver, e a pessoa recebe o acesso ao entrar nele. O ganho não são menos cliques: é que a pergunta deixa de ser "por que a Marta tem isso?" e passa a ser "um analista de crédito deveria ver isso?", que é uma pergunta que alguém consegue responder de verdade — e responder uma única vez para todo mundo.

**Na prática.** Os papéis são nomeados pelo cargo, nunca pela pessoa nem pelo projeto. O dono dos dados aprova o escopo, e o acesso é amarrado ao ciclo de vida de RH: quem entra herda o papel, quem muda de área perde o anterior no mesmo dia, e quem sai é cortado automaticamente. Colunas sensíveis continuam atrás de uma política de mascaramento mesmo dentro de um papel aprovado, e cada papel é recertificado com periodicidade fixa pelo dono que o concedeu — recertificação é a parte pela qual todo mundo compra a ferramenta e que ninguém executa.

**Onde dá errado.** Explosão de papéis. Cada exceção cria um papel novo e, dois anos depois, há mais papéis que funcionários e ninguém sabe o que nenhum deles significa, o que na prática é o mesmo que não ter modelo. A segunda falha são as movimentações internas: admissões e desligamentos são tratados, mas quem mudou de cargo três vezes acumula a soma de tudo o que já precisou. Quando os papéis não bastam para expressar a regra, a resposta costuma ser somar atributos — região, propósito, classificação — em cima, e não outros cem papéis.
