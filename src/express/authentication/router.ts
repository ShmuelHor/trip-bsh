import { Router } from 'express';
import { validateRequest, wrapController } from '../../utils/express/wrappers';
import { UsersController } from '../users/controller';
import { AuthenticationController } from './controller';
import { loginRequestSchema, registerRequestSchema } from './validations';

export const authenticationRouter = Router();
authenticationRouter.post('/login', validateRequest(loginRequestSchema), wrapController(AuthenticationController.login));
authenticationRouter.post('/register', validateRequest(registerRequestSchema), wrapController(UsersController.createOne));
