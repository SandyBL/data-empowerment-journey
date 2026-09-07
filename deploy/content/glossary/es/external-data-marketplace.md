---
term: Marketplace externo de datos
short: Donde los productos de datos se intercambian con terceros fuera de la compañía, ya sea comprando datos de terceros o publicando los propios.
group: architecture
also: Data exchange, mercado externo de datos, marketplace comercial de datos
related: internal-data-marketplace, data-product, data-contract, data-policy
article: building-a-data-governance-operating-model
updated: 2026-09-07
---

Dos direcciones, un mismo conjunto de preguntas de gobierno. Hacia dentro, compras: datos demográficos, firmográficos, scoring de crédito, geoespaciales, meteorología, series de mercado, sea a través de un bróker o de un exchange como Snowflake Marketplace o AWS Data Exchange. Hacia fuera, publicas: compartes con socios o vendes un agregado que solo tu compañía puede producir. En ambos casos el dato cruza la frontera donde acaban tus controles y empieza un contrato.

**En la práctica.** El dato que entra recibe el mismo trato que el interno más una licencia: un dueño interno con nombre, una procedencia documentada, controles de calidad a la llegada y condiciones explícitas sobre lo que puedes hacer con él — si puede entrenar un modelo, si puede redistribuirse a un cliente, qué pasa con los datos derivados cuando termina la suscripción. Lo que sale no sale sin el DPO y legal por escrito: qué base legal cubre la cesión, qué agregación o anonimización se aplica y quién responde si un socio lo usa más allá del acuerdo.

**Dónde se rompe.** Un fichero comprado con tarjeta de crédito se cruza en producción y, dieciocho meses después, nadie sabe su origen, su licencia ni si el contrato sigue vivo — pero tres informes regulatorios dependen de él. En el sentido contrario, el acuerdo se cierra en lo comercial y la revisión de privacidad llega después de la primera entrega, que es el orden más caro posible.
