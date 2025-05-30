import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import { config } from './config';
import { appRouter } from './express/router';
import { errorMiddleware } from './utils/express/error';
import { loggerMiddleware } from './utils/logger/middleware';

const app = express();
const port = config.service.port;

app.use(
    cors({
        origin: 'https://calculatetrips.netlify.app',
    }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongoose
    .connect(config.users.mongo.uri)
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch((err) => console.error('❌ MongoDB connection error:', err.message));

app.use(loggerMiddleware);
app.use(appRouter);
app.use(errorMiddleware);

app.listen(port, () => {
    console.log(`🚀 Server running at http://localhost:${port}`);
});
