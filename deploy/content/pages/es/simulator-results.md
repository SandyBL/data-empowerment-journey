---
slug: simulator-results
nav: boardResults
title: Resultados públicos de los simuladores y lo que revelan | Data Governance Journey
heading: Qué revelan los tableros de los simuladores sobre el instinto de gobernanza
deck: Tres simuladores de escenarios, un tablero público para cada uno, y las lecciones que salen de ver a la gente decidir bajo presión de tiempo, junto con una explicación honesta de lo que un tablero público puede y no puede decirte.
description: Resultados públicos de tres simuladores de gobernanza de datos y sus lecciones clave: cómo falla el instinto de gobernanza bajo presión, por qué la propiedad del dato acaba en TI, y qué no puede medir un tablero.
kicker: Resultados de los tableros
schema: page
related_articles: building-a-data-governance-operating-model, why-data-governance-people-process-technology-data, data-literacy-is-a-business-capability
updated: 2026-09-05
---

Tres simuladores de este sitio te meten dentro de una situación de gobernanza y te obligan a elegir. Una regla de calidad está fallando y arreglarla implica pedirle a un director que cambie un proceso por el que se le mide. Dos departamentos reclaman el mismo registro de cliente. La alfabetización es baja y no hay presupuesto de formación. Decides, la decisión se puntúa por su consecuencia de gobernanza y no contra una respuesta correcta, y tu partida entra en un tablero público.

Esta página es lo que sale por el otro extremo. No el tablero en sí, que está en cada simulador, sino la distribución que hay detrás, y las lecciones que sobreviven a mirarlas con cuidado.

Es también un ejemplo de lo que describe. Un tablero es una medición, una medición tiene un tamaño de muestra, y el tamaño de muestra decide qué frases tienes derecho a escribir. Así que las cifras de abajo llegan con su tamaño de muestra pegado, y la redacción cambia cuando la muestra es demasiado pequeña para sostener un porcentaje.

## Qué mide realmente cada simulador

Los tres no son variaciones de un cuestionario. Cada uno instrumenta un fallo distinto.

**Gobernanza de Datos en el Día a Día** puntúa una semana en la vida de un responsable de gobernanza sobre cinco ejes: eficiencia, confianza, responsabilidad, seguridad y contexto. Se puntúa sobre 100. Lo interesante es que los cinco ejes no son independientes: una decisión que compra eficiencia normalmente gasta responsabilidad, y la puntuación refleja el intercambio, así que es muy difícil ir bien siendo simplemente complaciente.

**Conflicto de Propiedad de Datos** son diez disputas, cada una de las cuales pertenece a uno de tres roles: el Propietario de Negocio, el Data Steward o TI. Se puntúa sobre 1000. Cuatro de las diez pertenecen a TI, tres al Steward y tres al Propietario de Negocio, un reparto que importa más de lo que parece y del que trata la siguiente sección.

**Alfabetización de Datos** son quince puntos repartidos entre gobernanza, analítica, IA y automatización, conciencia de sesgo y cultura de datos. Es el único de los tres que pregunta por la cultura directamente, y el único que produce una segunda cifra: el valor que estima que has desbloqueado de tus activos de datos.

Ninguno de los tres ve los cinco pilares de [madurez de datos](/es/glossary/data-maturity/). Día a Día y Propiedad son ciegos a la [cultura de datos](/es/glossary/data-culture/); Alfabetización es ciega a los metadatos. Eso es una propiedad de los ejercicios de diez preguntas, no un defecto que haya que arreglar, y fija la regla con la que se leen los tableros: una dimensión no medida se muestra como no medida, nunca como débil. Inferir un problema de cultura a partir de un ejercicio de RACI sería inventarse un hallazgo.

{{PUBLIC_BOARDS}}

## Las lecciones

### La propiedad del dato no va a quien debería tenerla, va a quien está más cerca de la tecnología

Es el patrón más fiable de todo el conjunto, y el simulador de propiedad está construido para exponerlo. Diez disputas, puntuadas por rol, y el fallo casi nunca es uniforme: la gente va bien en los cuatro escenarios de TI y mal en los tres que pertenecen al Propietario de Negocio.

Lee eso con cuidado, porque la lectura útil no es "van mal en propiedad del dato". Es que cuando una pregunta suena técnica, la respuesta va por defecto al equipo técnico, y casi cualquier pregunta de gobernanza se puede hacer sonar técnica. ¿Quién es dueño de la definición de cliente activo? Hay una consulta SQL detrás, así que TI. ¿Quién aprueba compartir datos con un tercero? Hay una API implicada, así que TI. ¿Quién firma el presupuesto del almacén de datos? Ese sí es TI de verdad, y por eso el instinto sobrevive.

La consecuencia es un programa de gobernanza donde todos los [data owners](/es/glossary/data-owner/) están en el equipo de datos, lo que significa que nadie con autoridad para cambiar un proceso de negocio es dueño de nada. Es el defecto estructural que encuentro con más frecuencia en organizaciones reales, y un ejercicio de diez minutos lo saca a la superficie en una sala en unos cuatro.

### La puntuación media no te dice casi nada; la dispersión te dice dónde está la discusión

Una sala que promedia 70 con todo el mundo entre 66 y 74 comparte un modelo de cómo funciona la gobernanza. Una sala que promedia 70 combinando un 95 y un 45 tiene dos modelos incompatibles y no lo sabe. Esas dos salas necesitan trimestres completamente distintos, y la media no las distingue.

Por eso las cifras de arriba muestran la distancia entre la mejor partida y la mediana, y por eso el informe del facilitador de una sesión privada abre con el desacuerdo y no con el ganador. En un taller los desacuerdos *son* la sesión: el tablero va a la pantalla, y entonces las dos personas que eligieron cosas opuestas se explican la una a la otra usando su propia organización como ejemplo.

### La velocidad es confianza, y la confianza no es acierto

Dos de los tres tableros se cronometran. En el tablero de Alfabetización de Datos, por ahora, la partida publicada más rápida es también la de menor puntuación (veinticinco segundos, cinco puntos de quince), mientras que la de mayor puntuación llevó más de seis minutos.

Tres partidas no son un hallazgo, y no voy a pretender que lo sean. Pero coincide con lo que pasa en las salas de forma bastante consistente como para decirlo en voz alta: quien acaba primero suele ser quien no se dio cuenta del intercambio. Una pregunta de gobernanza que se puede responder al instante normalmente se ha leído mal como una pregunta técnica con respuesta de consulta, que es el mismo fallo de antes con otro sombrero.

### Las puntuaciones de gobernanza fallan en responsabilidad y contexto, no en seguridad

Todo el mundo sabe que los datos hay que protegerlos. Casi nadie sabe decir quién decide. En sesiones reales, los ejes que vuelven más débiles son responsabilidad (quién tiene autoridad para tomar esta decisión) y contexto, es decir, si alguien aguas abajo puede saber qué cuenta realmente un número. La seguridad puntúa comparativamente bien, porque la seguridad tiene presupuesto, un dueño con nombre y una auditoría detrás.

Esa asimetría es el argumento a favor de un [modelo operativo](/es/glossary/data-governance-operating-model/) en lugar de más política. Una política le dice a la gente cuál es la norma. Los fallos de arriba son fallos de [derechos de decisión](/es/glossary/decision-rights/): nadie tenía dudas sobre la norma, las tenía sobre quién puede decidir la excepción.

### Una puntuación baja de alfabetización suele ser un problema de vocabulario disfrazado de problema de números

El simulador de alfabetización pregunta por sesgo, IA y cultura además de analítica, y el patrón en las respuestas es que la gente no interpreta mal los datos: no está segura de qué significan las palabras de la organización. Si "cliente" incluye las cuentas que se han ido. Si la cifra de ingresos es contratada o reconocida. Si los "usuarios activos" del panel son los mismos "usuarios activos" que vio el comité la semana pasada.

Eso es un problema de [glosario de negocio](/es/glossary/business-glossary/), y es la razón por la que los programas de [alfabetización de datos](/es/glossary/data-literacy/) que enseñan estadística a gente que necesita definiciones no mueven nada.

## Qué no puede decirte un tablero público, y por qué

Todo lo anterior es o una propiedad de cómo están construidos los simuladores o un patrón de haberlos pasado con grupos reales. Lo que nada de eso hace es diagnosticar una organización concreta, y merece la pena ser preciso sobre el motivo, porque es una decisión de gobernanza de datos y no una limitación del producto.

Una partida pública guarda tu puntuación, el idioma en el que jugaste, cuánto tardaste y el nombre que escribiste. No guarda tu desglose por pregunta. Es deliberado: conservar el detalle por dimensión de la partida de un desconocido significaría que este sitio guarda datos de comportamiento sobre personas que vinieron a hacer un ejercicio de diez minutos, sin ningún propósito que pudiera defender. Así que no lo guarda.

La consecuencia es que los tableros públicos pueden mostrarte cómo se distribuye la población de partidas publicadas y nada sobre *por qué* pasó nada de eso. No hay manera de decir en qué eje es más débil el tablero, porque el dato a nivel de eje no existe fuera de un espacio privado. Ese es el límite honesto de esta página.

## El mismo instrumento, apuntado a tu organización

Dentro de un espacio privado el desglose sí se guarda, y eso cambia lo que es el ejercicio. Deja de ser un tablero y pasa a ser la medición de una sala concreta.

- **La dimensión más débil, la primera de la lista.** No "tu equipo sacó 68", sino "tu equipo es más débil en responsabilidad, luego en contexto, y va fuerte en seguridad", con los cinco pilares de [madurez de datos](/es/glossary/data-maturity-model/) con una lectura cada uno o marcados explícitamente como no medidos.
- **Dónde la sala se contradijo a sí misma.** La distancia entre tu mejor y tu peor partida, por ejercicio, que es la cifra que te dice si tienes una brecha de conocimiento o una brecha política.
- **Propiedad por rol.** Los cuatro escenarios de TI frente a los tres del Propietario de Negocio, con tu gente: el hallazgo descrito arriba, como un hecho sobre tu organización y no como un patrón general.
- **Un intento por persona.** Un espacio privado registra la primera partida que alguien termina y rechaza las demás, así que una media es una media de primeros instintos y no de tantos intentos como cada uno quisiera publicar. Eso es lo que hace que una dimensión débil merezca la pena accionar.
- **Tus escenarios.** El enunciado reescrito alrededor de tus sistemas, tus departamentos y tu vocabulario, para que la disputa de propiedad sea entre dos equipos que existen y discuten de verdad.
- **Tu marca, tu tablero.** Tu nombre, logo y color de acento, y un tablero con solo tus compañeros dentro.

Y el informe te lo quedas. Ordena las dimensiones en las que tu grupo fue más débil, con bandas de madurez y tiempos, más una exportación CSV, que es la diferencia entre decirle a un patrocinador que al equipo le gustó el taller y enseñarle tres áreas ordenadas en las que tu propia gente no sabía quién decide.

## Solicita un espacio privado

Dos puertas de entrada, según cuánto sepas ya que lo quieres.

**[Ver cómo funciona un taller →](/es/workshops/)**: el formato, el debrief, cuál de los tres escenarios encaja con cada sala, qué contiene el informe del facilitador y cómo se presupuestan las sesiones. Empieza aquí si todavía estás decidiendo si esto encaja.

**[Ir directo al formulario de contacto →](/?offer=private-space#contact-form-start)**: llega con la solicitud de espacio privado ya rellenada. Añade tus fechas, el número de participantes, la mezcla de idiomas y qué sistemas y equipos deberían nombrar los escenarios, y te vuelvo con una recomendación de escenario y un presupuesto.

Si el taller es una pieza de algo más grande, [los servicios de consultoría](/es/consulting/) explican cómo encaja normalmente, casi siempre como movimiento de apertura del diseño de un modelo operativo: una sala que acaba de discutir sobre propiedad del dato se engancha a una matriz de derechos de decisión, y una sala que no ha discutido no lo hace nunca.
