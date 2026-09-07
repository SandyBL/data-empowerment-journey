---
term: Ingesta activa de metadatos
short: Capturar metadatos a medida que ocurren los eventos —en tiempo real, desde los propios sistemas— y devolverlos a las herramientas donde la gente trabaja.
group: metadata
also: Metadatos activos, captura de metadatos por eventos, ingesta de metadatos en tiempo real
related: metadata, data-catalog, data-lineage, data-quality-rule
article: introduction-basics-data-governance-program
updated: 2026-09-07
---

La mayoría de los catálogos se diseñaron para ser rastreados: un escaneo corre el domingo por la noche y el miércoles el catálogo describe un almacén que ya no existe. La ingesta activa invierte eso. Cada ejecución de un pipeline, cada cambio de esquema, cada permiso concedido, cada prueba fallida y cada consulta a una tabla emiten un evento, y la plataforma de metadatos escucha en lugar de preguntar. Lo valioso no es tener documentación más fresca: es que un metadato que llega en segundos se puede accionar automáticamente, algo que el metadato pasivo nunca permitió.

**En la práctica.** Los conectores se suscriben a lo que la plataforma ya emite: logs de consultas, eventos del orquestador, flujos de CDC, ejecuciones de CI, cambios de IAM. El linaje se recalcula en cada ejecución en vez de deducirse del SQL una vez por trimestre, el uso y el coste salen del consumo real, y el bucle se cierra del lado operativo: una regla de calidad que falla abre un ticket al dueño con nombre, un cambio de esquema incompatible rompe la build del productor, una tabla sin uso aparece en su lista de baja y una columna nueva con pinta de dato personal se marca antes de que alguien la consulte.

**Dónde se rompe.** Se construye el flujo y no el bucle. Millones de eventos entran en un catálogo que nadie abre y la única diferencia con el escaneo semanal es la factura. La prueba es sencilla: ¿algún evento de metadatos cambia algo fuera del catálogo —una alerta, una revisión de accesos, un despliegue bloqueado? Si no, esto es un proyecto de documentación muy caro.
