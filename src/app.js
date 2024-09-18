import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import dbConnect from "./db/dataBase.js";

import rateLimit from "express-rate-limit";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import xss from "xss-clean";
import hpp from "hpp";
import cookieParser from "cookie-parser";
dotenv.config();
export const app = express();
// share api with frontEnd
app.use(cors());
// set security http headers
app.use(helmet());

// limit requests
const limiter = rateLimit({
	max: 1000,
	windowMs: 60 * 60 * 1000,
	message: "meny requests for this IP, please try again after one hour",
});
app.use("/api", limiter);
// boody parser , reading data from body into req.body
app.use(express.json());
app.use(cookieParser());

// data sanitize against NoSql query injection
app.use(mongoSanitize());
//data sanitize against XSS
app.use(xss());
// prevent parameter pollution
app.use(hpp());

// Routers

import userRouter from "./routers/userRouter.js";
import quizRouter from "./routers/quizRouter.js";
import quizAnswerRouter from "./routers/quizAnswerRouter.js";
app.use("/api/user", userRouter);
app.use("/api/teacher", quizRouter);
app.use("/api/quiz", quizAnswerRouter);
// handeling routes not found in app
app.all("*", (req, res, next) => {
	res.status(404).json({
		status: "fail",
		message: `this route: ${req.originalUrl} not found in app`,
	});
	next();
});

// global error
import globalError from "./controllers/errorControll.js";

app.use(globalError);
dbConnect();
