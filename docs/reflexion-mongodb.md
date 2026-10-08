Reflexión — EC1 F1 A2
Nombre: [Urbina Gutiérrez Angel]
Grupo: [001]

1. Función de Node.js
   Node.js es el entorno de ejecución que permite ejecutar JavaScript/TypeScript en el servidor, fuera del navegador. En este proyecto se usa para:

Ejecutar el código TypeScript directamente gracias a tsx (script start en package.json).

Leer variables de entorno mediante process.env (archivo utils/env.ts).

Manejar temporizaciones con setTimeout para simular operaciones asíncronas (utils/delay.ts).

Mostrar información por consola con console.log y capturar errores.

Sin Node.js, la aplicación no podría correr ni interactuar con el sistema operativo.

2. Aportes de TypeScript
   TypeScript ayuda a detectar errores en tiempo de compilación antes de ejecutar la aplicación, gracias a:

Tipado estático: por ejemplo, la interfaz Task y el tipo TaskStatus definen la estructura de los datos; si se usa mal, el compilador lo señala.

Configuración estricta: "strict": true y "noUncheckedIndexedAccess": true en tsconfig.json previenen errores comunes como acceder a índices inexistentes.

Interfaces y tipos: facilitan el contrato de datos y mejoran el autocompletado y la refactorización segura en el editor.

Esto reduce errores en producción y hace el código más mantenible.

3. Separación de models, data, services y utils
   La separación en carpetas sigue el principio de responsabilidad única y facilita el mantenimiento:

models/: define los contratos de datos (interfaces y tipos), como Task y TaskStatus.

data/: contiene los datos iniciales (array de tareas de ejemplo), separado de la lógica.

services/: aloja la lógica de negocio: crear, listar, buscar y completar tareas.

utils/: agrupa utilidades transversales, como delay (espera asíncrona) y la lectura de variables de entorno (env).

Esta organización permite que cada parte sea reutilizable y fácil de testear de forma aislada.

4. Diferencia entre síncrono y async
   Operación síncrona: bloquea el hilo de ejecución hasta que finaliza. Las operaciones se ejecutan secuencialmente. En el proyecto, createTask, listTasks y completeTask son síncronas.

Función async (asíncrona): no bloquea; permite que el programa continúe mientras se espera la finalización de la operación (por ejemplo, una promesa). En el código, delay es asíncrona y se usa con await para pausar sin bloquear el resto.

La principal diferencia es que async devuelve una Promise y habilita el uso de await para manejar flujos asíncronos de forma más legible.

5. findTaskById devuelve Task | undefined
   Esta función busca una tarea por su ID en el arreglo. Si no encuentra ninguna con ese ID, retorna undefined. Esto es intencional:

Permite manejar el caso de "no encontrado" sin lanzar excepción.

TypeScript obliga a quien llama a verificar si el resultado es undefined antes de usarlo, evitando errores de acceso a propiedades de undefined en tiempo de ejecución.

Es una práctica segura y común para operaciones de búsqueda.

6. Ventaja de leer APP_NAME desde process.env
   Leer APP_NAME (y cualquier otra variable sensible) desde el entorno ofrece:

Seguridad: los secretos (claves API, contraseñas, etc.) no quedan hardcodeados en el repositorio, por lo que no son visibles para terceros con acceso al código.

Flexibilidad: se puede cambiar el valor sin modificar el código, simplemente configurando la variable en el entorno de ejecución (desarrollo, testing, producción).

Valor por defecto: en utils/env.ts se asigna un valor por defecto ('Task Manager Backend') si no está definida, lo que evita fallos y permite que la app funcione sin configuración adicional.

7. Diferencia entre pnpm start y pnpm build + pnpm serve
   pnpm start: ejecuta directamente el código TypeScript usando tsx (o similar) sin compilar previamente. Es rápido para desarrollo, pero tiene sobrecarga de transpilación en caliente y no es óptimo para producción.

pnpm build + pnpm serve: primero compila el código TypeScript a JavaScript (con tsc, generando archivos en dist/) y luego ejecuta el JavaScript compilado con Node.js. Esto es más eficiente en rendimiento y es la práctica recomendada para entornos productivos, ya que separa la compilación de la ejecución.

En resumen, start es para desarrollo y build + serve para producción.

8. Partes reutilizables al construir una API con Express
   Al migrar a una API con Express, se pueden reutilizar varias capas del proyecto actual:

Modelos (models/): las interfaces Task y TaskStatus son independientes del transporte y servirán para definir los esquemas de datos en la API.

Servicios (services/): la lógica de negocio (crear, listar, completar, buscar) es reutilizable tal cual, solo se adaptaría la entrada/salida a los controladores de Express.

Utilidades (utils/): delay y la lectura de variables de entorno son genéricas y pueden seguir usándose.

Estructura modular: la separación en capas facilita la integración con Express, donde los controladores llamarían a los servicios y estos usarían los modelos.

El punto de entrada (index.ts) sería reemplazado por los endpoints de Express, pero el núcleo de la aplicación se conserva.

9. Preguntas sobre la incorporación de MongoDB Atlas
1. ¿Qué diferencia existe entre tu cuenta de Atlas y el usuario de base de datos?
   La cuenta de Atlas es la identidad con la que accedes a la plataforma web de MongoDB Atlas (el panel de control, la facturación, la gestión de clústeres, etc.). Es una cuenta de usuario de la plataforma en la nube.

El usuario de base de datos es una credencial distinta, creada dentro de un clúster de Atlas, que se usa exclusivamente para que la aplicación (Node.js) se autentique contra MongoDB al conectarse. Tiene permisos limitados a una base de datos concreta y no permite administrar el clúster ni acceder al panel de Atlas.

En resumen: la cuenta de Atlas administra la infraestructura; el usuario de base de datos solo accede a los datos desde la aplicación.

2. ¿Por qué MONGODB_URI se considera un secreto aunque el repositorio sea privado?
   Porque la cadena de conexión incluye el usuario y la contraseña del usuario de base de datos, además del host y el nombre de la base. Aunque el repositorio sea privado:

Cualquier persona con acceso al repo (colaboradores, forks, CI/CD, backups) podría ver la credencial.

Si el repositorio se hace público por error o se filtra, la credencial queda expuesta.

Los secretos en el código violan el principio de mínimo privilegio y dificultan la rotación de credenciales.

Por eso MONGODB_URI debe ir en un archivo .env (ignorado por Git) o en variables de entorno del sistema, nunca hardcodeado ni versionado.

3. ¿Qué riesgo introduce permitir 0.0.0.0/0 en la lista de acceso?
   0.0.0.0/0 significa "cualquier dirección IP de Internet". Permitir esa entrada en la lista de accesos de Atlas expone el clúster a:

Ataques de fuerza bruta contra las credenciales de la base de datos.

Escaneos automatizados que buscan puertos MongoDB abiertos.

Acceso no autorizado si las credenciales se filtran.

Costos inesperados por tráfico o uso malicioso.

Lo recomendable es restringir la lista de acceso a las IPs concretas de los entornos que necesitan conectarse (desarrollo, servidor de producción, etc.) o usar VPC Peering / Private Endpoints.

4. ¿Por qué la API espera connectDatabase antes de ejecutar app.listen?
   Porque app.listen pone al servidor HTTP a aceptar peticiones. Si la base de datos aún no está conectada:

Las peticiones que necesiten datos fallarían con errores de conexión.

El servidor podría reportar "saludable" cuando en realidad no puede atender consultas.

Se dificulta el arranque ordenado y la detección temprana de fallos.

Al esperar connectDatabase (con await), se garantiza que la aplicación solo empiece a escuchar cuando la dependencia crítica esté lista. Si la conexión falla, el proceso puede abortar con un error claro en lugar de quedar en un estado inconsistente.

5. ¿Qué comprueba readyState y qué añade el comando ping?
   readyState es una propiedad de la conexión de Mongoose que indica el estado actual de la conexión con MongoDB. Sus valores típicos son: 0 (desconectado), 1 (conectado), 2 (conectando), 3 (desconectando). Comprueba si la conexión existe y está activa, pero no verifica que el servidor responda en ese instante.

ping es un comando administrativo que se envía a MongoDB y que el servidor debe responder. Añade una verificación activa de que la base de datos está viva y responde, no solo que la conexión figure como establecida. Es útil para detectar fallos de red o servidores caídos que readyState podría no reflejar de inmediato.

En conjunto, readyState da el estado local de la conexión y ping confirma la salud real del servidor.

6. ¿Por qué una falla de MongoDB corresponde a infraestructura y no a validación HTTP?
   Porque el error no depende de la petición del cliente ni de los datos que envió. Una falla de MongoDB (conexión caída, timeout, servidor no disponible) es un problema del entorno de ejecución o de la infraestructura que soporta la API.

La validación HTTP se ocupa de verificar que la petición esté bien formada, que los datos cumplan reglas de negocio, que los tipos sean correctos, etc. Si MongoDB falla, la petición podría ser perfectamente válida y aun así no poder atenderse.

Por eso, en una API bien diseñada, los errores de infraestructura se mapean a códigos como 500 Internal Server Error o 503 Service Unavailable, no a 400 Bad Request.

7. ¿Cómo llega un AppError lanzado por getDatabaseHealth al manejador central en Express 5?
   En Express 5, los errores lanzados dentro de funciones async se propagan automáticamente al middleware de manejo de errores (el que tiene cuatro parámetros: err, req, res, next). Esto es una mejora respecto a Express 4, donde había que envolver con try/catch o usar next(err).

El flujo es:

getDatabaseHealth lanza un AppError (o una promesa rechazada).

Express 5 detecta el rechazo y lo envía automáticamente al manejador central.

El manejador central recibe el AppError, lee su statusCode y su mensaje, y responde al cliente con el formato de error adecuado.

Así, el manejador central actúa como único punto de respuesta ante errores, evitando repetir lógica en cada controlador.

8. ¿Qué pruebas demuestran que la incorporación de Atlas no rompió la API anterior?
   Las pruebas que lo demuestran son las que verifican que los endpoints existentes siguen funcionando igual después de añadir la capa de MongoDB. Por ejemplo:

Pruebas de integración que hacen GET /tasks, POST /tasks, PATCH /tasks/:id, etc., y comprueban que devuelven los códigos y cuerpos esperados.

Pruebas del endpoint de salud (/health) que verifican que responde 200 cuando la base está conectada.

Pruebas que simulan fallos de conexión y comprueban que la API responde con error controlado sin caerse.

Pruebas de regresión que se ejecutan antes y después del cambio para asegurar que el comportamiento previo se mantiene.

Si todas pasan, se confirma que la incorporación de Atlas fue compatible con la API anterior.

9. ¿Por qué el arreglo en memoria se conserva todavía en esta actividad?
   Porque sirve como capa de respaldo o fallback y como referencia de compatibilidad. Mantenerlo permite:

Que la API siga funcionando aunque MongoDB no esté disponible (modo degradado).

Comparar el comportamiento del nuevo almacenamiento con el anterior.

Facilitar pruebas y desarrollo sin depender de una conexión real a Atlas.

Migrar de forma incremental, sin romper lo que ya existía.

En esta actividad, el arreglo en memoria actúa como puente entre la versión anterior y la nueva integración con MongoDB.

10. ¿Qué información debe ocultarse al cliente cuando ocurre un error de conexión?
    Debe ocultarse toda la información sensible o interna, como:

La cadena de conexión (MONGODB_URI), incluidos usuario y contraseña.

El host, puerto y nombre de la base de datos.

Stack traces o mensajes internos de Mongoose/MongoDB.

Detalles de configuración del servidor o de la red.

Nombres de colecciones o esquemas internos.
