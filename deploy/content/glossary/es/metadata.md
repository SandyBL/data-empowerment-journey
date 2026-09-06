---
term: Metadatos
short: La capa descriptiva que rodea a un activo de datos: qué significa, de dónde viene, quién es su dueño y cómo puede usarse.
group: metadata
also: Datos sobre los datos
related: data-catalog, business-glossary, data-lineage, data-standard
article: introduction-basics-data-governance-program
updated: 2026-09-05
---

Los metadatos suelen dividirse en tres. Los metadatos de negocio son significado: la definición de "cliente activo", el dueño, la clasificación de sensibilidad. Los metadatos técnicos son estructura: tabla, columna, tipo, nulabilidad, el proceso que la carga. Los metadatos operativos son comportamiento: cuándo se ejecutó la última carga, cuántas filas llegaron, cuántas fallaron la validación. Un programa de gobierno necesita los tres, pero solo tiene presupuesto para empezar por uno.

**En la práctica.** Empieza por los metadatos de negocio de los datos que ya aparecen en decisiones, porque ahí es donde duele su ausencia: un analista que no puede distinguir cuál de dos columnas de ingresos es la que se reporta pierde una hora a la semana en algo que una frase resolvería.

**Dónde se rompe.** Se recolectan metadatos en masa porque una herramienta puede hacerlo automáticamente, y el resultado es un catálogo con 40.000 entradas técnicas sin significado asociado. La recolección automática es la mitad barata. La mitad cara es que una persona decida qué significa cada cosa, y ninguna herramienta ha hecho nunca esa parte.
