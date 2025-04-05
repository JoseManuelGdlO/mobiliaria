"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const WebSocket = require('ws');
const eventsRouter = require("./routes/events");
const inventaryRouter = require("./routes/inventary");
const authRouter = require("./routes/auth");
const workersRouter = require("./routes/workers");
const clientsRouter = require("./routes/clients");
const paymentsRouter = require("./routes/payments");
const reportsRouter = require("./routes/reports");
const durangRouter = require("./routes/durangeneidad");
//For env File 
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 8000;
const http = require('http').Server(app);
const io = require('socket.io')(http);
let workers = [];
io.on('connect', (socket) => {
    socket.on("location", (arg) => {
        const location = arg;
        if (location.user.rol_usuario !== 'Repartidor')
            return;
        const workerIndex = workers.findIndex((worker) => worker.id === location.user.id_usuario);
        if (workerIndex !== -1) {
            workers[workerIndex] = Object.assign({ id: location.user.id_usuario }, location);
        }
        else {
            workers.push(Object.assign({ id: location.user.id_usuario }, location));
        }
        const groupedObjects = workers.reduce((result, obj) => {
            (result[obj.id_empresa] = result[obj.id_empresa] || []).push(obj);
            return result;
        }, {});
        Object.values(groupedObjects).forEach((item) => {
            // console.log('id empresa', item[0].user.id_empresa, item);
            socket.broadcast.emit('empresa_' + item[0].user.id_empresa, item);
        });
    });
});
http.listen(3000, () => {
    console.log('Server is listening on port 3000');
});
const corsOptions = {
    origin: '',
    credentials: true, //access-control-allow-credentials:true
    optionSuccessStatus: 200
};
app.use((0, cors_1.default)());
app.use(express_1.default.json({ limit: '25mb' }));
app.use(express_1.default.urlencoded({
    extended: true,
    limit: '25mb'
}));
app.get("/", (req, res) => {
    res.json({ message: "version: 0.4.2" });
});
app.use("/auth", authRouter);
app.use("/events", eventsRouter);
app.use("/inventary", inventaryRouter);
app.use("/workers", workersRouter);
app.use("/clients", clientsRouter);
app.use("/payments", paymentsRouter);
app.use("/reports", reportsRouter);
app.use("/durangeneidad", durangRouter);
/* Error handler middleware */
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    console.error(err.message, err.stack);
    res.status(statusCode).json({ message: err.message });
    return;
});
app.listen(port, () => {
    console.log(`Example app listening at YOUR_IP_INSTANCE:${port}`);
});
