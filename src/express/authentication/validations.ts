import { z } from 'zod';

export const zodMongoObjectId = z.string().regex(/^[0-9a-fA-F]{24}$/, {
    message: 'Invalid ObjectId',
});

const userFields = z.object({
    fullname: z.string().min(1, { message: 'Full name is required' }),
    username: z.string().min(3, { message: 'Username must be at least 3 characters' }).max(20),
    email: z.string().email({ message: 'Invalid email address' }),
    password: z.string().min(8, { message: 'Password must be at least 8 characters' }).max(20),
    phonenumber: z.string().min(10, { message: 'Phone number too short' }).max(15, { message: 'Phone number too long' }),
});

const loginFields = z.object({
    email: z.string().email({ message: 'Invalid email address' }),
    password: z.string().min(8, { message: 'Password must be at least 8 characters' }).max(20),
});

export const loginRequestSchema = z.object({
    body: loginFields,
    query: z.object({}),
    params: z.object({}),
});

export const registerRequestSchema = z.object({
    body: userFields,
    query: z.object({}),
    params: z.object({}),
});
