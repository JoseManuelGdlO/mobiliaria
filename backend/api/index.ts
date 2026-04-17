import express, { Express, Request, Response, Application } from 'express';
import dotenv from 'dotenv';
import cors from 'cors'
const jwt = require('jsonwebtoken');
const eventsRouter = require("./routes/events");
const inventaryRouter = require("./routes/inventary");
const authRouter = require("./routes/auth");
const workersRouter = require("./routes/workers");
const clientsRouter = require("./routes/clients");
const paymentsRouter = require("./routes/payments"); 
const expensesRouter = require("./routes/expenses");
const reportsRouter = require("./routes/reports");
// const durangRouter = require("./routes/durangeneidad");
const recommendationsRouter = require("./routes/recommendations");
const quotesRouter = require("./routes/quotes");
import { requestTiming } from "./middleware/requestTiming";
import { config } from "./config";
import { sequelizeMain } from "./services/sequelize";

//For env File 
dotenv.config();

const app: Application = express();
const port = Number(process.env.PORT || 8000);
const http = require('http').Server(app);
const io = require('socket.io')(http, {
  cors: {
    origin: config.socketCorsOrigin,
    credentials: true,
  },
});

const companyRoom = (idEmpresa: number) => `empresa_${idEmpresa}`;
const presenceByWorker = new Map<number, any>();
const eventWindowBySocket = new Map<string, { count: number; startedAt: number }>();
const metrics = {
  totalConnections: 0,
  activeConnections: 0,
  locationPackets: 0,
  authFailures: 0,
  rateLimited: 0,
};

const buildPresenceSync = (idEmpresa: number) => {
  const now = Date.now();
  return Array.from(presenceByWorker.values())
    .filter((entry: any) => entry?.user?.id_empresa === idEmpresa)
    .map((entry: any) => ({
      ...entry,
      isOnline: now - entry.lastSeenAt <= config.presenceTtlMs,
    }));
};

const isValidLocationPayload = (payload: any) => {
  const lat = Number(payload?.location?.coords?.latitude);
  const lng = Number(payload?.location?.coords?.longitude);
  const accuracy = Number(payload?.location?.coords?.accuracy);
  const userId = Number(payload?.user?.id_usuario);
  const empresaId = Number(payload?.user?.id_empresa);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return false;
  if (!Number.isFinite(userId) || !Number.isFinite(empresaId)) return false;
  if (Math.abs(lat) > 90 || Math.abs(lng) > 180) return false;
  if (Number.isFinite(accuracy) && accuracy > 500) return false;
  return true;
};

const consumeRateLimit = (socketId: string) => {
  const now = Date.now();
  const current = eventWindowBySocket.get(socketId);
  if (!current || now - current.startedAt > config.socketRateLimitWindowMs) {
    eventWindowBySocket.set(socketId, { count: 1, startedAt: now });
    return true;
  }
  if (current.count >= config.socketRateLimitMaxEvents) {
    return false;
  }
  current.count += 1;
  eventWindowBySocket.set(socketId, current);
  return true;
};

io.use((socket: any, next: any) => {
  try {
    const token =
      socket?.handshake?.auth?.token ||
      socket?.handshake?.headers?.authorization?.split(' ')[1];
    if (!token) {
      metrics.authFailures += 1;
      return next(new Error('unauthorized'));
    }
    jwt.verify(token, config.jwtSecret, (err: any, authData: any) => {
      if (err || !authData?.data?.id_usuario || !authData?.data?.id_empresa) {
        metrics.authFailures += 1;
        return next(new Error('unauthorized'));
      }
      socket.user = authData.data;
      next();
    });
  } catch (error) {
    metrics.authFailures += 1;
    next(new Error('unauthorized'));
  }
});

io.on('connect', (socket: any) => {
  metrics.totalConnections += 1;
  metrics.activeConnections += 1;

  const idEmpresa = Number(socket.user.id_empresa);
  const idUsuario = Number(socket.user.id_usuario);
  socket.join(companyRoom(idEmpresa));
  socket.emit('presence:sync', buildPresenceSync(idEmpresa));

  const handleLocationUpdate = (payload: any) => {
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
  socket.on('location', (payload: any) => {
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
  const now = Date.now();
  for (const [workerId, item] of presenceByWorker.entries()) {
    if (now - item.lastSeenAt > config.presenceTtlMs) {
      presenceByWorker.delete(workerId);
      io.to(companyRoom(Number(item?.user?.id_empresa))).emit(
        'presence:sync',
        buildPresenceSync(Number(item?.user?.id_empresa))
      );
    }
  }
}, Math.max(5000, Math.floor(config.presenceTtlMs / 2)));

setInterval(() => {
  console.log('[realtime]', {
    activeConnections: metrics.activeConnections,
    trackedWorkers: presenceByWorker.size,
    locationPackets: metrics.locationPackets,
    rateLimited: metrics.rateLimited,
  });
}, 60000);

app.use(cors());
app.use(requestTiming);
app.use(express.json({ limit: '25mb' }));
app.use(
    express.urlencoded({
        extended: true,
        limit: '25mb'
    })
);

app.get("/", (req, res) => {
    res.json({ message: "version: 0.4.7" });
});

app.get("/metrics/realtime", (req, res) => {
  res.json({
    ...metrics,
    trackedWorkers: presenceByWorker.size,
    updatedAt: Date.now(),
  });
});

app.use("/auth", authRouter);
app.use("/events", eventsRouter);
app.use("/inventary", inventaryRouter);
app.use("/workers", workersRouter);
app.use("/clients", clientsRouter);
app.use("/payments", paymentsRouter);
app.use("/expenses", expensesRouter);
app.use("/reports", reportsRouter);
app.use("/recommendations", recommendationsRouter);
app.use("/quotes", quotesRouter);


// Durangeneidad disabled by request.
// app.use("/durangeneidad", durangRouter);
/* Error handler middleware */
app.use((err: any, req: any, res: any, next: any) => {
    const statusCode = err.statusCode || 500;
    console.error(err.message, err.stack);
    res.status(statusCode).json({ message: err.message });
    return;
});

const bootstrap = async () => {
  try {
    await sequelizeMain.authenticate();
    console.log("Sequelize connected to main database");

    http.listen(port, () => {
      console.log(`Example app listening at YOUR_IP_INSTANCE:${port}`);
      console.log('version: 0.4.7');
      console.log(`Socket.IO enabled on port ${port}`);
    });
  } catch (error) {
    console.error("Failed to initialize Sequelize connections", error);
    process.exit(1);
  }
};

bootstrap();
