import quizModel from "../models/quizModel.js";

import errorHandling from "../middelwars/errorHandling.js";
import appError from "../utils/appError.js";
import uniqid from "uniqid";
import response from "../utils/handelResponse.js";

// calculate the quiz score and succes rate handel
const handelQuiz = async (quiz) => {
	quiz.quizScore = quiz.questions.reduce((acc, current) => {
		if (current.Score < 0) {
			current.Score = -current.Score;
		}
		return acc + current.Score;
	}, 0);

	quiz.successRate = quiz.quizScore / 2;
	await quiz.save();
};
// create quiz
export const createQuiz = errorHandling(async (req, res, next) => {
	const teacherId = req.user._id;
	const quizId = uniqid();
	let { questions, expire, quizName } = req.body;
	//check if expire is < 0
	if (expire < 0) expire = -expire;
	if (!questions) return next(new appError("please enter the question", 400));

	// create quiz
	const quiz = await quizModel.create({
		quizName,
		teacherId,
		questions: [],
		expireDate: new Date(Date.now() + expire * 60 * 60 * 1000),
		quizPassword: Date.now() + Math.floor(Math.random() * 1000),
		quizId,
		expire,
	});

	//check if quiz created
	if (!quiz) return next(new appError("quiz not created", 400));

	//check if quiestion from body is array
	if (Array.isArray(questions)) {
		quiz.questions = questions;
	} else {
		quiz.questions.push(questions);
	}
	// calculate the quiz score and success rate of quiz
	await handelQuiz(quiz);

	response(quiz, 201, res);
});
// delete quiz
export const deleteQuiz = errorHandling(async (req, res, next) => {
	const quiz = await quizModel.findOneAndDelete({
		teacherId: req.user._id,
		_id: req.params.id,
	});
	if (!quiz) return next(new appError("quiz not deleted", 400));
	response(null, 200, res);
});
// get quiz by params
export const getQuiz = errorHandling(async (req, res, next) => {
	const quiz = await quizModel.findById(req.params.id);
	if (!quiz) return next(new appError("quiz not found", 404));

	response(quiz, 200, res);
});
//get quiz by password
export const getQuizByPass = errorHandling(async (req, res, next) => {
	const { quizPassword, quizId } = req.body;
	if (!quizPassword || !quizId)
		return next(new appError("please enter the password and Id", 400));
	const quiz = await quizModel.findOne({
		quizId,
		quizPassword,
		expireDate: { $gt: Date.now() },
	});
	if (!quiz) return next(new appError("quiz not found", 404));
	response(quiz, 200, res);
});
// get all quizs
export const allQuizs = errorHandling(async (req, res, next) => {
	const quizs = await quizModel.find({ teacherId: req.user._id });
	if (quizs.length == 0) return next(new appError("no quizs founded", 404));

	response(quizs, 200, res);
});
// delete all quizs
export const deleteQuizs = errorHandling(async (req, res, next) => {
	const quizs = await quizModel.find({ teacherId: req.user._id }).deleteMany();
	if (!quizs) return next(new appError("no quizs founded", 404));
	response(null, 200, res);
});
const filterObj = (obj, ...data) => {
	const updates = {};
	Object.keys(obj).forEach((el) => {
		if (data.includes(el)) updates[el] = obj[el];
	});
	return updates;
};
// update quiz
export const updateQuiz = errorHandling(async (req, res, next) => {
	const update = filterObj(req.body, "expire", "questions");
	let { questions, expire } = req.body;
	if (expire < 0) expire = -expire;
	let quiz = await quizModel.findOne({
		_id: req.params.id,
		teacherId: req.user._id,
	});
	if (!quiz) return next(new appError("quiz not updated", 404));
	// update expireDate if expire in body
	if (update.expire) {
		quiz = await quizModel.findOneAndUpdate(
			{ _id: req.params.id, teacherId: req.user._id },
			{
				expireDate: new Date(
					quiz.expireDate -
						quiz.expire * 60 * 60 * 1000 +
						expire * 60 * 60 * 1000
				),
				expire,
			},
			{ new: true, runValidators: true }
		);
	}
	// update single question if question in body
	else if (update.questions) {
		quiz = await quizModel.findOneAndUpdate(
			{
				_id: req.params.id,
				teacherId: req.user._id,
				questions: { $elemMatch: { _id: questions._id } },
			},
			{
				$set: {
					"questions.$.ques": questions.ques,
					"questions.$.answers": questions.answers,
					"questions.$.Score": questions.Score,
					"questions.$.correctAnswer": questions.correctAnswer,
				},
			},
			{ new: true, runValidators: true }
		);
	}
	await handelQuiz(quiz);
	response(quiz, 200, res);
});
// delete question
export const deleteQues = errorHandling(async (req, res, next) => {
	const { _id } = req.body;

	const quiz = await quizModel.findOneAndUpdate(
		{
			_id: req.params.id,
			teacherId: req.user._id,
		},
		{
			$pull: { questions: { _id } },
		},
		{ new: true, runValidators: true }
	);
	if (!quiz) return next(new appError("ques not found", 400));
	await handelQuiz(quiz);
	response(quiz, 200, res);
});
// add ques
export const addQues = errorHandling(async (req, res, next) => {
	const { questions } = req.body;
	const quiz = await quizModel.findOneAndUpdate(
		{
			_id: req.params.id,
			teacherId: req.user._id,
		},
		{
			$push: { questions },
		},
		{ new: true, runValidators: true }
	);
	await handelQuiz(quiz);
	response(quiz, 200, res);
});
