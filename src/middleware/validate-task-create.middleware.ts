import type { NextFunction, Request, Response } from 'express';
import { AppError } from '../errors/app-error.js';
import { TASK_PRIORITIES, type TaskPriority } from '../models/task.js';
import type { FieldIssue } from '../types/api-error.js';

const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null && !Array.isArray(value);

const isTaskPriority = (value: unknown): value is TaskPriority =>
    typeof value === 'string'
    && TASK_PRIORITIES.some((priority) => priority === value);

export const validateTaskCreate = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    const body: unknown = req.body;

    if (!isRecord(body)) {
        next(new AppError(
            'La solicitud contiene datos inválidos.',
            422,
            'VALIDATION_ERROR',
            [{ field: 'body', message: 'Debe ser un objeto JSON.' }]
        ));
        return;
    }

    const issues: FieldIssue[] = [];
    let cleanTitle = '';
    let cleanPriority: TaskPriority | undefined;

    const title = body.title;
    if (typeof title !== 'string' || !title.trim()) {
        issues.push({ field: 'title', message: 'Debe ser texto no vacío.' });
    } else if (title.trim().length > 120) {
        issues.push({ field: 'title', message: 'No debe superar 120 caracteres.' });
    } else {
        cleanTitle = title.trim();
    }

    if ('priority' in body) {
        if (!isTaskPriority(body.priority)) {
            issues.push({
                field: 'priority',
                message: 'Debe ser low, medium o high.'
            });
        } else {
            cleanPriority = body.priority;
        }
    }

    if (issues.length > 0) {
        next(new AppError(
            'La solicitud contiene datos inválidos.',
            422,
            'VALIDATION_ERROR',
            issues
        ));
        return;
    }

    res.locals.taskTitle = cleanTitle;
    res.locals.taskPriority = cleanPriority;
    next();
};