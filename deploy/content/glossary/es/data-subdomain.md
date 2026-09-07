---
term: Subdominio de datos
short: Una porción dentro de un dominio de datos con su propio steward, su propio vocabulario y sus propios elementos de datos críticos.
group: architecture
also: Subdominio, subárea temática
related: data-domain, data-product, data-owner, data-contract
article: building-a-data-governance-operating-model
updated: 2026-09-07
---

Un dominio es donde vive la responsabilidad; un subdominio es donde el trabajo cabe de verdad en la cabeza de alguien. Cliente es un dominio, y es demasiado grande para un solo glosario: prospectos, consentimiento y preferencias, reclamaciones, situación crediticia y fidelización tienen definiciones distintas de "activo", reglas distintas, sistemas distintos y personas distintas a las que les importa. Partir Cliente en subdominios permite gobernar bien cada una de esas piezas sin inventar cinco dominios nuevos y cinco dueños nuevos en el organigrama.

**En la práctica.** Sabes que necesitas uno cuando un único steward no puede responder preguntas de todo el dominio, o cuando la misma palabra necesita dos definiciones dentro de él. Un subdominio tiene un steward con nombre, sus propias entradas en el glosario de negocio, sus propios elementos críticos y reglas de calidad, y suele ser la unidad desde la que realmente se construyen y publican los productos de datos. El dueño del dominio sigue respondiendo por el conjunto; el steward del subdominio opera una parte.

**Dónde se rompe.** Subdividir hasta que el catálogo es una copia de la estructura de reporte. Cincuenta subdominios son cincuenta glosarios medio mantenidos, y la reorganización del año que viene los invalida todos. Divide cuando una definición o un dueño te obliguen, no para que el diagrama parezca completo.
