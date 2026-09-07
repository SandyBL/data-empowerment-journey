---
term: Gobierno de datos proactivo
short: El gobierno incorporado a cómo se crean y cambian los datos, para prevenir los problemas en el origen en lugar de encontrarlos aguas abajo.
group: maturity
also: Gobierno preventivo, gobierno desde el diseño
related: reactive-data-governance, levels-of-maturity, data-contract, data-quality-rule
article: building-a-data-governance-operating-model
updated: 2026-09-07
---

Gobierno proactivo significa que los controles están donde se fabrica el dato, no donde se consume. Las definiciones se acuerdan antes de construir la tabla. Las reglas de calidad corren dentro del pipeline, así que una carga defectuosa se detiene en lugar de llegar. Las interfaces llevan un contrato, así que un cambio incompatible rompe la build del productor y no el informe del lunes de otra persona. Los accesos se revisan por calendario y no cuando pregunta un auditor. La clasificación ocurre al crear el dato, cuando la persona que sabe qué contiene el campo todavía está en la sala.

**En la práctica.** Cambia lo que reportas. Un programa reactivo cuenta incidentes cerrados; uno proactivo cuenta cosas que no pasaron: cargas bloqueadas antes de publicarse, cambios incompatibles detenidos en CI, accesos retirados el mismo día en que alguien cambió de puesto, datasets nuevos que nacieron ya con dueño y clasificación. Son indicadores adelantados, son aburridos y son la única evidencia de que la prevención funciona.

**Dónde se rompe.** La prevención degenera en aduana. Cada dataset nuevo necesita tres aprobaciones y dos semanas de espera, así que la gente hace lo que siempre hace cuando la puerta principal es lenta: construye la cosa en una hoja de cálculo, una cuenta de nube personal o un almacén en la sombra, y la función de gobierno pierde de vista precisamente los datos que quería proteger. Si un control no se puede automatizar, necesita un acuerdo de nivel de servicio; y si no tiene ninguno de los dos, es una cola, no un control.
