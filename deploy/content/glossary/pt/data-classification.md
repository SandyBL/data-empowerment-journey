---
term: Classificação de dados
short: Rotular os dados pelo grau de sensibilidade, para que as regras de manuseio sejam aplicadas automaticamente em vez de lembradas.
group: ai
also: Classificação de sensibilidade, classificação da informação
related: personally-identifiable-information, data-policy, ai-governance, data-owner
article: responsible-ai-starts-with-data-governance
updated: 2026-09-05
---

Um esquema de classificação é um conjunto pequeno de rótulos — público, interno, confidencial e restrito são os quatro habituais — cada um ligado a regras concretas de manuseio: quem pode acessar, se pode sair do país, se pode ser usado para treinar um modelo, por quanto tempo é retido, como deve ser destruído. O rótulo só vale pelas regras que estão por trás; um rótulo sem consequência é decoração.

**Na prática.** Quatro níveis é o máximo prático. Cada nível além disso produz discussões sobre casos-limite e rotulagem inconsistente, e a diferença entre "confidencial" e "altamente confidencial" quase nunca é operacionalizada de forma distinta.

**Onde dá errado.** A classificação é aplicada pedindo aos donos dos dados que rotulem tudo, o que resulta em todo o parque marcado como confidencial: a resposta segura para quem rotula e inútil para todos os outros. Ancore o esquema em exemplos, use "interno" como padrão e exija justificativa para o nível mais alto.
