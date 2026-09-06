---
term: Linaje de datos
short: El recorrido trazable de un valor desde donde se originó hasta donde se usa, incluyendo cada transformación del camino.
group: metadata
also: Procedencia, flujo de datos, análisis de impacto
related: metadata, data-catalog, single-source-of-truth, data-quality
article: dama-dmbok-data-governance-framework
updated: 2026-09-05
---

El linaje responde a dos preguntas que de otro modo son caras. Hacia arriba: este número parece incorrecto, ¿de dónde viene y qué lo ha tocado? Hacia abajo: vamos a cambiar este campo, ¿qué se rompe? La segunda es el análisis de impacto y, en organizaciones con algo de complejidad en sus pipelines, es la que paga todo el ejercicio: la alternativa es un congelamiento de cambios o un descubrimiento en producción.

**En la práctica.** El linaje merece capturarse con la granularidad sobre la que vas a actuar. El linaje tabla a tabla en los pipelines que sostienen los informes regulatorios suele bastar para responder a ambas preguntas; el linaje a nivel de columna en todo el parque es un proyecto de investigación.

**Dónde se rompe.** El linaje se dibuja a mano en una herramienta de diagramas. Es exacto el día en que se dibuja y está equivocado antes de acabar el sprint, y como parece autoritativo la gente se apoya en él después de que deje de ser cierto. Un linaje que no se deriva de los propios pipelines tiene una caducidad de semanas.
