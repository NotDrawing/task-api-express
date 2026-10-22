# Pruebas del CRUD persistente

## Entorno

- Rama: feature/crud-persistente-completo
- Base: task_api
- Colección: tasks
- Resultado de pnpm check:
- Resultado de pnpm build:

## Recurso de prueba

- id devuelto por POST:
- title inicial:
- title final:
- status final:
- Persistencia después de reiniciar:

## Casos ejecutados

| Tipo      | Método y ruta                 | Datos                  | Esperado | Obtenido | requestId | Resultado |
| --------- | ----------------------------- | ---------------------- | -------- | -------- | --------- | --------- |
| Positiva  | POST /api/tasks               | {"title":"Tarea"}      | 201      |          |           |           |
| Positiva  | PATCH /api/tasks/:id          | {"status":"completed"} | 200      |          |           |           |
| Negativa  | PATCH /api/tasks/:id          | cuerpo vacío           | 422      |          |           |           |
| Negativa  | PATCH /api/tasks/:id          | JSON mal formado       | 400      |          |           |           |
| Negativa  | PATCH /api/tasks/:id          | sin application/json   | 415      |          |           |           |
| Negativa  | GET /api/tasks                | Atlas no disponible    | 503      |          |           |           |
| Regresión | PATCH /api/tasks/:id/complete | sin cuerpo             | 200      |          |           |           |

## Evidencias

1. Compilación correcta.
2. Documento antes y después de PATCH en Atlas.
3. Respuesta 204 sin cuerpo.
4. Error de validación con requestId.
5. Consulta después de reiniciar.
