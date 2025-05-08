import { z } from 'zod';

export const tripParticipantSchema = z.object({
    userId: z.string().regex(/^[0-9a-fA-F]{24}$/, { message: 'Invalid userId' }),
    balance: z.number(),
});

export const tripSchema = z
    .object({
        name: z.string().min(1, { message: 'Name is required' }),
        participants: z.array(tripParticipantSchema),
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
    params: z.object({
        id: z.string().regex(/^[0-9a-fA-F]{24}$/, { message: 'Invalid userId' }),
    }),
});

export const getByIdRequestSchema = z.object({
    body: z.object({}),
    query: z.object({}),
    params: z.object({
        id: z.string().regex(/^[0-9a-fA-F]{24}$/, { message: 'Invalid TripId' }),
    }),
});
