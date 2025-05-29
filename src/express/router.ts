import { Router } from 'express';
import { config } from '../config';
import { authenticateToken } from '../utils/express/authMiddleware';
import { authenticationRouter } from './authentication/router';
import { paymentsRouter } from './payments/router';
import { tripsRouter } from './trips/router';
import { usersRouter } from './users/router';

export const appRouter = Router();
appRouter.use(['/isAlive', '/isalive', '/health'], (_req, res) => {
    res.status(200).send('alive');
});
appRouter.use(config.authentication.baseRoute, authenticationRouter);

appRouter.use(authenticateToken);

appRouter.use(config.users.baseRoute, usersRouter);
appRouter.use(config.trips.baseRoute, tripsRouter);
appRouter.use(config.payments.baseRoute, paymentsRouter);

appRouter.use('*', (_req, res) => {
    res.status(404).send('Invalid Route');
});
