import mongoose from "mongoose"; // Erase if already required

// Declare the Schema of the Mongo model
const quizAnswerSchema = new mongoose.Schema(
	{
		studentId: {
			type: mongoose.Schema.ObjectId,
			ref: "UserModel",
		},
		teacherId: {
			type: mongoose.Schema.ObjectId,
			ref: "UserModel",
		},
		quizId: {
			type: mongoose.Schema.ObjectId,
			ref: "QuizModel",
		},
		quizName: String,
		quesAnswers: [
			{
				ques: String,
				correctAsnwer: String,
				Score: Number,
			},
		],
		quizScore: Number,
		status: Boolean,
	},
	{ timestamps: true }
);

//Export the model
export default mongoose.model("QuizAnswerModel", quizAnswerSchema);
