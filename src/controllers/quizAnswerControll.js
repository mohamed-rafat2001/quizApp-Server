import quizModel from "../models/quizModel.js";
import quizAnswerModel from "../models/quizAnswerModel.js";

import errorHandling from "../middelwars/errorHandling.js";
import appError from "../utils/appError.js";
import response from "../utils/handelResponse.js";
import Email from "../utils/Email.js";

// questions asnwer
export const quesAnswer = errorHandling(async (req, res, next) => {
	const _id = req.params.id;
	const { questions } = req.body;
	// ckeck if user is student
	if (req.user.role != "student")
		return next(new appError("you not student", 404));
	//find the quiz
	let quiz = await quizModel.findById(_id);
	if (!quiz) return next(new appError("quiz not found", 404));

	// check if student asnwer the quiz or not
	const findStQuizAnswer = await quizAnswerModel.findOne({
		quizId: _id,
		studentId: req.user._id,
	});
	if (findStQuizAnswer)
		return next(new appError("you have answered this quiz", 400));
	const quesAnswer = [];
	if (questions.length == 0)
		return next(new appError("please add answers", 400));
	// check if the asnwers is correct and filter the ques
	questions.forEach((element) => {
		quiz.questions.filter((q) => {
			if (q._id == element._id && q.correctAnswer == element.answer)
				return quesAnswer.push({
					answer: q.correctAnswer,
					Score: q.Score,
					ques: q.ques,
				});
		});
	});
	// calculate the quiz score
	const quizScore = quesAnswer.reduce((acc, current) => {
		if (current.Score < 0) {
			current.Score = -current.Score;
		}
		return acc + current.Score;
	}, 0);
	// create the quiz Answer doc
	const quizAnswer = await quizAnswerModel.create({
		teacherId: quiz.teacherId,
		studentId: req.user._id,
		quizId: quiz._id,
		quesAnswers: [],
		quizScore,
		quizName: quiz.quizName,
		status: quiz.successRate <= quizScore ? true : false,
	});
	quizAnswer.quesAnswers = quesAnswer;
	await quizAnswer.save();
	if (!quizAnswer) return next(new appError("not add asnwers", 400));
	// find how meny pass the quiz
	const studentPassQuiz = await quizAnswerModel.find({
		quizId: quiz._id,
		status: true,
	});
	// find all Quiz answers
	const allQuizAnswers = await quizAnswerModel.find({ quizId: quiz._id });
	//calculate the first student on quiz
	const findBigerScore = allQuizAnswers.reduce((acc, current) => {
		return current.quizScore > acc ? current.quizScore : acc;
	}, 0);
	const firstInQuiz = [];
	allQuizAnswers.filter((el) => {
		if (el.quizScore == findBigerScore)
			return firstInQuiz.push({
				Score: el.quizScore,
				studentId: el.studentId,
			});
	});
	// calculate the total quiz score of asnwers
	const quizToatalScore = allQuizAnswers.reduce((acc, current) => {
		return acc + current.quizScore;
	}, 0);
	// update quiz doc and add [passingNum,numberTookQuiz,averagePassing]
	quiz = await quizModel.findByIdAndUpdate(
		quiz._id,

		{
			$inc: { numberTookQuiz: 1 },
			passingNum: studentPassQuiz.length,
			averagePassing: quizToatalScore / allQuizAnswers.length,
			firstInQuiz,
		},
		{ new: true, runValidators: true }
	);
	if (!quiz) return next(new appError("quiz doc not updated", 400));

	// send email if user is pass the quiz or not
	if (quizAnswer.status == true) {
		await new Email(req.user).passQuizEmail(
			`congratulation ${req.user.name} you pass the quiz:${quiz.quizName} and score is ${quizAnswer.quizScore}`
		);
	} else if (quizAnswer.status == false) {
		await new Email(req.user).passQuizEmail(
			`sorry ${req.user.name} you don't pass the quiz:${quiz.quizName} and score is ${quizAnswer.quizScore}`
		);
	}
	response(quizAnswer, 201, res);
});
// get quiz asnwer by params
export const getQuizAnswer = errorHandling(async (req, res, next) => {
	const _id = req.params.id;
	const QuizAnswer = await quizAnswerModel.findById(_id);
	if (!QuizAnswer) return next(new appError("not founded", 404));
	response(QuizAnswer, 200, res);
});
// get all quizs asnwers for student
export const studentquizAnswers = errorHandling(async (req, res, next) => {
	const QuizAnswers = await quizAnswerModel.find({ studentId: req.user._id });
	if (QuizAnswers.length == 0) return next(new appError("not quizs yet", 404));
	response(QuizAnswers, 200, res);
});
// get all quizs asnwers for teacher quiz
export const teacherQuizAnswers = errorHandling(async (req, res, next) => {
	const QuizAnswers = await quizAnswerModel.find({
		teacherId: req.user._id,
		quizId: req.params.id,
	});
	if (QuizAnswers.length == 0) return next(new appError("no answers yet", 404));
	response(QuizAnswers, 200, res);
});
