---
term: Validación de datos
short: Comprobaciones automatizadas que confirman que los datos cumplen la estructura, el formato y las reglas de negocio esperados antes de dejarlos avanzar por el pipeline.
group: quality
also: Validaciones de datos, validación automatizada, validaciones automatizadas, controles de validación, validación de esquemas, validaciones de calidad
related: data-quality-rule, data-pipeline, data-observability, data-contract, data-profiling
article: when-good-data-goes-bad-end-to-end-data-quality
updated: 2026-10-06
---

La validación es la puerta. En la ingesta aplica el esquema, rechaza importes de transacción negativos y correos mal formados, y comprueba que las claves obligatorias estén informadas. Durante la transformación comprueba que una devolución tenga su compra correspondiente y que los totales cuadren entre origen y destino. Los registros que fallan se rechazan o se ponen en cuarentena en lugar de seguir adelante, porque el sitio más barato para corregir datos malos es antes de que se haya construido nada encima.

**En la práctica.** Pon los primeros controles donde hoy entran datos sin validar: la ingesta por API y las cargas manuales de ficheros son los sospechosos habituales. Empieza ligero — esquema, completitud, unos pocos controles de rango en las tablas prioritarias — y añade validación de reglas de negocio donde los incidentes demuestren que hace falta. Un control que falla debería detener la carga o enviar los registros a una tabla de cuarentena, y alguien debería ser dueño de lo que cae ahí.

**Dónde se rompe.** Los controles registran los fallos y dejan pasar todo, así que la validación se convierte en un informe de lo que salió mal ayer. O la tabla de cuarentena existe y nadie la mira, que es solo una forma más lenta de perder registros. Validar sin decidir qué pasa cuando algo falla es monitorización con pasos extra.
