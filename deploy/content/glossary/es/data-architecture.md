---
term: Arquitectura de datos
short: El diseño de cómo se estructuran, almacenan, mueven e integran los datos entre sistemas, construido sobre los límites y estándares que decide el gobierno.
group: architecture
also: Arquitectura de datos empresarial
match: arquitecturas de datos
related: data-governance, data-management, data-domain, single-source-of-truth, data-standard
article: dama-dmbok-data-governance-framework
updated: 2026-10-06
---

La arquitectura de datos es el plano del patrimonio de datos: los modelos, los patrones de integración, las plataformas y los caminos que recorren los datos entre ellas. En el DMBOK es una de las áreas de conocimiento alrededor del núcleo del gobierno, y el reparto es limpio. El gobierno aporta los límites de los dominios, la fuente autoritativa de cada entidad y los estándares. La arquitectura convierte esas decisiones en modelos y diseño de plataforma. Es trabajo de gestión de datos, no de gobierno, pero es donde las decisiones de gobierno se vuelven físicas.

**En la práctica.** Las preguntas de arquitectura que más importan al gobierno rara vez son tecnológicas. ¿Qué sistema es la fuente autoritativa para cliente? ¿Dónde termina un dominio? ¿Qué estándar tiene que cumplir un pipeline nuevo antes de salir a producción? Si esas respuestas existen y están escritas, los arquitectos eligen bien y rápido. Si no, toman ellos las decisiones de gobierno, de forma implícita, una integración cada vez.

**Dónde se rompe.** Años de decisiones locales razonables producen un patrimonio fragmentado: mainframes heredados, un lakehouse en la nube y una docena de herramientas SaaS, cada una con su propia definición solapada de la misma entidad. Nadie diseñó el desorden. Cada pieza tenía sentido cuando se añadió, y ninguna decisión cubrió nunca cómo encajaban. Una migración de plataforma no lo arregla, porque las definiciones viajan con los datos.
