import { Response } from 'express';
import { TypedRequest } from '../../utils/zod';
import { UsersManager } from './manager';
import { getByIdRequestSchema } from './validations';
import { registerRequestSchema } from '../authentication/validations';

export class UsersController {
    static createOne = async (req: TypedRequest<typeof registerRequestSchema>, res: Response) => {
        res.json(await UsersManager.createOne(req.body));
    };

    static getById = async (req: TypedRequest<typeof getByIdRequestSchema>, res: Response) => {
        res.json(await UsersManager.getById(req.user._id));
    };
}