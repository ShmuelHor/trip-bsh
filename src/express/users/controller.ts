import { Response } from 'express';
import { TypedRequest } from '../../utils/zod';
import { UsersManager } from './manager';
import { getByIdRequestSchema } from './validations';

export class UsersController {
    static getById = async (req: TypedRequest<typeof getByIdRequestSchema>, res: Response) => {
        const { id } = req.params;
        res.json(await UsersManager.getById(id));
    };
}
