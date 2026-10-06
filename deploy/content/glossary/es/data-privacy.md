---
term: Privacidad de datos
short: La disciplina de asegurar que los datos personales se recogen, usan y comparten solo para fines que la persona puede esperar y que la ley permite.
group: ai
also: Privacidad de la información, protección de datos, protección de datos personales, privacidad desde el diseño, privacy by design, controles de privacidad
related: personally-identifiable-information, sensitive-data, data-classification, dynamic-data-masking, ai-governance
article: responsible-ai-starts-with-data-governance
updated: 2026-10-06
---

La privacidad trata de la persona que está en los datos, no de la organización que los guarda. La seguridad pregunta si los datos están protegidos de quien no debería verlos. La privacidad pregunta si quien puede verlos debería usarlos para esto. Normas como el RGPD, la LGPD o la CCPA convierten esa pregunta en obligaciones: una base legal, una finalidad declarada, minimización, límites de retención y derechos que la persona puede ejercer.

**En la práctica.** La privacidad se conecta con la clasificación y el acceso. Los campos personales se etiquetan donde se crean, se enmascaran por defecto y se liberan para una finalidad declarada, no para un puesto. El etiquetado por finalidad hace la mayor parte del trabajo: un conjunto de datos recogido para facturación no queda disponible automáticamente para un modelo de abandono, y un conjunto de entrenamiento hereda los límites de consentimiento y finalidad de cada fuente que lo alimentó.

**Dónde se rompe.** La privacidad se gestiona como un documento legal en lugar de como un conjunto de controles. La política dice que los datos solo se usan para fines declarados; nada en el catálogo registra cuáles eran esos fines. Luego un modelo llega a producción y nadie sabe decir si los clientes que contiene consintieron este uso. La política nunca estuvo equivocada. Simplemente no tenía nada debajo.
