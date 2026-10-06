---
term: Privacidade de dados
short: A disciplina de garantir que dados pessoais sejam coletados, usados e compartilhados só para finalidades que a pessoa pode esperar e que a lei permite.
group: ai
also: Privacidade da informação, proteção de dados, proteção de dados pessoais, privacidade desde a concepção, privacy by design, controles de privacidade
related: personally-identifiable-information, sensitive-data, data-classification, dynamic-data-masking, ai-governance
article: responsible-ai-starts-with-data-governance
updated: 2026-10-06
---

Privacidade é sobre a pessoa que está nos dados, não sobre a organização que os guarda. Segurança pergunta se os dados estão protegidos de quem não deveria vê-los. Privacidade pergunta se quem pode vê-los deveria usá-los para isso. Leis como a LGPD, o GDPR e a CCPA transformam essa pergunta em obrigações: base legal, finalidade declarada, minimização, limites de retenção e direitos que o titular pode exercer.

**Na prática.** Privacidade se conecta com classificação e acesso. Campos pessoais são etiquetados na criação, mascarados por padrão e liberados para uma finalidade declarada, não para um cargo. A marcação de finalidade faz a maior parte do trabalho: um dataset coletado para faturamento não fica automaticamente disponível para um modelo de churn, e uma base de treinamento herda os limites de consentimento e finalidade de cada fonte que a alimentou.

**Onde dá errado.** A privacidade é tratada como documento jurídico em vez de conjunto de controles. A política diz que os dados só são usados para finalidades declaradas; nada no catálogo registra quais eram essas finalidades. Aí um modelo vai para produção e ninguém consegue dizer se os clientes que estão nele consentiram com esse uso. A política nunca esteve errada. Só não tinha nada embaixo dela.
