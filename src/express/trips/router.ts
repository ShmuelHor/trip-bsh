import { Router } from 'express';
import { validateRequest, wrapController } from '../../utils/express/wrappers';
import { TripsController } from './controller';
import { createOneRequestSchema, getAllTripsByUserIdRequestSchema } from './validations';
export const tripsRouter = Router();

tripsRouter.post('/', validateRequest(createOneRequestSchema), wrapController(TripsController.createOne));

tripsRouter.get('/ofUser', validateRequest(getAllTripsByUserIdRequestSchema), wrapController(TripsController.getAllTripsByUserId));
