---
term: Información personal identificable
short: Datos que identifican a una persona viva, directamente o combinados con otros datos a los que quien los guarda puede acceder.
group: ai
also: PII, datos personales
related: data-classification, data-policy, ai-governance, data-owner
article: responsible-ai-starts-with-data-governance
updated: 2026-09-05
---

La PII es más amplia de lo que suponen la mayoría de los inventarios, porque la identificabilidad es contextual. Un código postal no identifica; un código postal más una fecha de nacimiento más un puesto de trabajo con frecuencia sí. Bajo el RGPD el concepto relevante es dato personal, que cubre cualquier cosa relativa a una persona identificable, incluidos los datos que solo la identifican al cruzarlos con algo más que ya tienes. Por eso "hemos quitado los nombres" no es, por sí solo, anonimización.

**En la práctica.** Encuentra los datos personales trazando la finalidad, no escaneando columnas. Pregunta qué procesos implican a una persona, qué se recogió, qué se le dijo en aquel momento y en qué base se está apoyando la organización. Los escáneres de patrones encuentran direcciones de correo; no encuentran el cruce que vuelve reidentificable un conjunto de datos.

**Dónde se rompe.** Los datos pseudonimizados se tratan como anónimos y se mueven fuera de sus controles originales: a un entorno de analítica, a un sistema de pruebas, a un conjunto de entrenamiento. Los datos pseudonimizados siguen siendo datos personales, porque la clave que los revierte existe. Anónimo significa irreversiblemente anónimo, y muy pocos datos de un parque operativo cumplen ese umbral.
