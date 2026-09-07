---
slug: simulator-results
nav: boardResults
title: Resultados públicos de los simuladores y lo que revelan | Data Governance Journey
heading: Qué muestran las partidas públicas sobre el instinto de gobernanza
deck: Tres simuladores de escenarios, un tablero público para cada uno, y los patrones que vuelven a aparecer cada vez que alguien tiene que decidir con el reloj en marcha, con una explicación honesta de lo que un tablero público no puede decirte.
description: Resultados públicos de tres simuladores de gobernanza de datos y sus lecciones clave: cómo falla el instinto de gobernanza bajo presión, por qué la propiedad del dato acaba en TI, y qué no puede medir un tablero.
kicker: Resultados de los tableros
schema: page
related_articles: building-a-data-governance-operating-model, why-data-governance-people-process-technology-data, data-literacy-is-a-business-capability
updated: 2026-09-07
---

Tres simuladores de este sitio te meten dentro de una situación de gobernanza y te obligan a elegir. Una regla de calidad está fallando y arreglarla implica pedirle a un director que cambie un proceso por el que se le mide. Dos departamentos reclaman el mismo registro de cliente. La alfabetización es baja y no hay presupuesto de formación. Decides, la decisión se puntúa por su consecuencia de gobernanza y no contra una respuesta correcta, y tu partida entra en un tablero público.

Esta página es lo que sale por el otro extremo: no el tablero en sí, que está en cada simulador, sino la distribución que hay detrás y las lecciones que sobreviven a mirarlas con cuidado.

Es también un ejemplo de lo que describe. Un tablero es una medición, una medición tiene un tamaño de muestra, y el tamaño de muestra decide qué frases tiene derecho a escribir cualquiera. Así que cada cifra de abajo llega con su tamaño de muestra pegado, y la redacción cambia cuando la muestra es demasiado pequeña para sostener un porcentaje.

## Qué mide realmente cada simulador

No son tres versiones del mismo cuestionario. Cada uno está construido para dejar al descubierto un fallo distinto.

**Gobernanza de Datos en el Día a Día** te da una semana en la vida de un responsable de gobernanza y la puntúa sobre cinco ejes: eficiencia, confianza, responsabilidad, seguridad y contexto, sobre 100. Los ejes no son independientes, y eso es lo importante: una decisión que compra eficiencia normalmente gasta responsabilidad, y la puntuación refleja el intercambio. Aquí es muy difícil ir bien siendo complaciente.

**Conflicto de Propiedad de Datos** son diez disputas, cada una de las cuales pertenece a uno de tres roles: el Propietario de Negocio, el Data Steward o TI. Se puntúa sobre 1000. Cuatro de las diez pertenecen a TI, tres al Steward y tres al Propietario de Negocio: un reparto que importa más de lo que parece, y la siguiente sección trata de por qué.

**Alfabetización de Datos** son quince puntos repartidos entre gobernanza, analítica, IA y automatización, conciencia de sesgo y cultura de datos. Es el único de los tres que pregunta por la cultura directamente, y el único que te devuelve una segunda cifra: el valor que estima que has desbloqueado de tus activos de datos.

Ninguno de los tres ve los cinco pilares de [madurez de datos](/es/glossary/data-maturity/). El del Día a Día y el de Propiedad son ciegos a la [cultura de datos](/es/glossary/data-culture/); el de Alfabetización es ciego a los metadatos. Eso es lo que es un ejercicio de diez preguntas, no un defecto pendiente de arreglar, y fija la regla con la que se leen los tableros: una dimensión que nadie midió se reporta como no medida, nunca como débil. Deducir un problema de cultura de un ejercicio de RACI sería inventarse un hallazgo.

{{PUBLIC_BOARDS}}

## Las lecciones

### La propiedad del dato no va a quien debería tenerla. Va a quien está más cerca de la tecnología

Es el patrón más fiable de todo el conjunto, y el simulador de propiedad existe para dejarlo al descubierto. Diez disputas, puntuadas por rol, y el fallo casi nunca está repartido por igual: la gente va fuerte en los cuatro escenarios de TI y flojea en los tres que pertenecen al Propietario de Negocio.

Lee eso con cuidado, porque la lectura útil no es "flojo en propiedad del dato". Es que cuando una pregunta suena técnica, la respuesta se va por defecto al equipo técnico, y casi cualquier pregunta de gobernanza puede hacerse sonar técnica. ¿Quién es dueño de la definición de cliente activo? Detrás hay una consulta SQL, así que TI. ¿Quién aprueba compartir datos con un tercero? Hay una API implicada, así que TI. ¿Quién firma el presupuesto del almacén de datos? Ese sí es TI de verdad, y por eso el instinto sobrevive.

Con lo que acabas es un programa donde todos los [data owners](/es/glossary/data-owner/) están en el equipo de datos, lo que significa que nadie con autoridad para cambiar un proceso de negocio es dueño de nada. Es el defecto estructural más común que encuentro en organizaciones reales, y un ejercicio de diez minutos lo pone sobre la mesa en cuatro.

### La media no te dice casi nada. La dispersión te dice dónde está la discusión

Una sala que promedia 70 con todo el mundo entre 66 y 74 comparte un mismo modelo de cómo funciona la gobernanza. Una sala que promedia 70 combinando un 95 y un 45 tiene dos modelos incompatibles y no lo sabe. Esas dos salas necesitan trimestres siguientes completamente distintos, y la media no las distingue.

Por eso las cifras de arriba reportan la diferencia entre la mejor partida y la mediana, y por eso el informe del facilitador de una sesión privada abre con el desacuerdo y no con el ganador. En un taller, los desacuerdos son la sesión: el tablero va a la pantalla, y entonces las dos personas que eligieron cosas opuestas se explican la una a la otra usando tu propia organización como ejemplo.

### La velocidad es confianza, y la confianza no es acierto

Dos de los tres tableros se cronometran. En el tablero de Alfabetización de Datos, por ahora la partida publicada más rápida es también la de menor puntuación —veinticinco segundos, cinco puntos de quince—, mientras que la de mayor puntuación llevó más de seis minutos.

Tres partidas no son un hallazgo y no voy a fingir lo contrario. Pero coincide con lo que pasa en las salas lo bastante a menudo como para decirlo en voz alta: quien termina primero suele ser quien no vio el compromiso. Una pregunta de gobernanza que puedes responder al instante normalmente se ha leído mal, como una pregunta técnica con respuesta de consulta, que es el fallo de arriba con otro disfraz.

### Las puntuaciones de gobernanza fallan en responsabilidad y contexto, no en seguridad

Todo el mundo sabe que los datos hay que protegerlos. Casi nadie sabe decir quién decide. En sesiones reales, los dos ejes que vuelven más débiles son responsabilidad —quién tiene la autoridad para tomar esta decisión— y contexto, es decir, si alguien aguas abajo puede saber qué cuenta realmente un número. La seguridad puntúa comparativamente bien, porque la seguridad ya tiene presupuesto, un dueño con nombre y una auditoría detrás.

Esa diferencia es el argumento para un [modelo operativo](/es/glossary/data-governance-operating-model/) y no para más política. Una política le dice a la gente cuál es la regla. Estos fallos son fallos de [derechos de decisión](/es/glossary/decision-rights/): nadie tenía dudas sobre la regla, solo sobre quién puede decidir la excepción.

### Una puntuación baja de alfabetización suele ser un problema de vocabulario disfrazado de problema de números

El simulador de alfabetización pregunta por sesgo, IA y cultura además de analítica, y el patrón en las respuestas es constante: la gente no interpreta mal los datos, lo que no sabe es qué significan las palabras de tu organización. Si "cliente" incluye las cuentas que se dieron de baja. Si la cifra de ingresos es contratada o reconocida. Si los "usuarios activos" del tablero son los mismos "usuarios activos" que vio el comité la semana pasada.

Eso es un problema de [glosario de negocio](/es/glossary/business-glossary/). Y es por lo que los programas de [alfabetización de datos](/es/glossary/data-literacy/) que enseñan estadística a gente que necesitaba definiciones nunca mueven nada.

## Qué no puede decirte un tablero público, y por qué

Todo lo de arriba es o una propiedad de cómo están construidos los simuladores o un patrón de haberlos usado con grupos reales. Lo que no es, es un diagnóstico de tu organización, y merece la pena ser preciso sobre el motivo, porque es una decisión de gobierno de datos y no una limitación del producto.

Una partida pública guarda tu puntuación, el idioma en el que jugaste, cuánto tardaste y el nombre que escribiste. No guarda tu desglose pregunta a pregunta. Es deliberado: conservar el detalle por dimensión de la partida de un desconocido significaría que este sitio guarda datos de comportamiento de personas que vinieron a jugar diez minutos, sin un propósito que pudiera defender. Así que no lo guarda.

La consecuencia es que los tableros públicos pueden mostrarte cómo se distribuyen las partidas publicadas y nada sobre *por qué* pasó algo de eso. No hay forma de decir en qué eje es más débil un tablero, porque ese dato no existe fuera de un espacio privado. Ese es el límite honesto de esta página.

## El mismo instrumento, apuntado a tu propia organización

Dentro de un espacio privado el desglose sí se guarda, y eso cambia lo que es el ejercicio. Deja de ser un tablero y se convierte en la medición de una sala concreta.

- **La dimensión más débil, la primera de la lista.** No "tu equipo sacó 68", sino "tu equipo es más débil en responsabilidad, luego en contexto, y va fuerte en seguridad", con los cinco pilares de [madurez de datos](/es/glossary/data-maturity-model/) con una lectura cada uno o marcados explícitamente como no medidos.
- **Dónde la sala se contradijo a sí misma.** La distancia entre tu mejor y tu peor partida, por ejercicio. Esa es la cifra que te dice si tienes una brecha de conocimiento o una brecha política.
- **Propiedad por rol.** Los cuatro escenarios de TI frente a los tres del Propietario de Negocio, con tu gente: el patrón descrito arriba, como un hecho sobre tu organización y no como una observación general.
- **Un intento por persona.** Un espacio privado registra la primera partida que alguien termina y rechaza las demás, así que tu media es una media de primeros instintos y no de tantos intentos como cada uno quisiera publicar. Eso es lo que hace que una dimensión débil merezca la pena accionar.
- **Tus escenarios.** El enunciado reescrito alrededor de tus sistemas, tus departamentos y tu vocabulario, para que la disputa de propiedad sea entre dos equipos que existen y discuten de verdad.
- **Tu marca, tu tablero.** Tu nombre, logo y color de acento, y un tablero con solo tus compañeros dentro.

Y el informe te lo quedas. Ordena las dimensiones en las que tu grupo fue más débil, con bandas de madurez y tiempos, más una exportación a CSV: la diferencia entre contarle a un patrocinador que al equipo le gustó el taller y enseñarle tres áreas ordenadas donde tu propia gente no sabía quién decide.

## Convierte estos simuladores en el espacio privado de tu equipo

Dos formas de entrar, según lo claro que tengas ya lo que quieres.

**[Ver cómo funciona un taller →](/es/workshops/)**: el formato, el debrief, cuál de los tres escenarios encaja con cada sala, qué contiene el informe del facilitador y cómo se presupuestan las sesiones. Empieza aquí si todavía estás decidiendo si esto encaja.

**[Ir directo al formulario de contacto →](/?offer=private-space#contact-form-start)**: llega con la solicitud de espacio privado ya rellenada. Añade tus fechas, el número de participantes, la mezcla de idiomas y qué sistemas y equipos deberían nombrar los escenarios, y te vuelvo con una recomendación de escenario y un presupuesto.

Si el taller es una pieza de algo más grande, la página de [asesoría](/es/advisory/) cuenta cómo encaja normalmente: casi siempre como el movimiento de apertura del diseño de un modelo operativo. Una sala que acaba de discutir sobre propiedad del dato se implica con una matriz de derechos de decisión. Una que no lo ha hecho, nunca.
