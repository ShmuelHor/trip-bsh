import { Response } from 'express';
import { TypedRequest } from '../../utils/zod';
import { registerRequestSchema } from '../authentication/validations';
import { UsersManager } from './manager';
import { getByIdRequestSchema } from './validations';

export class UsersController {
    static createOne = async (req: TypedRequest<typeof registerRequestSchema>, res: Response) => {
        res.json(await UsersManager.createOne(req.body));
    };

    static getById = async (req: TypedRequest<typeof getByIdRequestSchema>, res: Response) => {
        res.json(await UsersManager.getById(req.user._id));
    };
}
