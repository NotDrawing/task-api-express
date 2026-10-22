# Reflexión: CRUD persistente con Express y MongoDB

## 1. ¿Qué operación de Mongoose corresponde a cada letra de CRUD?

- **Create (crear):** `TaskModel.create({ title, status: 'pending' })`, usada en `createTask` y expuesta con `POST /api/tasks`.
- **Read (leer):** `TaskModel.find()` para listar todas las tareas en `listTasks` y `TaskModel.findById(id)` para consultar una sola en `findTaskById`. Se exponen con `GET /api/tasks` y `GET /api/tasks/:id`.
- **Update (actualizar):** `TaskModel.findByIdAndUpdate(id, { $set: changes }, { new: true, runValidators: true })`, usada en `updateTask` y expuesta con `PATCH /api/tasks/:id`.
- **Delete (eliminar):** `TaskModel.findByIdAndDelete(id)`, usada en `deleteTask` y expuesta con `DELETE /api/tasks/:id`.

## 2. ¿Por qué se usa PATCH y no un reemplazo completo del documento?

Porque el cliente normalmente quiere cambiar solo una parte de la tarea. Por ejemplo, para marcarla como completada basta con enviar `{"status":"completed"}`, sin volver a mandar el título. Con un reemplazo completo (PUT) el cliente estaría obligado a enviar todos los campos, y si olvidara alguno, ese dato se perdería o quedaría inválido. PATCH permite enviar solo `title`, solo `status` o ambos, y el resto del documento permanece igual.

## 3. ¿Qué problema evita `$set`?

Evita sobrescribir o borrar los campos que el cliente no envió. `$set` le indica a MongoDB que modifique únicamente los campos incluidos en el objeto de cambios. Si actualizo solo el `title`, el `status` conserva su valor anterior. Sin `$set`, una operación de reemplazo podría eliminar los campos ausentes y dejar el documento incompleto.

## 4. ¿Qué efecto tienen `new: true` y `runValidators: true`?

- **`new: true`:** hace que `findByIdAndUpdate` devuelva el documento **después** de la actualización. Sin esta opción, Mongoose devuelve la versión anterior y la respuesta del PATCH mostraría datos desactualizados.
- **`runValidators: true`:** hace que Mongoose aplique las reglas del esquema (como `enum` en `status` y `maxlength` en `title`) también durante la actualización. Por defecto, las operaciones de actualización no ejecutan esas validaciones, así que un valor inválido podría guardarse.

## 5. ¿Por qué un cuerpo vacío debe rechazarse?

Porque un `PATCH` con `{}` no contiene ningún cambio, por lo que la solicitud no tiene sentido. Aceptarla respondería 200 aparentando que se actualizó algo, cuando en realidad no ocurrió nada, y ocultaría un error del cliente (por ejemplo, un formulario que no envió datos). Rechazarlo con `422 VALIDATION_ERROR` y el mensaje "Incluye al menos title o status" deja claro cuál fue el problema.

## 6. ¿Qué diferencia existe entre `INVALID_ID` y `TASK_NOT_FOUND`?

- **`INVALID_ID` (400):** el identificador está mal escrito y no tiene formato de ObjectId (24 caracteres hexadecimales). Ejemplo: `PATCH /api/tasks/1`. Se detecta en `validateTaskId` y ni siquiera se consulta MongoDB.
- **`TASK_NOT_FOUND` (404):** el identificador tiene formato válido, pero no existe ninguna tarea con ese id en la colección. Ejemplo: un ObjectId correcto de una tarea ya eliminada. Se detecta en el servicio después de consultar Atlas.

La primera es un error de formato de la solicitud; la segunda es un recurso que no existe.

## 7. ¿Qué responsabilidad cumple `validateTaskUpdate` y cuál cumple `TaskModel`?

- **`validateTaskUpdate`** protege el contrato HTTP. Revisa que el cuerpo sea un objeto JSON, que no esté vacío, que no traiga campos desconocidos (como `owner`), que el título sea texto válido de hasta 120 caracteres y que el estado sea `pending` o `completed`. Además construye un `TaskUpdate` limpio antes de llegar al servicio.
- **`TaskModel`** protege la integridad de los datos almacenados. Define el esquema con `required`, `trim`, `maxlength` y `enum`, y actúa como segunda barrera para cualquier operación que llegue a Mongoose, aunque no pase por HTTP.

Son dos capas complementarias: la primera rechaza rápido y con mensajes claros para el cliente; la segunda garantiza que la base de datos nunca reciba datos inválidos.

## 8. ¿Cómo llega un error de `updateTask` al `errorHandler` de Express 5?

1. La solicitud `PATCH` pasa por `taskRouter`, `validateTaskId`, `requireJson` y `validateTaskUpdate`.
2. `patchTask` llama a `await updateTask(...)`.
3. Si el documento no existe o falla la base de datos, `updateTask` lanza un `AppError` (404, 422 o 503) gracias a `mapPersistenceError`.
4. Como `patchTask` es una función `async`, el `throw` convierte su promesa en una promesa rechazada.
5. Express 5 detecta automáticamente esa promesa rechazada, omite los middleware normales y entrega el error al `errorHandler`.
6. El `errorHandler` responde con `code`, `message`, `details` y `requestId`, sin exponer stack ni la URI de conexión.

No hace falta usar `try/catch` ni `next(error)` en el controlador.

## 9. ¿Por qué `DELETE` responde 204 sin cuerpo?

Porque el código 204 (No Content) significa que la operación fue exitosa y que no hay contenido que devolver. Una vez eliminado, el recurso ya no existe, así que no hay nada útil que enviar en un JSON. Por eso el controlador usa `res.status(204).send()` y no `res.json()`. La confirmación de que se eliminó se obtiene al consultar el mismo id y recibir `404 TASK_NOT_FOUND`.

## 10. ¿Qué prueba demuestra que el CRUD es persistente y no solo funcional en memoria?

La prueba de reinicio: crear una tarea, actualizar su título, guardar el id, detener la API con `Ctrl+C`, volver a iniciarla con `pnpm dev` y consultar `GET /api/tasks/{{taskId}}`. Si el título actualizado sigue ahí, significa que los datos no dependían de la memoria del proceso de Node.js, sino que están guardados en la colección `tasks` de MongoDB Atlas. También se puede confirmar viendo el documento directamente en Atlas Data Explorer.
