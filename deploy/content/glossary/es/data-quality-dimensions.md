---
term: Dimensiones de calidad de datos
short: Los ejes estándar por los que los datos pueden fallar: completitud, exactitud, consistencia, oportunidad, validez y unicidad.
group: quality
also: Características de calidad
related: data-quality, data-quality-rule, data-profiling, critical-data-element
article: identifying-addressing-data-pain-points
updated: 2026-09-05
---

Las dimensiones existen para que "los datos están mal" pase a ser un diagnóstico. La completitud es si el valor está. La validez es si cumple su formato. La exactitud es si coincide con la realidad, la única dimensión que normalmente necesita una persona o una referencia externa para comprobarse. La consistencia es si el mismo hecho concuerda entre sistemas. La oportunidad es si llegó a tiempo para ser útil. La unicidad es si la entidad aparece una sola vez.

**En la práctica.** La mayoría de los problemas reales son de validez, completitud y consistencia, en ese orden, porque son las tres que un sistema puede generar en silencio. Nombrar la dimensión te dice dónde va el arreglo: la validez suele ser un control de entrada, la consistencia suele ser una integración, la oportunidad suele ser una planificación.

**Dónde se rompe.** La exactitud se mide con una regla, y no puede medirse así. Un código postal que pasa la validación de formato y pertenece a otra ciudad es válido y equivocado. Comprobar la exactitud implica comparar contra algo autoritativo y, si no existe esa fuente, dilo en lugar de informar de un 98 %.
