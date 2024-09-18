import express from "express";
import {
	quesAnswer,
	studentquizAnswers,
	teacherQuizAnswers,
	getQuizAnswer,
} from "../controllers/quizAnswerControll.js";
import { allowTo, protect } from "../middelwars/authMiddelwar.js";
const quizAnswerRouter = express.Router();
quizAnswerRouter.get(
	"/teacherQuizAnswers/:id",
	protect,
	allowTo("teacher"),
	teacherQuizAnswers
);
quizAnswerRouter.get("/quizAnswer/:id", protect, getQuizAnswer);
quizAnswerRouter.use(protect, allowTo("student"));
quizAnswerRouter.post("/asnwer/:id", quesAnswer);

quizAnswerRouter.get("/studentquizAnswers", studentquizAnswers);
export default quizAnswerRouter;
