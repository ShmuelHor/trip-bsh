import { z } from 'zod';

export const zodMongoObjectId = z.string().regex(/^[0-9a-fA-F]{24}$/, {
    message: 'Invalid ObjectId',
});

export const tripSchema = z
    .object({
        name: z.string().min(1, { message: 'Name is required' }),
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

export const addUserToPendingApprovalRequestSchema = z.object({
    body: z.object({}),
    query: z.object({}),
    params: z.object({
        tripId: zodMongoObjectId,
    }),
});

export const updateTripParticipantsRequestSchema = z.object({
    body: z.object({}),
    query: z.object({}),
    params: z.object({
        tripId: zodMongoObjectId,
        userId: zodMongoObjectId,
    }),
});
