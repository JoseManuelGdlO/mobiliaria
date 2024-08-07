import express, { Express, Request, Response, Application } from 'express';
import dotenv from 'dotenv';
import cors from 'cors'
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
dotenv.config();

const app: Application = express();
const port = process.env.PORT || 8000;


const http = require('http').Server(app);
const io = require('socket.io')(http);


let workers: any = [];

io.on('connect', (socket: any) => {

  socket.on("location", (arg: any) => {
    const location: any = arg;
    console.log('Location received:', location.user.id_usuario);

    if(location.user.rol_usuario !== 'Repartidor') return
    
    const workerIndex = workers.findIndex((worker: any) => worker.id === location.user.id_usuario);
    if (workerIndex !== -1) {
      workers[workerIndex] = { id: location.user.id_usuario, ...location };
    } else {
      workers.push({ id: location.user.id_usuario, ...location });
    }

    const groupedObjects = workers.reduce((result: any, obj: any) => {
      (result[obj.id_empresa] = result[obj.id_empresa] || []).push(obj);
      return result;
    }, {});

    Object.values(groupedObjects).forEach((item: any) => { 
      console.log('id empresa', item[0].user.id_empresa, item);
      
      socket.broadcast.emit('empresa_'+ item[0].user.id_empresa, item)
    });


  });
});

http.listen(3000, () => {
  console.log('Server is listening on port 3000');
});

const corsOptions = {
    origin: '',
    credentials: true,            //access-control-allow-credentials:true
    optionSuccessStatus: 200
}
app.use(cors());
app.use(express.json({ limit: '25mb' }));
app.use(
    express.urlencoded({
        extended: true,
        limit: '25mb'
    })
);

app.get("/", (req, res) => {
    res.json({ message: "version: 0.3.4" });
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
app.use((err: any, req: any, res: any, next: any) => {
    const statusCode = err.statusCode || 500;
    console.error(err.message, err.stack);
    res.status(statusCode).json({ message: err.message });
    return;
});

app.listen(port, () => {
    console.log(`Example app listening at YOUR_IP_INSTANCE:${port}`);
});
