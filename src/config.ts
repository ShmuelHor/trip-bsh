import 'dotenv/config';
import env from 'env-var';

export const config = {
    service: {
        port: env.get('PORT').default(3000).asPortNumber(),
    },
    users: {
        baseRoute: env.get('USERS_BASE_ROUTE').default('/api/users').asString(),
        mongo: {
            uri: env.get('USERS_MONGO_URI').required().asString(),
            usersCollectionName: env.get('USERS_COLLECTION_NAME').default('users').asString(),
        },
    },
    trips: {
        baseRoute: env.get('TRIPS_BASE_ROUTE').default('/api/trips').asString(),
        mongo: {
            uri: env.get('TRIPS_MONGO_URI').required().asString(),
            tripsCollectionName: env.get('TRIPS_COLLECTION_NAME').default('trips').asString(),
        },
    },
    payments: {
        baseRoute: env.get('PAYMENTS_BASE_ROUTE').default('/api/payments').asString(),
        mongo: {
            uri: env.get('PAYMENTS_MONGO_URI').required().asString(),
            paymentsCollectionName: env.get('PAYMENTS_COLLECTION_NAME').default('payments').asString(),
        },
    },
    authentication: {
        secret_key: env.get('SECRET_KEY').default('tripbsh@secret_1234').asString(),
        token_name: env.get('TOKEN_NAME').default('tripbsh').asString(),
        baseRoute: env.get('AUTHENTICATION_BASE_ROUTE').default('/api/auth').asString(),
    },
};
