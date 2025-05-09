import { Response } from 'express';
import { TypedRequest } from '../../utils/zod';
import { UsersManager } from './manager';
import { getByIdRequestSchema } from './validations';
import { registerRequestSchema } from '../authentication/validations';
import { console } from 'inspector';

export class UsersController {
    static createOne = async (req: TypedRequest<typeof registerRequestSchema>, res: Response) => {
        console.log('createOne', req.body);
        res.json(await UsersManager.createOne(req.body));
    };

    static getById = async (req: TypedRequest<typeof getByIdRequestSchema>, res: Response) => {
        const { id } = req.params;
        res.json(await UsersManager.getById(id));
    };
}
