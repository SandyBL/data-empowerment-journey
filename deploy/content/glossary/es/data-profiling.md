---
term: Perfilado de datos
short: Examinar los datos reales para saber qué contienen de verdad: distribuciones de valores, tasas de nulos, formatos, atípicos y relaciones.
group: quality
also: Profiling, evaluación de datos
related: data-quality, data-quality-rule, metadata, critical-data-element
article: identifying-addressing-data-pain-points
updated: 2026-09-05
---

El perfilado es cómo descubres que el campo de país contiene 47 formas distintas de escribir "Reino Unido", que el 8 % de las fechas de nacimiento es 01/01/1900 y que una columna documentada como obligatoria está vacía en un tercio de las filas. Es el diagnóstico más barato del trabajo con datos y el que más se salta, porque produce hechos incómodos antes de que un proyecto haya acordado su alcance.

**En la práctica.** Perfila antes de prometer. Medio día de perfilado sobre las tablas que sostienen un panel propuesto te dirá si ese panel es un trabajo de dos semanas o de dos trimestres, y eso es lo más útil que puedes saber al principio.

**Dónde se rompe.** El resultado del perfilado se presenta en crudo. Nadie fuera del equipo de datos tiene una opinión sobre un informe de cardinalidad. Tradúcelo: "la tabla de clientes tiene 14.000 registros duplicados, y por eso la tasa de churn del informe de dirección está sobrestimada en unos cuatro puntos". El mismo hallazgo, otra consecuencia.
