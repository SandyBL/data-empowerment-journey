---
term: Marketplace interno de datos
short: El sitio dentro de la compañía donde los equipos exploran productos de datos publicados, piden acceso y lo consiguen, con dueño, contrato y nivel de servicio en cada ficha.
group: architecture
also: Marketplace de datos, mercado interno de datos, tienda de datos
related: data-product, data-catalog, data-contract, external-data-marketplace
article: building-a-data-governance-operating-model
updated: 2026-09-07
---

Un catálogo te dice que el dato existe. Un marketplace te lo entrega. La diferencia es la caja: una ficha que puedes solicitar, una aprobación que llega a la persona responsable y un acceso que aparece en horas y no después de un trimestre de correos. Importa porque la alternativa no es "la gente espera": es que un analista que no consigue el dataset certificado en un plazo razonable lo reconstruye mal desde un extracto de origen, y ahora la compañía tiene dos versiones de los ingresos.

**En la práctica.** Cada ficha es un producto de datos, no una tabla: tiene dueño, una descripción en lenguaje de negocio, un contrato que cubre esquema y frescura, una puntuación de calidad visible, cifras de uso y de coste, y un flujo de solicitud que termina en un rol concedido y no en un ticket. Quien consume puede ver quién más lo usa y qué cambió el mes pasado. La medida de si funciona es el tiempo medio entre la solicitud y el acceso, y si ese número está en los objetivos de alguien.

**Dónde se rompe.** El marketplace se lanza volcando dentro el almacén completo —diez mil tablas, sin dueños, sin contratos— y se convierte en un buscador más lento. O el escaparate es real pero la solicitud cae en una cola sin nivel de servicio, lo que enseña a todo el mundo que el atajo es más rápido. Un marketplace con cincuenta productos de verdad gobernados vale más que uno con todo y nadie detrás.
