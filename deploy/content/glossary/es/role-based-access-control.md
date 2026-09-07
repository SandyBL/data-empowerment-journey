---
term: Control de acceso basado en roles
short: Conceder acceso a roles que describen un puesto y meter a las personas en roles, para que los permisos se revisen y se retiren en bloque y no uno a uno.
group: ai
also: RBAC, permisos basados en roles
related: dynamic-data-masking, sensitive-data, confidential-data, data-owner
article: responsible-ai-starts-with-data-governance
updated: 2026-09-07
---

RBAC es una idea de gobierno antes que una técnica. Los permisos se asocian a un rol —tramitador de siniestros, analista de riesgos, analista de marketing—, el dueño de los datos aprueba qué puede ver ese rol, y una persona obtiene el acceso al entrar en él. La ganancia no son menos clics: es que la pregunta cambia de "¿por qué Marta tiene esto?" a "¿debería un analista de riesgos ver esto?", que es una pregunta que alguien puede responder de verdad, y responder una sola vez para todos.

**En la práctica.** Los roles se nombran por el puesto, nunca por la persona ni por el proyecto. El dueño de los datos aprueba su alcance, y el acceso se engancha al ciclo de vida de RR. HH.: quien entra hereda su rol, quien se mueve pierde el anterior el mismo día, y quien sale se corta automáticamente. Las columnas sensibles siguen detrás de una política de enmascaramiento incluso dentro de un rol aprobado, y cada rol se recertifica con una periodicidad fija por el dueño que lo concedió — la recertificación es la parte por la que todo el mundo compra la herramienta y que nadie ejecuta.

**Dónde se rompe.** La explosión de roles. Cada excepción crea un rol nuevo y, dos años después, hay más roles que empleados y nadie sabe qué significa ninguno, que es lo mismo que no tener modelo. El segundo fallo son los movimientos internos: las altas y las bajas se gestionan, pero quien ha cambiado de puesto tres veces conserva la suma de todo lo que necesitó alguna vez. Cuando los roles ya no alcanzan a expresar la regla, la respuesta suele ser añadir atributos —región, propósito, clasificación— encima, no otros cien roles.
