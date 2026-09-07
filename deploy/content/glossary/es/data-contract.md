---
term: Contrato de datos
short: Un acuerdo explícito y versionado entre quien produce un dato y quien lo consume, sobre esquema, significado, frescura, calidad y aviso de cambios.
group: architecture
also: Acuerdo de intercambio de datos, contrato de interfaz, data contract
related: data-product, data-quality-rule, internal-data-marketplace, data-subdomain
article: building-a-data-governance-operating-model
updated: 2026-09-07
---

La mayoría de los incidentes de datos no son corrupción: son sorpresa. Un ingeniero renombra una columna, endurece un tipo, cambia lo que significa "cancelado" o pasa una carga nocturna a horaria —todos cambios razonables— y once tableros y dos modelos aguas abajo se rompen o, peor, siguen funcionando y reportan silenciosamente otra cosa. Un contrato de datos hace explícita la promesa para que el cambio sea una negociación y no una caída: este es el esquema, esto significa cada campo, esta es la frescura, estos son los umbrales de calidad, este es el dueño y este es el aviso que recibirás antes de que algo de esto cambie.

**En la práctica.** El contrato vive con el código del productor, en control de versiones, y se prueba. Un cambio incompatible rompe el pipeline del productor antes de desplegarse, que es justamente el objetivo: el coste del cambio recae en el equipo que lo hace y no en quien lo descubra primero. Quien consume se registra contra el contrato, así que el productor ve a quién rompería y una deprecación pasa a ser una fecha y una ruta de migración en lugar de un anuncio. En una ficha de marketplace, el contrato es lo que convierte una tabla en algo sobre lo que otro equipo puede construir.

**Dónde se rompe.** El contrato es una página en la wiki. Nada lo comprueba, se desvía en un mes y acaba documentando cómo se comportaba el dato antes. El otro fallo es prometer de más: frescura o completitud que el productor no puede garantizar, así que el contrato se incumple constantemente y todo el mundo deja de leer las alertas.
