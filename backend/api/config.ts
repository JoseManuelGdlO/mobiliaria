import dotenv from 'dotenv';

dotenv.config();

function parseFirebaseCredentials() {
    const raw = process.env.FIREBASE_CREDENTIALS;
    if (!raw) {
        return null;
    }
    try {
        return JSON.parse(raw);
    } catch {
        throw new Error('FIREBASE_CREDENTIALS must be a valid JSON string');
    }
}

export const config = {
    db: {
        host: process.env.DB_HOST || "",
        user: process.env.DB_USER || "",
        password: process.env.DB_PASSWORD || "",
        database: process.env.DB_NAME || "",
    },
    dbDurangeneidad: {
        host: process.env.DB_DGO_HOST || "",
        user: process.env.DB_DGO_USER || "",
        password: process.env.DB_DGO_PASSWORD || "",
        database: process.env.DB_DGO_NAME || "",
    },
    jwtSecret: process.env.JWT_SECRET || '',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '15m',
    jwtRefreshExpiresInDays: Number(process.env.JWT_REFRESH_EXPIRES_IN_DAYS || 30),
    socketPort: Number(process.env.SOCKET_PORT || process.env.PORT || 3000),
    socketCorsOrigin: process.env.SOCKET_CORS_ORIGIN || '*',
    presenceTtlMs: Number(process.env.PRESENCE_TTL_MS || 60000),
    socketRateLimitWindowMs: Number(process.env.SOCKET_RATE_LIMIT_WINDOW_MS || 60000),
    socketRateLimitMaxEvents: Number(process.env.SOCKET_RATE_LIMIT_MAX_EVENTS || 180),
    recommendationItemsLimit: Number(process.env.RECOMMENDATION_ITEMS_LIMIT || 8),
    recommendationPackagesLimit: Number(process.env.RECOMMENDATION_PACKAGES_LIMIT || 3),
    defaultLogisticsFee: Number(process.env.DEFAULT_LOGISTICS_FEE || 0),
    listPerPage: 10,
    firebaseCredentials: parseFirebaseCredentials(),
};
