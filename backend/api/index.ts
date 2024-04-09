import express, { Express, Request, Response, Application } from 'express';
import dotenv from 'dotenv';
import cors from 'cors'
const authRouter = require("./routes/auth");
const eventsRouter = require("./routes/events");
const inventaryRouter = require("./routes/inventary");
const workersRouter = require("./routes/workers");
const clientsRouter = require("./routes/clients");
const paymentsRouter = require("./routes/payments"); 
const reportsRouter = require("./routes/reports");
const durangRouter = require("./routes/durangeneidad");

//For env File 
dotenv.config();

const app: Application = express();
const port = process.env.PORT || 8000;

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
    res.json({ message: "version: 0.0.8" });
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
