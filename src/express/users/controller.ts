import { Response } from 'express';
import { TypedRequest } from '../../utils/zod';
import { UsersManager } from './manager';
import { createOneRequestSchema, getAllRequestSchema, getByIdRequestSchema } from './validations';

export class UsersController {
    static getALL = async (_req: TypedRequest<typeof getAllRequestSchema>, res: Response) => {
        res.json(await UsersManager.getAll());
    };

    static createOne = async (req: TypedRequest<typeof createOneRequestSchema>, res: Response) => {
        res.json(await UsersManager.createOne(req.body));
    };

    static getById = async (req: TypedRequest<typeof getByIdRequestSchema>, res: Response) => {
        const { id } = req.params;
        res.json(await UsersManager.getById(id));
    };
}
