import { Router } from 'express';
import { validateRequest, wrapController } from '../../utils/express/wrappers';
import { UsersController } from './controller';
import { createOneRequestSchema, getAllRequestSchema, getByIdRequestSchema } from './validations';
export const usersRouter = Router();

usersRouter.get('/', validateRequest(getAllRequestSchema), wrapController(UsersController.getALL));

usersRouter.post('/', validateRequest(createOneRequestSchema), wrapController(UsersController.createOne));

usersRouter.get(`/:id`, validateRequest(getByIdRequestSchema), wrapController(UsersController.getById));

