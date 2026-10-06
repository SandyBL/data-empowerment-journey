---
term: Umbral de calidad de datos
short: La línea, fijada por el negocio, a partir de la cual una medición de calidad deja de ser aceptable y alguien tiene que actuar.
group: quality
also: umbral de calidad, umbral de error, umbral de error aceptable
match: Umbrales de calidad de datos, umbrales de calidad, umbrales de error aceptables
related: data-quality-rule, data-quality-sla, critical-data-element, data-owner, data-quality-dimensions
article: why-data-quality-is-a-business-imperative
updated: 2026-10-06
---

Un umbral es el número que convierte una medición en una decisión. Una completitud del 97 % no significa nada por sí sola; una completitud por debajo del 98 % en la dirección de facturación, que bloquea la emisión de facturas, significa que el steward recibe un ticket. Lo fija el dueño de los datos, porque solo el negocio sabe cuánto error puede absorber un proceso antes de costar dinero. Ingeniería lo aplica y el steward gestiona lo que queda por debajo.

**En la práctica.** Fija umbrales por uso, no por campo en abstracto, y parte de la consecuencia: qué se rompe aguas abajo y a partir de qué tasa empieza a doler. Pon el umbral donde ya ocurre el trabajo — en la definición de "terminado" de un pipeline, en los criterios de lanzamiento — para que se compruebe cada vez y no se revise una vez al trimestre. Deja escrito por qué se eligió cada número; el motivo es lo que permite cambiarlo después sin pelea.

**Dónde se rompe.** Los umbrales se copian del valor por defecto de un proveedor o se fijan en el 100 % porque cualquier cosa menor suena a aceptar datos malos. Un umbral del 100 % salta constantemente, se silencia y no protege nada. El fallo contrario es un umbral tan holgado que nunca salta, lo que en el panel parece buena calidad y no lo es.
