import express from "express";
const quizRouter = express.Router();
import { allowTo, protect } from "../middelwars/authMiddelwar.js";
import {
	addQues,
	allQuizs,
	createQuiz,
	deleteQues,
	deleteQuiz,
	deleteQuizs,
	getQuiz,
	getQuizByPass,
	updateQuiz,
} from "../controllers/quizControll.js";
quizRouter.use(protect);
quizRouter
	.route("/quiz/:id")
	.get(getQuiz)
	.delete(allowTo("teacher"), deleteQuiz)
	.patch(allowTo("teacher"), updateQuiz);
quizRouter.route("/quiz").post(allowTo("teacher"), createQuiz);
quizRouter.post("/startQuiz", allowTo("student"), getQuizByPass);

// protect all routes after this middelware
quizRouter.use(protect, allowTo("teacher"));
//routes
quizRouter.route("/quiz/all").get(allQuizs).delete(deleteQuizs);
quizRouter.route("/quiz/question/:id").delete(deleteQues).patch(addQues);
export default quizRouter;
