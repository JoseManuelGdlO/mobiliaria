import express, { Express, Request, Response, Application } from 'express';
import dotenv from 'dotenv';
import cors from 'cors'
const authRouter = require("./routes/auth");
const eventsRouter = require("./routes/events"); 

//For env File 
dotenv.config();

const app: Application = express();
const port = process.env.PORT || 8000;

const corsOptions = {
    origin: 'http://localhost:4200',
    credentials: true,            //access-control-allow-credentials:true
    optionSuccessStatus: 200
}
app.use(cors(corsOptions));

app.use(express.json({ limit: '25mb' }));
app.use(
    express.urlencoded({
        extended: true,
        limit: '25mb'
    })
);

app.get("/", (req, res) => {
    res.json({ message: "ok" });
});

app.use("/auth", authRouter);
app.use("/events", eventsRouter);
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
