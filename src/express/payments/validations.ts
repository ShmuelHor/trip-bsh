import { z } from 'zod';

export const zodMongoObjectId = z.string().regex(/^[0-9a-fA-F]{24}$/, { message: 'Invalid ObjectId' });

const paymentFields = z
    .object({
        tripId: zodMongoObjectId,
        amount: z.number().min(0, { message: 'Amount must be positive' }),
        currency: z.string().min(1, { message: 'Currency is required' }),
        amountInILS: z.number().optional().or(z.literal(undefined)),
        payerId: zodMongoObjectId.optional().or(z.literal(undefined)),
        beneficiaryUserIds: z.array(zodMongoObjectId),
        description: z.string().min(1, { message: 'Description is required' }),
        paymentDate: z.coerce.date(),
    })
    .required();

export const createOneRequestSchema = z.object({
    body: paymentFields,
    query: z.object({}),
    params: z.object({}),
});

export const deleteOneRequestSchema = z.object({
    body: z.object({}),
    query: z.object({}),
    params: z.object({
        id: zodMongoObjectId,
    }),
});

export const updateOneRequestSchema = z.object({
    body: paymentFields,
    query: z.object({}),
    params: z.object({
        id: zodMongoObjectId,
    }),
});

export const getAllPaymentsByTripIdRequestSchema = z.object({
    body: z.object({}),
    query: z.object({}),
    params: z.object({
        id: zodMongoObjectId,
    }),
});
