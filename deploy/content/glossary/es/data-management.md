---
term: Gestión de datos
short: El trabajo de construir y operar los sistemas, procesos y controles que sostienen los datos durante todo su ciclo de vida.
group: foundations
also: Gestión de datos empresarial, EDM
related: data-governance, master-data-management, dama-dmbok
article: data-governance-vs-data-management
updated: 2026-09-05
---

La gestión de datos es el trabajo de ejecución: modelar, integrar, almacenar, proteger, mover, archivar y finalmente eliminar datos. Es lo que hacen los ingenieros de datos, los DBA, los arquitectos y los analistas. El gobierno decide las reglas; la gestión construye y opera dentro de ellas. El DAMA-DMBOK coloca el gobierno como el eje central de once disciplinas de gestión precisamente para evitar que se confundan.

**En la práctica.** La diferencia se ve mejor en una sola petición. "El correo del cliente nunca debe estar vacío" es una decisión de gobierno: alguien con autoridad sobre el dominio de cliente la declaró. Añadir la restricción NOT NULL, corregir las 40.000 filas que la incumplen y vigilar los nuevos incumplimientos es gestión de datos.

**Dónde se rompe.** Las organizaciones contratan gestión de datos y la llaman gobierno. La plataforma se construye, los pipelines corren, y nadie ha decidido qué significan los números, así que el mismo campo se carga de tres formas para tres consumidores que creían cada uno que la suya era la definición. El fallo inverso es más silencioso e igual de frecuente: una función de gobierno que produce políticas que ningún equipo de ingeniería tuvo nunca presupuesto para implementar.
