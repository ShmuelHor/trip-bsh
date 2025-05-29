import { z } from 'zod';

export const zodMongoObjectId = z.string().regex(/^[0-9a-fA-F]{24}$/, {
    message: 'Invalid ObjectId',
});

export const tripSchema = z
    .object({
        name: z.string().min(1, { message: 'Name is required' }),
        phonenumbers: z.array(
            z.string().regex(/^(\+?\d{9,15})$/, { message: 'Invalid phone number format' })
        ),
        startDate: z.coerce.date(),
        endDate: z.coerce.date(),
    })
    .refine((data) => data.endDate > data.startDate, {
        message: 'End date must be after start date',
        path: ['endDate'],
    });


export const createOneRequestSchema = z.object({
    body: tripSchema,
    query: z.object({}),
    params: z.object({}),
});

export const getAllTripsByUserIdRequestSchema = z.object({
    body: z.object({}),
    query: z.object({}),
    params: z.object({}),
});

export const getByIdRequestSchema = z.object({
    body: z.object({}),
    query: z.object({}),
    params: z.object({
        id: zodMongoObjectId,
    }),
});

export const getSummaryOfTripRequestSchema = z.object({
    body: z.object({}),
    query: z.object({}),
    params: z.object({
        id: zodMongoObjectId,
    }),
});
