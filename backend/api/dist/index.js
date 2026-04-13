"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const jwt = require('jsonwebtoken');
const eventsRouter = require("./routes/events");
const inventaryRouter = require("./routes/inventary");
const authRouter = require("./routes/auth");
const workersRouter = require("./routes/workers");
const clientsRouter = require("./routes/clients");
const paymentsRouter = require("./routes/payments");
const reportsRouter = require("./routes/reports");
const durangRouter = require("./routes/durangeneidad");
const recommendationsRouter = require("./routes/recommendations");
const quotesRouter = require("./routes/quotes");
const requestTiming_1 = require("./middleware/requestTiming");
const config_1 = require("./config");
//For env File 
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = Number(process.env.PORT || 8000);
const http = require('http').Server(app);
const io = require('socket.io')(http, {
    cors: {
        origin: config_1.config.socketCorsOrigin,
        credentials: true,
    },
});
const companyRoom = (idEmpresa) => `empresa_${idEmpresa}`;
const presenceByWorker = new Map();
const eventWindowBySocket = new Map();
const metrics = {
    totalConnections: 0,
    activeConnections: 0,
    locationPackets: 0,
    authFailures: 0,
    rateLimited: 0,
};
const buildPresenceSync = (idEmpresa) => {
    const now = Date.now();
    return Array.from(presenceByWorker.values())
        .filter((entry) => { var _a; return ((_a = entry === null || entry === void 0 ? void 0 : entry.user) === null || _a === void 0 ? void 0 : _a.id_empresa) === idEmpresa; })
        .map((entry) => (Object.assign(Object.assign({}, entry), { isOnline: now - entry.lastSeenAt <= config_1.config.presenceTtlMs })));
};
const isValidLocationPayload = (payload) => {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    const lat = Number((_b = (_a = payload === null || payload === void 0 ? void 0 : payload.location) === null || _a === void 0 ? void 0 : _a.coords) === null || _b === void 0 ? void 0 : _b.latitude);
    const lng = Number((_d = (_c = payload === null || payload === void 0 ? void 0 : payload.location) === null || _c === void 0 ? void 0 : _c.coords) === null || _d === void 0 ? void 0 : _d.longitude);
    const accuracy = Number((_f = (_e = payload === null || payload === void 0 ? void 0 : payload.location) === null || _e === void 0 ? void 0 : _e.coords) === null || _f === void 0 ? void 0 : _f.accuracy);
    const userId = Number((_g = payload === null || payload === void 0 ? void 0 : payload.user) === null || _g === void 0 ? void 0 : _g.id_usuario);
    const empresaId = Number((_h = payload === null || payload === void 0 ? void 0 : payload.user) === null || _h === void 0 ? void 0 : _h.id_empresa);
    if (!Number.isFinite(lat) || !Number.isFinite(lng))
        return false;
    if (!Number.isFinite(userId) || !Number.isFinite(empresaId))
        return false;
    if (Math.abs(lat) > 90 || Math.abs(lng) > 180)
        return false;
    if (Number.isFinite(accuracy) && accuracy > 500)
        return false;
    return true;
};
const consumeRateLimit = (socketId) => {
    const now = Date.now();
    const current = eventWindowBySocket.get(socketId);
    if (!current || now - current.startedAt > config_1.config.socketRateLimitWindowMs) {
        eventWindowBySocket.set(socketId, { count: 1, startedAt: now });
        return true;
    }
    if (current.count >= config_1.config.socketRateLimitMaxEvents) {
        return false;
    }
    current.count += 1;
    eventWindowBySocket.set(socketId, current);
    return true;
};
io.use((socket, next) => {
    var _a, _b, _c, _d, _e;
    try {
        const token = ((_b = (_a = socket === null || socket === void 0 ? void 0 : socket.handshake) === null || _a === void 0 ? void 0 : _a.auth) === null || _b === void 0 ? void 0 : _b.token) ||
            ((_e = (_d = (_c = socket === null || socket === void 0 ? void 0 : socket.handshake) === null || _c === void 0 ? void 0 : _c.headers) === null || _d === void 0 ? void 0 : _d.authorization) === null || _e === void 0 ? void 0 : _e.split(' ')[1]);
        if (!token) {
            metrics.authFailures += 1;
            return next(new Error('unauthorized'));
        }
        jwt.verify(token, config_1.config.jwtSecret, (err, authData) => {
            var _a, _b;
            if (err || !((_a = authData === null || authData === void 0 ? void 0 : authData.data) === null || _a === void 0 ? void 0 : _a.id_usuario) || !((_b = authData === null || authData === void 0 ? void 0 : authData.data) === null || _b === void 0 ? void 0 : _b.id_empresa)) {
                metrics.authFailures += 1;
                return next(new Error('unauthorized'));
            }
            socket.user = authData.data;
            next();
        });
    }
    catch (error) {
        metrics.authFailures += 1;
        next(new Error('unauthorized'));
    }
});
io.on('connect', (socket) => {
    metrics.totalConnections += 1;
    metrics.activeConnections += 1;
    const idEmpresa = Number(socket.user.id_empresa);
    const idUsuario = Number(socket.user.id_usuario);
    socket.join(companyRoom(idEmpresa));
    socket.emit('presence:sync', buildPresenceSync(idEmpresa));
    const handleLocationUpdate = (payload) => {
        if (!consumeRateLimit(socket.id)) {
            metrics.rateLimited += 1;
            socket.emit('error', { code: 'rate_limited' });
            return false;
        }
        if (!isValidLocationPayload(payload)) {
            socket.emit('error', { code: 'invalid_payload' });
            return false;
        }
        metrics.locationPackets += 1;
        const locationPayload = {
            id: idUsuario,
            user: payload.user,
            location: payload.location,
            lastSeenAt: Date.now(),
            source: 'ws',
        };
        presenceByWorker.set(idUsuario, locationPayload);
        io.to(companyRoom(idEmpresa)).emit('presence:sync', buildPresenceSync(idEmpresa));
        return true;
    };
    socket.on('location:update', handleLocationUpdate);
    // Backward-compatible legacy event name.
    socket.on('location', (payload) => {
        socket.emit('deprecation', { use: 'location:update' });
        handleLocationUpdate(payload);
    });
    socket.on('disconnect', () => {
        metrics.activeConnections = Math.max(0, metrics.activeConnections - 1);
        eventWindowBySocket.delete(socket.id);
        presenceByWorker.delete(idUsuario);
        io.to(companyRoom(idEmpresa)).emit('presence:sync', buildPresenceSync(idEmpresa));
    });
});
setInterval(() => {
    var _a, _b;
    const now = Date.now();
    for (const [workerId, item] of presenceByWorker.entries()) {
        if (now - item.lastSeenAt > config_1.config.presenceTtlMs) {
            presenceByWorker.delete(workerId);
            io.to(companyRoom(Number((_a = item === null || item === void 0 ? void 0 : item.user) === null || _a === void 0 ? void 0 : _a.id_empresa))).emit('presence:sync', buildPresenceSync(Number((_b = item === null || item === void 0 ? void 0 : item.user) === null || _b === void 0 ? void 0 : _b.id_empresa)));
        }
    }
}, Math.max(5000, Math.floor(config_1.config.presenceTtlMs / 2)));
setInterval(() => {
    console.log('[realtime]', {
        activeConnections: metrics.activeConnections,
        trackedWorkers: presenceByWorker.size,
        locationPackets: metrics.locationPackets,
        rateLimited: metrics.rateLimited,
    });
}, 60000);
app.use((0, cors_1.default)());
app.use(requestTiming_1.requestTiming);
app.use(express_1.default.json({ limit: '25mb' }));
app.use(express_1.default.urlencoded({
    extended: true,
    limit: '25mb'
}));
app.get("/", (req, res) => {
    res.json({ message: "version: 0.4.3" });
});
app.get("/metrics/realtime", (req, res) => {
    res.json(Object.assign(Object.assign({}, metrics), { trackedWorkers: presenceByWorker.size, updatedAt: Date.now() }));
});
app.use("/auth", authRouter);
app.use("/events", eventsRouter);
app.use("/inventary", inventaryRouter);
app.use("/workers", workersRouter);
app.use("/clients", clientsRouter);
app.use("/payments", paymentsRouter);
app.use("/reports", reportsRouter);
app.use("/recommendations", recommendationsRouter);
app.use("/quotes", quotesRouter);
app.use("/durangeneidad", durangRouter);
/* Error handler middleware */
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    console.error(err.message, err.stack);
    res.status(statusCode).json({ message: err.message });
    return;
});
http.listen(port, () => {
    console.log(`Example app listening at YOUR_IP_INSTANCE:${port}`);
    console.log('version: 0.4.3');
    console.log(`Socket.IO enabled on port ${port}`);
});
