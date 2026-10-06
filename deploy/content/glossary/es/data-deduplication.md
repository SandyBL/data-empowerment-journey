---
term: Deduplicación de datos
short: Encontrar los registros que describen la misma entidad del mundo real y resolverlos en uno solo, con claves de negocio y reglas de coincidencia acordadas.
group: quality
also: Deduplicación, detección de duplicados, rutinas de deduplicación, resolución de entidades
related: master-data-management, single-source-of-truth, data-profiling, data-quality-dimensions, critical-data-element
article: why-data-quality-is-a-business-imperative
updated: 2026-10-06
---

El mismo cliente aparece tres veces con grafías ligeramente distintas, dos direcciones y un solo correo entre todas. La deduplicación encuentra esos registros, decide cuáles van juntos y los fusiona o los vincula para que el negocio cuente un cliente en lugar de tres. Lo difícil no es el algoritmo de coincidencia; es acordar qué hace que dos registros sean la misma entidad y qué versión de cada atributo sobrevive.

**En la práctica.** Perfila la tasa de duplicados sobre la clave natural de tu conjunto de datos más usado antes de elegir herramienta: el número defiende el caso por sí solo. Acuerda con el dueño de los datos las reglas de coincidencia y de supervivencia, ejecuta la deduplicación como rutina recurrente y no como limpieza puntual, y declara el registro resultante como fuente de la verdad. Es una de las victorias tempranas más fiables de un programa de gobierno porque es visible y medible.

**Dónde se rompe.** Un proyecto de limpieza deduplica la base de clientes, todos lo celebran y los sistemas de origen siguen creando duplicados al mismo ritmo. Seis meses después la cifra ha vuelto. La deduplicación solo se mantiene gracias a la decisión de gobierno que la sigue: una fuente autorizada y un proceso en el punto de entrada que compruebe antes de crear.
