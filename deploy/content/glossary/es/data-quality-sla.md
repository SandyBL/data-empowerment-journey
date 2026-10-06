---
term: SLA de calidad de datos
short: Un compromiso explícito de un equipo productor de datos con sus consumidores sobre la frescura, completitud y precisión de un conjunto de datos, y sobre qué pasa cuando no se cumplen.
group: quality
also: SLA de calidad, acuerdo de nivel de servicio de calidad
match: SLAs de calidad de datos, SLAs de calidad
related: data-quality-threshold, data-contract, data-owner, data-observability, data-quality-dimensions
article: when-good-data-goes-bad-end-to-end-data-quality
updated: 2026-10-06
---

Un SLA de calidad de datos convierte "los datos deberían estar bien" en números que alguien firma: la tabla de clientes llega antes de las 06:00, los campos obligatorios están informados al menos en un 99,5 %, la precisión de facturación se mantiene por encima de una línea acordada. Se sitúa entre el equipo que produce los datos y los equipos que construyen sobre ellos, y nombra a un responsable del lado productor. Sin ese nombre es un deseo con decimales.

**En la práctica.** Empieza con tres dimensiones, normalmente frescura, completitud y precisión, sobre el puñado de conjuntos de datos que alimentan decisiones por las que la gente realmente discute. Cada compromiso necesita una medición que se ejecute sola y un tiempo de respuesta ante incumplimientos, no solo un objetivo. El SLA útil es el que un dueño de dominio puede ver en un panel junto a si se cumplió el mes pasado.

**Dónde se rompe.** El SLA lo redacta el lado consumidor, promete lo que le gustaría y no lo que el productor puede entregar, y se incumple desde la primera semana. Nadie lo renegocia, todos dejan de mirarlo y el documento sobrevive como prueba de que alguna vez se habló de calidad. Un SLA que nunca se incumple suele estar demasiado bajo; uno que se incumple siempre no es un acuerdo.
