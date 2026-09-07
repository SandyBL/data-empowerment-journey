---
title: Introducción a las bases de un programa de gobierno de datos
date: 2026-09-01
updated: 2026-09-05
category: data-governance
summary: Aprende los 6 bloques fundacionales necesarios para lanzar un programa
  de gobierno de datos pragmático que convierta datos crudos en un activo
  empresarial fiable.
author: Sandy Bradbury
translation_key: introduction-basics-data-governance-program
---

La mayoría de quienes me preguntan cómo arrancar un programa de gobierno de datos ya han leído lo suficiente para estar intimidados. Han visto la rueda del [DMBOK](/es/glossary/dama-dmbok/) con sus once áreas de conocimiento, un modelo de madurez con cinco niveles y cuarenta subdimensiones, y una presentación comercial que promete un tejido de datos corporativo. Nada de eso está mal. Todo eso es el sitio equivocado para empezar.

Un primer programa de gobierno es pequeño. Consiste en seis fundamentos, ninguno de los cuales exige una plataforma, y puede levantarlo una persona decidida con respaldo directivo y unas pocas horas semanales de los cinco colegas adecuados. Lo que sigue son esos seis fundamentos, el orden en que yo los construiría y qué dejar deliberadamente para el segundo año.

## 1. Tratar el dato como un activo, y que signifique algo

"El dato es un activo" es la frase más repetida de este campo y normalmente la más vacía. Se vuelve real solo cuando cambia una decisión, así que aquí está la prueba: un activo tiene propietario, un valor registrado, un coste de mantenimiento y un ciclo de vida que termina.

Aplicado al dato, eso significa que alguien responde por cada conjunto de datos significativo. Significa que puedes decir aproximadamente cuánto vale para el negocio y cuánto te cuesta cuando está mal; si nunca le has puesto una cifra, la [calculadora del coste de los datos malos](/es/calculator/) es una estimación inicial defendible. Y significa que el dato se retira: se archiva o se borra cuando ya no sirve a un propósito, en lugar de acumularse en almacenamiento para siempre porque borrar da miedo.

Si tu organización puede responder "quién es el dueño, cuánto vale, cuánto nos cuesta, cuándo desaparece" para sus diez conjuntos principales, trata el dato como un activo. Si no puede, el eslogan es decoración.

## 2. Organizar el dato en dominios

Gobernar "todos los datos de la empresa" no es un alcance; es un deseo. Corta el patrimonio en [dominios de datos](/es/glossary/data-domain/) —áreas coherentes con un propietario natural en el negocio— y gobiérnalos de uno en uno.

Hay tres cortes habituales, y la mayoría de las organizaciones acaba usando una mezcla:

| Tipo de dominio | Principio organizador | Ejemplos |
| :--- | :--- | :--- |
| Función de negocio | Quién produce y usa el dato | Finanzas, RRHH, Marketing, Operaciones |
| Datos maestros | Entidades compartidas entre funciones | Cliente, Producto, Proveedor, Empleado |
| Proceso | Flujos operativos de extremo a extremo | Pedido a cobro, Compra a pago, Alta de empleado |

La guía práctica es mantener el número bajo al principio —cinco a ocho dominios, no treinta— y definir cada uno por las entidades que contiene y no por los sistemas que las guardan. Un dominio definido por un sistema queda obsoleto en el momento en que migras.

Después elige dos para empezar. Coge los que más aparecen en tus escalados, no los más fáciles.

## 3. Definir roles, y nombrar personas reales

Tres roles sostienen un primer programa.

Los **[propietarios de datos](/es/glossary/data-owner/)** responden por un dominio: aprueban definiciones, aceptan riesgo de calidad y deciden accesos. Necesitan rango suficiente para que sus decisiones se sostengan y cercanía suficiente al negocio para saber qué significa el dato. Una persona, no un comité.

Los **[custodios de datos](/es/glossary/data-steward/)** hacen el trabajo: mantener definiciones, investigar problemas de calidad, coordinar correcciones, responder qué significa un campo. Aquí se van la mayoría de las horas reales, y es el rol que los programas olvidan dotar con más frecuencia. Un propietario sin custodio es una persona responsable sin capacidad de actuar.

Una **pequeña función coordinadora** —una persona basta al principio— guarda los estándares, dirige el foro, persigue los seguimientos y publica las medidas.

Lo más útil que puedes hacer en la primera semana es convertir cada rol de tu diagrama en un nombre. Los roles que nadie ocupa son la razón más común por la que un programa de gobierno parece completo en papel y no produce nada.

Una cosa más sobre nombrar personas: consigue que su responsable acepte por escrito la dedicación. El stewardship ejercido encima de una carga de trabajo completa es la forma más habitual en que un programa de gobierno muere en silencio; no por oposición, sino porque el trabajo diario del custodio tiene fechas y el gobierno no. Medio día a la semana, acordado con quien fija sus prioridades, dura más que cualquier cantidad de entusiasmo.

## 4. Escribir un cuerpo de políticas lo bastante corto para leerse

Los programas nuevos tienden a escribir demasiada política demasiado pronto. Apunta al conjunto más pequeño que cubra tu exposición real, y escribe cada una de forma que un incumplimiento sea visible.

Para la mayoría de las organizaciones eso significa cinco o seis [políticas de datos](/es/glossary/data-policy/): clasificación y tratamiento de datos sensibles, aprobación de accesos, retención, expectativas de calidad para los [elementos de datos críticos](/es/glossary/critical-data-element/) y autoridad definicional, es decir, quién puede aprobar el significado de un término de negocio.

Dos hábitos mantienen vivo un cuerpo de políticas. Dale a cada política un dueño con nombre y una fecha de revisión. Y escribe la regla de forma comprobable: no "los datos deben ser exactos", sino "el email del cliente es obligatorio en cuentas activas, se mide semanalmente, y cualquier mes por debajo del 98 % lo acepta por escrito el propietario del dominio o se remedia".

## 5. Construir el inventario más simple que funcione

Necesitas saber qué tienes. Para eso sirve un [catálogo de datos](/es/glossary/data-catalog/) en esta etapa, y una hoja de cálculo lo hace de forma adecuada para los primeros cien activos.

Registra, por conjunto significativo: qué es, quién lo posee, su clasificación, su sistema origen, su calendario de actualización y las definiciones de sus campos clave. Empieza por los conjuntos que alimentan el reporting de dirección, porque son los que se notan cuando fallan.

Compra la herramienta cuando la hoja de cálculo se convierta en el cuello de botella, y no antes. Un producto de catálogo comprado antes de tener algo que meterle produce un índice vacío y una conversación de renovación de licencia. Si quieres una estructura de partida, las [plantillas](/es/templates/) incluyen un inventario y un registro de definiciones que puedes copiar.

## 6. Arreglar una cantidad pequeña de calidad, de forma visible

La [calidad de datos](/es/glossary/data-quality/) es donde el gobierno se gana o se pierde la confianza, y el error es empezar amplio. Medir cuarenta atributos en nueve sistemas produce un cuadro de mando; arreglar tres atributos de los que la gente se queja cada semana produce una reputación.

Elige tus elementos de datos críticos: el puñado de campos que, cuando están mal, causan un problema de negocio visible. Fija una tolerancia para cada uno, decide quién acepta el riesgo cuando se incumple, implementa una [regla de calidad](/es/glossary/data-quality-rule/) que lo mida con periodicidad y enruta la alerta a una persona y no a un buzón. Después publica la tendencia donde el negocio ya mira.

Una nota sobre dónde publicar los resultados de calidad. El instinto es construir un cuadro de mando de gobierno, y el problema de un cuadro de mando de gobierno es que lo leen los que lo construyeron. Si la completitud del email del cliente es una métrica de negocio, le corresponde estar en la revisión de operaciones al lado de las demás métricas de negocio. Esa colocación hace más por la adopción que cualquier plan de comunicación.

Una victoria temprana fiable: deduplicación de una entidad principal con una [única fuente de verdad](/es/glossary/single-source-of-truth/) declarada después. Es visible, es medible y solo se mantiene arreglada por la decisión de gobierno que vino detrás.

## El orden importa

Los seis fundamentos no son independientes, y construirlos fuera de secuencia es la causa habitual de los programas atascados.

Dominios antes que roles, porque no puedes nombrar propietario de un alcance indefinido. Roles antes que política, porque una política sin dueño es documentación. Política antes que catálogo, porque el catálogo registra decisiones y necesitas haber tomado alguna. Catálogo antes que medición de calidad, porque no puedes medir lo que no has inventariado y, si no, medirás lo que resulte cómodo.

Si no te llevas nada más de esto: dos dominios, propietarios y custodios con nombre, cinco políticas, una hoja de cálculo, tres atributos medidos. Ese es un programa completo de primer trimestre, y es suficiente para demostrar valor.

## Qué dejar para el segundo año

Ser explícito sobre lo que **no** estás haciendo es lo que mantiene entregable un primer programa.

Deja la compra de plataforma. Deja la evaluación de madurez completa contra todas las dimensiones: una lectura para encontrar tu área más débil es útil, una línea base puntuada de cuarenta ítems es un proyecto en sí. Deja la federación: opera de forma central sobre dos dominios hasta que tengas custodios que existan. Deja el glosario corporativo entero y haz los cincuenta términos que aparecen en el reporting al consejo. Y deja la hoja de ruta plurianual, que será equivocada, a cambio de un plan publicado para los dos próximos trimestres, que será aproximadamente correcto y creíble.

## Cómo empezar esta semana

Tres preguntas, contestables en una tarde: cuáles son nuestros cinco dominios, quién es la persona responsable de los dos que más duelen, y qué tres atributos arreglaríamos primero si alguien nos diera quince días.

Si las respuestas no están claras, ahí tienes tu diagnóstico, e [Identificación y solución de puntos de dolor de datos](/es/blog/identificacion-y-solucion-de-puntos-de-dolor-de-datos-el-primer-paso-en-gobierno-de-datos/) es el método para encontrarlas. Cuando los fundamentos estén puestos y necesites que las decisiones empiecen a fluir por ellos, [Cómo construir un modelo operativo de gobierno de datos](/es/blog/como-construir-un-modelo-operativo-de-gobierno-de-datos/) es el paso siguiente. Y si quieres una lectura estructurada de dónde estás antes de comprometerte con nada, la [evaluación de madurez](/es/maturity-assessment/) lleva unos diez minutos.
