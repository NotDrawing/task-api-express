import mongoose, { type HydratedDocument } from 'mongoose';
import { AppError } from '../errors/app-error.js';
import {
    TaskModel,
    type Task,
    type TaskPersistence
} from '../models/task.js';

// Convierte el documento de Mongoose en la forma pública (_id -> id)
const toTask = (document: HydratedDocument<TaskPersistence>): Task => ({
    id: document._id.toString(),
    title: document.title,
    status: document.status,
    createdAt: document.createdAt,
    updatedAt: document.updatedAt
});

// Traduce errores de Mongoose a AppError sin exponer detalles internos
const mapPersistenceError = (error: unknown): AppError => {
    if (error instanceof AppError) return error;

    if (error instanceof mongoose.Error.ValidationError) {
        const details = Object.values(error.errors).map((item) => ({
            field: item.path,
            message: item.message
        }));
        return new AppError(
            'La tarea no cumple las reglas del modelo.',
            422,
            'PERSISTENCE_VALIDATION_ERROR',
            details
        );
    }

    return new AppError(
        'No fue posible acceder al almacenamiento de tareas.',
        503,
        'DATABASE_UNAVAILABLE'
    );
};

const notFound = (id: string): AppError =>
    new AppError(`No existe una tarea con el id ${id}.`, 404, 'TASK_NOT_FOUND');

export const listTasks = async (): Promise<Task[]> => {
    try {
        const documents = await TaskModel.find().sort({ createdAt: 1 });
        return documents.map(toTask);
    } catch (error: unknown) {
        throw mapPersistenceError(error);
    }
};

export const findTaskById = async (id: string): Promise<Task> => {
    try {
        const document = await TaskModel.findById(id);
        if (!document) throw notFound(id);
        return toTask(document);
    } catch (error: unknown) {
        throw mapPersistenceError(error);
    }
};

export const createTask = async (title: string): Promise<Task> => {
    try {
        const document = await TaskModel.create({ title, status: 'pending' });
        return toTask(document);
    } catch (error: unknown) {
        throw mapPersistenceError(error);
    }
};

export const completeTask = async (id: string): Promise<Task> => {
    try {
        const document = await TaskModel.findByIdAndUpdate(
            id,
            { status: 'completed' },
            { new: true, runValidators: true }
        );
        if (!document) throw notFound(id);
        return toTask(document);
    } catch (error: unknown) {
        throw mapPersistenceError(error);
    }
};

export const deleteTask = async (id: string): Promise<void> => {
    try {
        const document = await TaskModel.findByIdAndDelete(id);
        if (!document) throw notFound(id);
    } catch (error: unknown) {
        throw mapPersistenceError(error);
    }
};