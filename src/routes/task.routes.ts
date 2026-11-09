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
import { validateTaskId } from '../middleware/validate-task-id.middleware.js';
import { validateTaskQuery } from '../middleware/validate-task-query.middleware.js';
import { validateTaskTitle } from '../middleware/validate-task-title.middleware.js';
import { validateTaskUpdate } from '../middleware/validate-task-update.middleware.js';

export const taskRouter = Router();

taskRouter.param('id', validateTaskId);

taskRouter.get('/', validateTaskQuery, getTasks);
taskRouter.get('/:id', getTask);
taskRouter.post('/', requireJson, validateTaskTitle, postTask);
taskRouter.patch('/:id', requireJson, validateTaskUpdate, patchTask);
taskRouter.patch('/:id/complete', patchTaskComplete);
taskRouter.delete('/:id', removeTask);