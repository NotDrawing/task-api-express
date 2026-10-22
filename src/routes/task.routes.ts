import { Router } from 'express';
import {
    getTask,
    getTasks,
    patchTask,
    patchTaskComplete,
    postTask,
    removeTask
} from '../controllers/task.controller.js';
import { requireJson } from '../middleware/require-json.middleware.js';
import { validateTaskCreate } from '../middleware/validate-task-create.middleware.js';
import { validateTaskId } from '../middleware/validate-task-id.middleware.js';
import { validateTaskUpdate } from '../middleware/validate-task-update.middleware.js';

export const taskRouter = Router();

taskRouter.param('id', validateTaskId);

taskRouter.get('/', getTasks);
taskRouter.get('/:id', getTask);
taskRouter.post('/', requireJson, validateTaskCreate, postTask);
taskRouter.patch('/:id', requireJson, validateTaskUpdate, patchTask);
taskRouter.patch('/:id/complete', patchTaskComplete);
taskRouter.delete('/:id', removeTask);