---
term: Regla de calidad de datos
short: Una prueba ejecutable sobre los datos, con un umbral definido y una persona responsable que actúa cuando falla.
group: quality
also: Control de calidad, regla de validación
related: data-quality, data-standard, data-quality-dimensions, critical-data-element
article: identifying-addressing-data-pain-points
updated: 2026-09-05
---

Una regla tiene cuatro partes: los datos a los que aplica, la condición que afirma, el umbral a partir del cual el resultado cuenta como fallo y la persona que hace algo al respecto. Sin el umbral, cada regla está siempre en verde o siempre en rojo. Sin responsable, una regla que falla es una notificación que nadie ha aceptado recibir, lo que en un mes es una carpeta de correo filtrada.

**En la práctica.** Las reglas que merece la pena escribir vienen de incidentes. Algo salió mal, alguien investigó, la causa fue una condición de los datos: codifica esa condición como regla para que la próxima vez se detecte antes de la consecuencia. Un backlog de reglas derivadas de incidentes reales tiene una credibilidad que un conjunto generado nunca tiene.

**Dónde se rompe.** Las reglas se generan automáticamente a partir del profiling y se activan en bloque. El resultado son miles de alertas, la mayoría describiendo condiciones perfectamente normales en ese negocio, y el equipo deja de leer todas. La fatiga de alertas no es un problema de ajuste, es una decisión de diseño tomada demasiado pronto.
