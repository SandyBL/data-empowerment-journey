---
term: Gestión de datos maestros
short: La disciplina de mantener un único registro autoritativo de las entidades que todo el negocio comparte: cliente, producto, proveedor, empleado.
group: metadata
also: MDM, gestión de datos de referencia
related: data-management, single-source-of-truth, data-domain, data-quality
article: data-governance-vs-data-management
updated: 2026-09-05
---

Los datos maestros son los que aparecen en todos los sistemas: el cliente que existe en el CRM, en facturación, en soporte y en el almacén, en cuatro versiones ligeramente distintas. El MDM es la práctica de resolverlas en un único registro con un identificador conocido, y de decidir qué sistema puede modificar qué atributo. Es trabajo técnico con un requisito previo de gobierno, porque las reglas de coincidencia y de supervivencia son decisiones de negocio disfrazadas de configuración.

**En la práctica.** Los proyectos de MDM funcionan cuando parten de un dolor concreto —clientes duplicados que inflan la tasa de churn, un proveedor pagado dos veces— y cubren una sola entidad. Fracasan cuando parten de la ambición de una vista única de cliente para toda la empresa.

**Dónde se rompe.** El umbral de coincidencia lo fija el equipo de implantación. Alguien tiene que decidir si fusionar dos registros con un 92 % de similitud es aceptable, y la consecuencia de una fusión errónea es un cliente viendo los datos de otro cliente. Esa es una decisión del dueño, y delegarla en una pantalla de configuración es como el MDM se convierte en un incidente de privacidad.
