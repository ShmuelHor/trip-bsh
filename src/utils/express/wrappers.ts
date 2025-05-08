/* eslint-disable promise/no-callback-in-promise */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { NextFunction, Request, Response } from 'express';
import { AnyZodObject } from 'zod';
import { TypedRequest } from '../zod';

export const wrapMiddleware = (func: (req: Request, res?: Response) => Promise<void>) => {
    return (req: Request, res: Response, next: NextFunction) => {
        func(req, res).then(next).catch(next);
    };
};

export const wrapController = (func: (req: TypedRequest<AnyZodObject>, res: Response, next?: NextFunction) => Promise<void>) => {
    return (req: Request, res: Response, next: NextFunction) => {
        func(req, res, next).catch(next);
    };
};

export const validateRequest = (schema: AnyZodObject) => {
    return wrapMiddleware(async (req: Request) => {
        const { body, query, params } = req;
        const { body: parsedBody, query: parsedQuery, params: parsedParams } = await schema.parseAsync({ body, query, params });

        req.body = parsedBody;
        req.query = parsedQuery;
        req.params = parsedParams;
    });
};
