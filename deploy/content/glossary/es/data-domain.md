---
term: Dominio de datos
short: Un área temática delimitada de datos —cliente, producto, empleado, contrato— de la que un único dueño puede responder razonablemente.
group: architecture
also: Área temática, dominio de información
related: data-subdomain, data-owner, data-product, data-governance-operating-model
article: building-a-data-governance-operating-model
updated: 2026-09-07
---

Un dominio es la forma de partir el gobierno en trozos lo bastante pequeños para tener dueño. Cliente, producto, proveedor, empleado, finanzas, contrato: cada uno es un cuerpo de datos con sus propias definiciones, sus propios sistemas de registro, su propia exposición regulatoria y su propio dueño natural en algún lugar del negocio. Los dominios son la unidad sobre la que se construye casi todo modelo operativo, porque "quién es dueño de los datos" es una pregunta sin respuesta y "quién es dueño de los datos de cliente" no lo es.

**En la práctica.** Los buenos dominios siguen al negocio, no al organigrama ni a la base de datos. Son pocos —entre ocho y quince a escala empresarial— y cada uno tiene exactamente un dueño responsable, un sistema de registro y una lista de elementos de datos críticos. La prueba de un límite es si un campo en disputa tiene un hogar evidente.

**Dónde se rompe.** Los dominios se dibujan alrededor de los sistemas, así que "datos de Salesforce" se convierte en dominio y el registro de cliente que también vive en facturación y en soporte tiene tres dueños y ninguno. También se dibujan demasiado pequeños: cuarenta dominios significan cuarenta dueños, lo que significa que nadie responde de verdad y que el consejo no cabe en una sala.
