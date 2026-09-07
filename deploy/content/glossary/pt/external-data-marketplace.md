---
term: Marketplace externo de dados
short: Onde produtos de dados são trocados com partes fora da empresa, seja comprando dados de terceiros, seja publicando os seus.
group: architecture
also: Data exchange, mercado externo de dados, marketplace comercial de dados
related: internal-data-marketplace, data-product, data-contract, data-policy
article: building-a-data-governance-operating-model
updated: 2026-09-07
---

Duas direções, o mesmo conjunto de perguntas de governança. Para dentro, você compra: dados demográficos, firmográficos, score de crédito, geoespaciais, meteorologia, séries de mercado, seja via broker, seja via exchange como Snowflake Marketplace ou AWS Data Exchange. Para fora, você publica: compartilha com parceiros ou vende um agregado que só a sua empresa consegue produzir. Nos dois casos o dado cruza a fronteira onde os seus controles terminam e um contrato começa.

**Na prática.** O dado que entra recebe o mesmo tratamento do interno mais uma licença: um dono interno com nome, procedência documentada, checagens de qualidade na chegada e condições explícitas sobre o que se pode fazer com ele — se pode treinar um modelo, se pode ser redistribuído a um cliente, o que acontece com os dados derivados quando a assinatura termina. O que sai não sai sem o DPO e o jurídico registrados: qual base legal cobre o compartilhamento, qual agregação ou anonimização é aplicada e quem responde se um parceiro usar além do acordado.

**Onde dá errado.** Um arquivo comprado no cartão de crédito é cruzado em produção e, dezoito meses depois, ninguém sabe a origem, a licença nem se o contrato ainda existe — mas três relatórios regulatórios dependem dele. No sentido oposto, o acordo é fechado no comercial e a revisão de privacidade acontece depois da primeira entrega, que é a ordem mais cara possível.
