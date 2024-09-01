import express, { Express } from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieparser from "cookie-parser";
import morgan from "morgan";
import dbConnection from "./utils";
import { routeNotFound, errorHandler } from "./middleware/errorMiddleware";

dotenv.config();

const routes = "";

const app: Express = express();
const port = process.env.PORT || 8800;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:3000"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  })
);

app.use(cookieparser());
app.use(morgan("dev"));

// app.use('/api', routes)

app.use(routeNotFound);
app.use(errorHandler);

dbConnection();

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
