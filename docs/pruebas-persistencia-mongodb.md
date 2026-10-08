# Pruebas de modelado y persistencia

## Entorno

- Rama: feature/modelo-tareas-mongodb
- Base: task-api
- Colección: tasks
- Resultado de pnpm check: ← TU RESULTADO (ej. "Terminó sin errores")
- Resultado de pnpm build: ← TU RESULTADO (ej. "Terminó sin errores; dist/ generado")

## Documento comprobado

- id devuelto por la API: ← TU RESULTADO (24 caracteres hexadecimales)
- Campos observados en Atlas: \_id (ObjectId), title, status, createdAt, updatedAt
  (confirma que los viste y que no aparece \_\_v)
- Resultado después de reiniciar: ← TU RESULTADO (ej. "GET /api/tasks y GET /api/tasks/<id> siguen devolviendo la tarea con 200")

## Casos ejecutados

| Tipo            | Método y ruta                            | Datos                                       | Esperado                          | Obtenido       | requestId         | Resultado    |
| --------------- | ---------------------------------------- | ------------------------------------------- | --------------------------------- | -------------- | ----------------- | ------------ |
| Positiva        | GET /health/database                     | No aplica                                   | 200 connected                     | ← TU RESULTADO | No aplica         | ← OK / FALLÓ |
| Persistencia    | POST /api/tasks                          | title válido: "Diseñar el modelo de tareas" | 201                               | ← TU RESULTADO | No aplica         | ← OK / FALLÓ |
| Persistencia    | GET /api/tasks                           | No aplica                                   | 200                               | ← TU RESULTADO | No aplica         | ← OK / FALLÓ |
| Persistencia    | GET /api/tasks/{{taskId}}                | No aplica                                   | 200                               | ← TU RESULTADO | No aplica         | ← OK / FALLÓ |
| Persistencia    | GET /api/tasks (tras reiniciar)          | No aplica                                   | 200, la tarea permanece           | ← TU RESULTADO | No aplica         | ← OK / FALLÓ |
| Regresión       | PATCH /api/tasks/{{taskId}}/complete     | No aplica                                   | 200 completed                     | ← TU RESULTADO | No aplica         | ← OK / FALLÓ |
| Regresión       | DELETE /api/tasks/{{taskId}}             | No aplica                                   | 204                               | ← TU RESULTADO | No aplica         | ← OK / FALLÓ |
| Regresión       | GET /api/tasks/{{taskId}} (ya eliminada) | No aplica                                   | 404 TASK_NOT_FOUND                | ← TU RESULTADO | ← COPIA requestId | ← OK / FALLÓ |
| Negativa        | GET /api/tasks/1                         | No aplica                                   | 400 INVALID_ID                    | ← TU RESULTADO | ← COPIA requestId | ← OK / FALLÓ |
| Negativa        | POST /api/tasks                          | title vacío                                 | 422 VALIDATION_ERROR              | ← TU RESULTADO | ← COPIA requestId | ← OK / FALLÓ |
| Negativa        | POST /api/tasks                          | raw Text                                    | 415 UNSUPPORTED_MEDIA_TYPE        | ← TU RESULTADO | ← COPIA requestId | ← OK / FALLÓ |
| Infraestructura | Arranque con contraseña incorrecta       | .env alterado temporalmente                 | La API no escucha, mensaje seguro | ← TU RESULTADO | No aplica         | ← OK / FALLÓ |

## Evidencias

1. Compilación correcta: captura de `pnpm check` y `pnpm build` sin errores.
2. POST y documento visible en Atlas sin credenciales: captura de Postman (201) y de Data Explorer (base task-api → tasks) sin mostrar la URI, usuario ni contraseña. Sustituye cualquier host, usuario o secreto por [OCULTO].
3. Consulta después de reiniciar: captura de GET /api/tasks tras detener y volver a iniciar con `pnpm dev`.
4. Un error HTTP (GET /api/tasks/1 → 400 INVALID_ID), una regla del negocio (ObjectId válido inexistente → 404 TASK_NOT_FOUND) y una falla de infraestructura (contraseña incorrecta → la API no arranca).
