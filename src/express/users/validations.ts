import { z } from 'zod';

export const zodMongoObjectId = z.string().regex(/^[0-9a-fA-F]{24}$/, { message: 'Invalid ObjectId' });

const userFields = z.object({
    username: z.string().min(3, { message: 'Username must be at least 3 characters' }).max(20),
    email: z.string().email({ message: 'Invalid email address' }),
    password: z.string().min(8, { message: 'Password must be at least 8 characters' }).max(20),
    phonenumber: z.string().min(10, { message: 'Phone number too short' }).max(15, { message: 'Phone number too long' }),
});

export const getByIdRequestSchema = z.object({
    body: z.object({}),
    query: z.object({}),
    params: z.object({
        id: zodMongoObjectId,
    }),
});
