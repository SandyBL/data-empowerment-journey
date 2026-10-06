---
term: Pipeline de datos
short: Una secuencia automatizada de pasos que mueve los datos desde donde se producen hasta donde se usan, transformándolos por el camino.
group: architecture
also: pipeline ETL, pipeline ELT, pipeline de integración, pipeline de transformación
match: Pipelines de datos, pipelines ETL, pipelines ELT, pipelines de integración, pipelines de transformación
related: data-validation, data-observability, data-lineage, data-contract, data-quality-rule
article: when-good-data-goes-bad-end-to-end-data-quality
updated: 2026-10-06
---

Un pipeline es la fontanería entre un sistema de origen y un informe, un modelo u otro sistema: ingerir, validar, transformar, cargar y repetir según un calendario. Construir y operar pipelines es trabajo de gestión de datos. El gobierno de datos no los escribe, pero decide lo que deben respetar: qué fuente es la autoritativa, qué campos están clasificados, qué tolerancia de calidad aplica y a quién hay que avisar cuando algo cambia aguas arriba.

**En la práctica.** El fallo peligroso casi nunca es la caída. Un pipeline que se detiene lanza una alerta y alguien lo arregla antes de comer. El que sigue funcionando con un nulo donde no toca o un código de moneda equivocado convierte en silencio un registro malo en un agregado malo y después en una decisión mala. Los controles van en cada etapa crítica, no solo al final, y un control fallido sobre datos críticos debería detener la ejecución o mandar los registros a cuarentena, no dejarlos pasar con un aviso.

**Dónde se rompe.** Cada equipo construye su propio pipeline desde la misma fuente, cada uno con una lógica ligeramente distinta, y nadie es dueño de las diferencias. Luego cambia un esquema aguas arriba sin previo aviso, la mitad de los pipelines se rompen sin ruido y la discrepancia la descubre un auditor. Arreglar el pipeline es gestión. Decidir a quién hay que avisar antes de cambiar el esquema es gobierno.
