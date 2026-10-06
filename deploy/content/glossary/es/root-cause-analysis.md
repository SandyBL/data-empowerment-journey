---
term: Análisis de causa raíz
short: Seguir un defecto de datos más allá del síntoma hasta el proceso, sistema o decisión que lo produce, para que la corrección impida que vuelva.
group: quality
also: causa raíz, RCA, los 5 porqués, cinco porqués
match: Análisis de causas raíz, causas raíz
related: dmaic, data-quality, data-quality-rule, data-profiling, data-lineage
article: identifying-addressing-data-pain-points
updated: 2026-10-06
---

Un campo roto es un síntoma. La causa casi siempre está aguas arriba de la base de datos: un formulario que acepta texto libre, un traspaso entre equipos que nadie tiene asignado, una integración que trunca en silencio, un objetivo que premia rellenar cualquier cosa para cerrar el ticket. El análisis de causa raíz es la disciplina de preguntar por qué hasta llegar a algo que una persona o un cambio de proceso pueda corregir. Los 5 porqués son la herramienta habitual y el linaje es el mapa que se sigue. Es el paso Analizar de DMAIC, y el que convierte una limpieza en una mejora.

**En la práctica.** Empieza por los escalados, no por un marco. Saca un año de incidentes, tickets y hallazgos de auditoría y clasifícalos por causa; la mayoría de las organizaciones descubre que cuatro o cinco causas explican la mayor parte, y que al menos una se repite desde hace años sin dueño. Cada causa confirmada debería acabar en dos cosas: una corrección donde nace el defecto y una regla de calidad de datos que detecte la siguiente vez.

**Dónde se rompe.** El análisis se detiene en la primera respuesta técnica —"falló el proceso de ETL"—, que es donde la culpa es más fácil de colocar y menos útil. O dura un trimestre, produce un diagrama de causa y efecto precioso y no cambia ningún sistema. Un análisis que no cambia un proceso solo ha documentado el problema con más detalle.
