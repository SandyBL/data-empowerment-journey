---
term: Dados sensíveis
short: Dados cuja exposição prejudica a pessoa que eles descrevem: saúde, biometria, convicções, orientação sexual, antecedentes criminais, localização precisa.
group: ai
also: Categorias especiais de dados, dados pessoais sensíveis, special category data
related: confidential-data, personally-identifiable-information, data-classification, dynamic-data-masking
article: responsible-ai-starts-with-data-governance
updated: 2026-09-07
---

A distinção que importa é quem se machuca. Dado sensível é a categoria em que o dano recai sobre um ser humano: um diagnóstico, um template biométrico, filiação política ou religiosa, filiação sindical, orientação sexual, origem racial ou étnica, um antecedente criminal, um endereço que alguém mantém em sigilo. A LGPD os chama de dados pessoais sensíveis, o GDPR de categorias especiais, e ambos os tratam como classe separada, com base legal mais estrita — porque a consequência de um vazamento não é vergonha nem multa: é discriminação, exclusão ou risco físico para alguém que nunca escolheu estar na sua base.

**Na prática.** É uma etiqueta em nível de coluna, aplicada na criação do dado e herdada por tudo o que vem depois, com mascaramento ligado por padrão e acesso concedido para uma finalidade declarada, não para um cargo. A retenção é mais curta, compartilhar com terceiros exige base legal com nome, e modelos treinados com esses dados herdam todas essas restrições. O primeiro passo honesto normalmente é menor que uma política: descobrir quais tabelas realmente os contêm, porque o inventário quase sempre está errado.

**Onde dá errado.** Confundem-se com dados confidenciais e os dois são governados como se fossem a mesma coisa. Salários e preços são confidenciais: a exposta é a empresa. Um prontuário é sensível: o exposto é o indivíduo. Misturar leva a proteger dado comercial como se houvesse vidas em jogo, ou a proteger a saúde das pessoas com o cuidado que se dá a uma tabela de preços. Segunda falha: a etiqueta vive na coluna de origem e a cópia na planilha de alguém não herda nada.
