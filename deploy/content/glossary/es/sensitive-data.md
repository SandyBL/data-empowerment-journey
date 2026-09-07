---
term: Datos sensibles
short: Datos cuya exposición daña a la persona que describen: salud, biometría, creencias, orientación sexual, antecedentes penales, ubicación precisa.
group: ai
also: Categorías especiales de datos, datos personales sensibles, dados sensíveis
related: confidential-data, personally-identifiable-information, data-classification, dynamic-data-masking
article: responsible-ai-starts-with-data-governance
updated: 2026-09-07
---

La distinción que importa es quién sale herido. Los datos sensibles son la categoría en la que el daño recae sobre un ser humano: un diagnóstico, una plantilla biométrica, una afiliación política o religiosa, la pertenencia a un sindicato, la orientación sexual, el origen étnico, un antecedente penal, una dirección que alguien mantiene oculta. El RGPD los llama categorías especiales, la LGPD brasileña los llama dados sensíveis y ambas los tratan como una clase aparte con una base legal más estricta, porque la consecuencia de una filtración no es un bochorno ni una multa: es discriminación, exclusión o riesgo físico para alguien que nunca eligió estar en tu base de datos.

**En la práctica.** Es una etiqueta a nivel de columna, aplicada al crear el dato y heredada por todo lo que va detrás, con enmascaramiento activado por defecto y acceso concedido para un propósito declarado y no para un cargo. La retención es más corta, compartirlos con un tercero exige una base legal con nombre y los modelos entrenados con ellos heredan todas esas restricciones. El primer paso honesto suele ser más pequeño que una política: averiguar qué tablas los contienen de verdad, porque el inventario casi siempre está mal.

**Dónde se rompe.** Se confunden con los datos confidenciales y se gobiernan como si fueran lo mismo. Los salarios y los precios son confidenciales: la expuesta es la empresa. Una historia clínica es sensible: el expuesto es el individuo. Mezclarlos lleva a proteger datos comerciales como si hubiera vidas en juego, o a proteger la salud de las personas con el cuidado que se le da a una lista de precios. Segundo fallo: la etiqueta vive en la columna de origen y la copia en la hoja de cálculo de alguien no hereda nada.
