import express from "express";
export const app = express();
import cors from "cors";
import cookieParser from "cookie-parser";
import { errorMiddleware } from "./middleware/error.js";

// body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// cookie parser
app.use(cookieParser());

// cors
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  }),
);
// app.use(cors({ origin: process.env.ORIGIN, credentials: true }));

// routes
app.use("/api/v1", (await import("./routes/index.js")).default);

app.get("/", (req, res) => {
  res.send("backend is up!");
});

app.all("/*path", (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.url} not found on this server`,
  });
});

app.use(errorMiddleware);
