---
term: Observabilidad de datos
short: Monitorización continua y automatizada de los propios datos — volumen, frescura, esquema y distribución — para que los fallos silenciosos salgan a la luz antes de que los encuentre un consumidor.
group: quality
also: Observabilidad, observabilidad continua, observabilidad automatizada, monitorización de pipelines, monitorización continua de datos
related: data-validation, data-lineage, data-quality-sla, root-cause-analysis, data-pipeline
article: when-good-data-goes-bad-end-to-end-data-quality
updated: 2026-10-06
---

Un pipeline que se cae lanza una alerta. Los fallos caros son los que no: una tabla que carga la mitad de sus filas habituales, una fuente que deja de actualizarse, una columna de origen que cambia de tipo sin aviso. La observabilidad vigila esas señales de forma continua — recuento de filas, frescura frente al calendario, deriva de esquema, valores que se salen de su rango habitual — y avisa a alguien cuando los datos se comportan distinto de sí mismos.

**En la práctica.** Monitoriza primero las tablas detrás de las decisiones que importan y dirige cada alerta a un steward con nombre, no a un canal compartido. Combínala con el linaje, para que una alerta en una tabla de origen muestre de inmediato qué paneles y modelos dependen de ella. La observabilidad es buena diciendo que algo cambió; decidir si el cambio es un problema sigue siendo trabajo de alguien que conoce el negocio.

**Dónde se rompe.** Se activa una herramienta sobre todo el almacén, aprende miles de líneas base y salta con cada pico de cierre de mes y cada bajón de festivo. El equipo la silencia en semanas. El otro fallo es tratar la observabilidad como sustituta de la validación: detecta los datos malos después de que han llegado, lo cual es útil, pero no impide que entren.
