---
term: Enmascaramiento dinámico de datos
short: Ocultar o transformar valores sensibles en el momento de la consulta según quién pregunta, sin tocar el dato almacenado.
group: ai
also: DDM, enmascaramiento en tiempo de consulta, dynamic data masking
related: sensitive-data, confidential-data, role-based-access-control, data-classification
article: responsible-ai-starts-with-data-governance
updated: 2026-09-07
---

Dos personas ejecutan la misma consulta contra la misma tabla y obtienen respuestas distintas, a propósito. El agente de soporte ve una tarjeta que termina en 4471 y el resto en asteriscos; el analista de fraude la ve completa; el científico de datos ve un hash consistente que sigue permitiendo el cruce pero no identifica a nadie. Nada se copió y nada se destruyó: la política se evalúa mientras corre la consulta. Ahí está la diferencia con el enmascaramiento estático, que produce una copia aparte, permanentemente alterada, para los entornos inferiores.

**En la práctica.** La regla se engancha a la clasificación, no al equipo: una columna etiquetada como personal o sensible hereda una política de enmascaramiento, y los roles reciben el derecho de ver a través de ella. Snowflake, BigQuery, Databricks y SQL Server lo soportan de forma nativa, lo que significa que escribes la política una vez en lugar de mantener una vista a mano por audiencia — y las vistas hechas a mano son la razón por la que una columna sin enmascarar acaba en un tablero que nadie recuerda haber creado.

**Dónde se rompe.** Se trata el enmascaramiento como si fuera todo el control. Un identificador enmascarado junto a una fecha de nacimiento, un código postal y un importe sin enmascarar reidentifica a las personas sin esfuerzo, así que enmascarar sin pensar en lo que revelan las columnas restantes es teatro. El clásico complementario: producción está bien enmascarada y el entorno de pruebas guarda una copia sin enmascarar de hace dos años que puede leer media compañía.
