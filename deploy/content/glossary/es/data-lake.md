---
term: Data lake
short: Un repositorio central que guarda grandes volúmenes de datos en bruto, en su formato original, para que quien los use los estructure después.
group: architecture
also: lago de datos, data lakehouse, lakehouse, pantano de datos, data swamp
match: lagos de datos, Data lakes, lakehouses
related: data-architecture, data-catalog, metadata, data-owner, data-quality
article: evolution-of-data-why-data-governance-now
updated: 2026-10-06
---

Un data lake admite casi cualquier cosa: exportaciones de aplicaciones, logs, datos de IoT, extracciones de herramientas SaaS, ficheros que nadie recuerda haber pedido. A diferencia de un data warehouse, no exige un esquema por adelantado, lo que lo hace barato de llenar y flexible de usar. Un lakehouse añade tablas y controles de estilo warehouse sobre el mismo almacenamiento. En ambos casos, el lake resuelve un problema de almacenamiento. Por sí solo no resuelve ningún problema de significado, propiedad o confianza.

**En la práctica.** Un lake gobernado es aburrido. Cada zona o conjunto de datos tiene un dueño con nombre, una clasificación y una entrada en el catálogo. Los datos en bruto recién aterrizados se separan de los datos curados sobre los que se permite informar, y la diferencia es visible para quien navega. Las columnas sensibles se enmascaran por defecto, no después de la primera queja.

**Dónde se rompe.** La ingesta funciona sin gestión y todo entra, porque es fácil. En un par de años el lake contiene registros duplicados, tres versiones de la tabla de clientes y una factura de almacenamiento que nadie sabe explicar, y los analistas vuelven sin ruido a sus hojas de cálculo. Eso es el pantano de datos, y es un resultado de gobierno, no de tecnología: nadie decidió qué debía estar ahí ni quién respondía por ello.
