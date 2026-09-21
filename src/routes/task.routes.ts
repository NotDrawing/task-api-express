import { Router } from 'express';
import {
    getTask,
    getTasks,
    patchTaskComplete,
    postTask,
    removeTask
} from '../controllers/task.controller.js';
import { requireJson } from '../middleware/require-json.middleware.js';
import { validateTaskId } from '../middleware/validate-task.middleware.js';
import { validateTaskTitle } from '../middleware/validate-task-title.middleware.js';

export const taskRouter = Router();

taskRouter.param('id', validateTaskId);

taskRouter.get('/', getTasks);
taskRouter.get('/:id', getTask);
taskRouter.post('/', requireJson, validateTaskTitle, postTask);
taskRouter.patch('/:id/complete', patchTaskComplete);
taskRouter.delete('/:id', removeTask);