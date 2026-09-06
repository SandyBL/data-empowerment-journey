---
term: Estándar de datos
short: La regla concreta y verificable que dice cómo se satisface una política: formato, valores permitidos, nomenclatura, tolerancia.
group: foundations
also: Estándar de nomenclatura, especificación de datos
related: data-policy, data-quality-rule, business-glossary
article: introduction-basics-data-governance-program
updated: 2026-09-05
---

Si una política dice "los datos de contacto del cliente deben ser utilizables", el estándar dice qué significa utilizable: el correo cumple un formato válido, el código de país es ISO 3166-1 alfa-2, el teléfono se almacena en E.164, la dirección se valida contra el fichero postal de referencia. Un estándar se escribe para que lo compruebe una máquina. Ahí está la diferencia con una política: una política es un compromiso, un estándar es una especificación.

**En la práctica.** Los estándares son el punto donde el gobierno deja de ser abstracto, porque cada uno puede convertirse en una regla de calidad con un umbral y un panel. La secuencia útil es corta: nombra el elemento de datos crítico, escribe su estándar, impleméntalo como regla, informa de la tasa de incumplimiento.

**Dónde se rompe.** Se escriben estándares para todo en lugar de para lo que importa, lo que produce un documento que nadie puede implementar y un backlog que nadie va a financiar. Veinte estándares que cubren los campos que aparecen en el reporting regulatorio y en los paneles de dirección valen más que doscientos que cubren cada columna del almacén.
