import { Router } from 'express';
import { validateRequest, wrapController } from '../../utils/express/wrappers';
import { UsersController } from './controller';
import { getByIdRequestSchema } from './validations';
export const usersRouter = Router();

usersRouter.get(`/:id`, validateRequest(getByIdRequestSchema), wrapController(UsersController.getById));
