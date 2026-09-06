---
term: Producto de datos
short: Un conjunto de datos curado, documentado y con dueño, construido y mantenido para consumidores conocidos y con un nivel de servicio asociado.
group: architecture
also: Datos como producto
related: data-domain, data-owner, data-catalog, single-source-of-truth
article: building-a-data-governance-operating-model
updated: 2026-09-05
---

Tratar los datos como un producto significa que alguien responde de que sus consumidores estén satisfechos, no solo de que el pipeline se ejecute. Eso implica documentación, una interfaz estable, una frecuencia de actualización declarada, garantías de calidad, una vía para reportar problemas y un plan para cambiarlo sin romper a quien está más abajo. Es la misma disciplina que un equipo de software aplica a una API, aplicada a una tabla.

**En la práctica.** Un producto de datos solo es un producto si tiene consumidores con nombre. Dos equipos que dependen de él, con una actualización acordada y una vía para quejarse, es suficiente. Sin consumidores tienes un conjunto de datos con papeleo extra.

**Dónde se rompe.** Todas las tablas existentes se reetiquetan como productos de datos sin ningún cambio en propiedad, documentación o compromiso. Renombrar no crea responsabilidad. La prueba es simple e implacable: si la carga falla un domingo, ¿hay alguien que no sea el equipo de plataforma que lo sepa, le importe y tenga una obligación declarada de responder?
